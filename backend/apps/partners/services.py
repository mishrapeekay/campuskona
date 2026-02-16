"""
Partner Commission Service

Business logic for commission calculation, lead tracking, and payout processing.
"""

from decimal import Decimal
from datetime import date, timedelta
from django.db import transaction
from django.utils import timezone
from django.db.models import Sum, Count, Q

from .models import Partner, Lead, Commission, CommissionRule, Payout
from apps.tenants.models import School, SubscriptionBilling


class CommissionCalculationService:
    """
    Service for calculating partner commissions based on rules.
    """
    
    @staticmethod
    def calculate_commission(lead, school, subscription_billing):
        """
        Calculate commission for a converted lead.
        
        Args:
            lead: Lead instance
            school: School instance (converted)
            subscription_billing: SubscriptionBilling instance
            
        Returns:
            Commission instance
        """
        partner = lead.partner
        
        # Find applicable commission rule
        rule = CommissionCalculationService._find_applicable_rule(
            partner,
            school.subscription.tier
        )
        
        if not rule:
            # Fallback to partner's default commission structure
            commission_amount = CommissionCalculationService._calculate_default_commission(
                partner,
                subscription_billing.amount
            )
        else:
            commission_amount = CommissionCalculationService._apply_rule(
                rule,
                subscription_billing.amount
            )
        
        # Create commission record
        commission = Commission.objects.create(
            partner=partner,
            lead=lead,
            school=school,
            subscription_amount=subscription_billing.amount,
            commission_amount=commission_amount,
            commission_rule=rule,
            commission_type='INITIAL',
            status='PENDING'
        )
        
        # Update partner statistics
        partner.total_commission_earned += commission_amount
        partner.save()
        
        # Create recurring commissions if applicable
        if rule and rule.recurring_months > 0:
            CommissionCalculationService._create_recurring_commissions(
                commission,
                rule,
                subscription_billing
            )
        
        return commission
    
    @staticmethod
    def _find_applicable_rule(partner, subscription_tier):
        """Find the most applicable commission rule."""
        today = timezone.now().date()
        
        # Priority order:
        # 1. Partner-specific rule for tier
        # 2. Partner-specific rule (any tier)
        # 3. Global rule for tier
        # 4. Global rule (any tier)
        
        rules = CommissionRule.objects.filter(
            Q(partner=partner) | Q(partner__isnull=True),
            is_active=True
        ).filter(
            Q(valid_from__isnull=True) | Q(valid_from__lte=today)
        ).filter(
            Q(valid_until__isnull=True) | Q(valid_until__gte=today)
        ).order_by('-priority', '-created_at')
        
        # Try to find tier-specific rule first
        tier_rule = rules.filter(subscription_tier=subscription_tier).first()
        if tier_rule:
            return tier_rule
        
        # Fallback to general rule
        return rules.filter(subscription_tier='').first()
    
    @staticmethod
    def _calculate_default_commission(partner, subscription_amount):
        """Calculate commission using partner's default settings."""
        if partner.commission_type == 'PERCENTAGE':
            return (subscription_amount * partner.commission_rate) / 100
        elif partner.commission_type == 'FLAT':
            return partner.flat_commission_amount
        else:  # TIERED
            # Implement tiered logic based on partner's total conversions
            # For now, use percentage
            return (subscription_amount * partner.commission_rate) / 100
    
    @staticmethod
    def _apply_rule(rule, subscription_amount):
        """Apply commission rule to calculate amount."""
        if rule.calculation_type == 'PERCENTAGE':
            return (subscription_amount * rule.commission_percentage) / 100
        elif rule.calculation_type == 'FLAT':
            return rule.flat_amount
        elif rule.calculation_type == 'PERCENTAGE_RECURRING':
            return (subscription_amount * rule.commission_percentage) / 100
        
        return Decimal('0.00')
    
    @staticmethod
    def _create_recurring_commissions(initial_commission, rule, subscription_billing):
        """Create recurring commission records for future months."""
        partner = initial_commission.partner
        lead = initial_commission.lead
        school = initial_commission.school
        
        # Calculate monthly amount (assuming yearly subscription)
        monthly_amount = subscription_billing.amount / 12
        
        for month in range(1, rule.recurring_months + 1):
            period_start = subscription_billing.period_start + timedelta(days=30 * month)
            period_end = period_start + timedelta(days=30)
            
            commission_amount = CommissionCalculationService._apply_rule(
                rule,
                monthly_amount
            )
            
            Commission.objects.create(
                partner=partner,
                lead=lead,
                school=school,
                subscription_amount=monthly_amount,
                commission_amount=commission_amount,
                commission_rule=rule,
                commission_type='RECURRING',
                period_start=period_start,
                period_end=period_end,
                status='PENDING'
            )


class LeadManagementService:
    """
    Service for managing leads and conversions.
    """
    
    @staticmethod
    def submit_lead(partner_code, lead_data):
        """
        Submit a new lead from a partner.
        
        Args:
            partner_code: Partner's unique code
            lead_data: Dictionary with lead information
            
        Returns:
            Lead instance
        """
        try:
            partner = Partner.objects.get(partner_code=partner_code, status='ACTIVE')
        except Partner.DoesNotExist:
            raise ValueError(f"Invalid or inactive partner code: {partner_code}")
        
        # Check for duplicate leads (same email)
        existing_lead = Lead.objects.filter(
            email=lead_data['email']
        ).first()
        
        if existing_lead:
            raise ValueError(f"Lead with email {lead_data['email']} already exists")
        
        # Create lead
        lead = Lead.objects.create(
            partner=partner,
            school_name=lead_data['school_name'],
            contact_person=lead_data['contact_person'],
            email=lead_data['email'],
            phone=lead_data['phone'],
            city=lead_data.get('city', ''),
            state=lead_data.get('state', ''),
            estimated_students=lead_data.get('estimated_students'),
            board=lead_data.get('board', ''),
            notes=lead_data.get('notes', ''),
            status='NEW'
        )
        
        # Update partner statistics
        partner.total_leads += 1
        partner.save()
        
        return lead
    
    @staticmethod
    @transaction.atomic
    def convert_lead(lead_id, school_id):
        """
        Mark a lead as converted and calculate commission.
        
        Args:
            lead_id: UUID of the lead
            school_id: UUID of the converted school
            
        Returns:
            Commission instance
        """
        lead = Lead.objects.select_for_update().get(id=lead_id)
        school = School.objects.get(id=school_id)
        
        if lead.status == 'CONVERTED':
            raise ValueError("Lead is already converted")
        
        # Mark lead as converted
        lead.mark_as_converted(school)
        
        # Get the latest subscription billing for this school
        subscription_billing = SubscriptionBilling.objects.filter(
            school=school,
            status='SUCCESS'
        ).order_by('-billing_date').first()
        
        if not subscription_billing:
            raise ValueError("No successful subscription billing found for this school")
        
        # Calculate and create commission
        commission = CommissionCalculationService.calculate_commission(
            lead,
            school,
            subscription_billing
        )
        
        return commission
    
    @staticmethod
    def get_lead_statistics(partner_id=None, start_date=None, end_date=None):
        """
        Get lead statistics for reporting.
        
        Args:
            partner_id: Optional partner UUID to filter
            start_date: Optional start date
            end_date: Optional end date
            
        Returns:
            Dictionary with statistics
        """
        queryset = Lead.objects.all()
        
        if partner_id:
            queryset = queryset.filter(partner_id=partner_id)
        
        if start_date:
            queryset = queryset.filter(submitted_date__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(submitted_date__lte=end_date)
        
        stats = queryset.aggregate(
            total_leads=Count('id'),
            converted_leads=Count('id', filter=Q(status='CONVERTED')),
            lost_leads=Count('id', filter=Q(status='LOST')),
            active_leads=Count('id', filter=Q(status__in=['NEW', 'CONTACTED', 'DEMO_SCHEDULED', 'DEMO_COMPLETED', 'NEGOTIATION']))
        )
        
        # Calculate conversion rate
        if stats['total_leads'] > 0:
            stats['conversion_rate'] = round(
                (stats['converted_leads'] / stats['total_leads']) * 100,
                2
            )
        else:
            stats['conversion_rate'] = 0
        
        return stats


class PayoutService:
    """
    Service for processing partner payouts.
    """
    
    @staticmethod
    def generate_payout_number():
        """Generate unique payout number."""
        today = timezone.now()
        prefix = f"PAY-{today.year}-{today.month:02d}"
        
        # Get last payout number for this month
        last_payout = Payout.objects.filter(
            payout_number__startswith=prefix
        ).order_by('-payout_number').first()
        
        if last_payout:
            # Extract sequence number and increment
            last_seq = int(last_payout.payout_number.split('-')[-1])
            new_seq = last_seq + 1
        else:
            new_seq = 1
        
        return f"{prefix}-{new_seq:03d}"
    
    @staticmethod
    @transaction.atomic
    def create_payout(partner_id, period_start, period_end, tds_percentage=10, created_by=None):
        """
        Create a payout for approved commissions.
        
        Args:
            partner_id: UUID of the partner
            period_start: Start date of payout period
            period_end: End date of payout period
            tds_percentage: TDS percentage to deduct
            created_by: User creating the payout
            
        Returns:
            Payout instance
        """
        partner = Partner.objects.get(id=partner_id)
        
        # Get all approved commissions for this partner in the period
        commissions = Commission.objects.filter(
            partner=partner,
            status='APPROVED',
            earned_date__gte=period_start,
            earned_date__lte=period_end
        )
        
        if not commissions.exists():
            raise ValueError("No approved commissions found for this period")
        
        # Calculate total amount
        total_amount = commissions.aggregate(
            total=Sum('commission_amount')
        )['total'] or Decimal('0.00')
        
        # Create payout
        payout = Payout.objects.create(
            partner=partner,
            payout_number=PayoutService.generate_payout_number(),
            total_amount=total_amount,
            commission_count=commissions.count(),
            period_start=period_start,
            period_end=period_end,
            tds_percentage=tds_percentage,
            status='PENDING',
            created_by=created_by
        )
        
        # Calculate TDS
        payout.calculate_tds()
        
        # Link commissions to payout (but don't mark as paid yet)
        commissions.update(payout=payout)
        
        return payout
    
    @staticmethod
    def get_pending_commissions(partner_id=None):
        """
        Get all approved commissions pending payout.
        
        Args:
            partner_id: Optional partner UUID to filter
            
        Returns:
            QuerySet of Commission objects
        """
        queryset = Commission.objects.filter(
            status='APPROVED',
            payout__isnull=True
        ).select_related('partner', 'lead', 'school')
        
        if partner_id:
            queryset = queryset.filter(partner_id=partner_id)
        
        return queryset
    
    @staticmethod
    def get_payout_summary(partner_id=None, year=None):
        """
        Get payout summary for reporting.
        
        Args:
            partner_id: Optional partner UUID to filter
            year: Optional year to filter
            
        Returns:
            Dictionary with payout summary
        """
        queryset = Payout.objects.all()
        
        if partner_id:
            queryset = queryset.filter(partner_id=partner_id)
        
        if year:
            queryset = queryset.filter(created_at__year=year)
        
        summary = queryset.aggregate(
            total_payouts=Count('id'),
            total_amount=Sum('total_amount'),
            total_tds=Sum('tds_amount'),
            total_net_amount=Sum('net_amount'),
            completed_payouts=Count('id', filter=Q(status='COMPLETED')),
            pending_payouts=Count('id', filter=Q(status='PENDING'))
        )
        
        return summary
