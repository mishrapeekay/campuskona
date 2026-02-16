"""
Platform Finance Services
=========================
Business logic for investor metrics, financial segregation, and audit trail
"""

from decimal import Decimal
from datetime import datetime, timedelta, date
from django.db import transaction
from django.db.models import Sum, Count, Q, F, Avg
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.tenants.models import School as Tenant
from apps.tenants.models import Subscription
from .models import (
    InvestorMetric, MarketingSpend, FinancialLedger, 
    FinancialSnapshot, AuditLog, InvestorProfile
)

User = get_user_model()


class InvestorMetricsService:
    """Calculate and store investor dashboard metrics"""
    
    @staticmethod
    def calculate_mrr():
        """Calculate Monthly Recurring Revenue from all active subscriptions"""
        active_subscriptions = Subscription.objects.filter(
            status='ACTIVE',
            end_date__gte=timezone.now().date()
        )
        
        total_mrr = Decimal('0.00')
        
        for sub in active_subscriptions:
            # Convert subscription to monthly equivalent
            if sub.billing_cycle == 'MONTHLY':
                total_mrr += sub.amount
            elif sub.billing_cycle == 'QUARTERLY':
                total_mrr += sub.amount / 3
            elif sub.billing_cycle == 'HALF_YEARLY':
                total_mrr += sub.amount / 6
            elif sub.billing_cycle == 'YEARLY':
                total_mrr += sub.amount / 12
        
        return total_mrr
    
    @staticmethod
    def calculate_churn_rate(period_days=30):
        """Calculate churn rate for the given period"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=period_days)
        
        # Total schools at start of period
        total_at_start = Subscription.objects.filter(
            start_date__lt=start_date
        ).values('tenant').distinct().count()
        
        if total_at_start == 0:
            return Decimal('0.00')
        
        # Schools that churned during period
        churned = Subscription.objects.filter(
            status='EXPIRED',
            end_date__gte=start_date,
            end_date__lt=end_date
        ).values('tenant').distinct().count()
        
        churn_rate = (Decimal(churned) / Decimal(total_at_start)) * 100
        return round(churn_rate, 2)
    
    @staticmethod
    def calculate_cac(month=None):
        """Calculate Customer Acquisition Cost for given month"""
        if month is None:
            month = timezone.now().date().replace(day=1)
        
        # Get marketing spend for the month
        try:
            spend = MarketingSpend.objects.get(month=month)
            total_spend = spend.total_spend
        except MarketingSpend.DoesNotExist:
            total_spend = Decimal('0.00')
        
        # Count new schools acquired in that month
        new_schools = Subscription.objects.filter(
            start_date__year=month.year,
            start_date__month=month.month
        ).values('tenant').distinct().count()
        
        if new_schools == 0:
            return Decimal('0.00')
        
        cac = total_spend / new_schools
        return round(cac, 2)
    
    @staticmethod
    def calculate_ltv():
        """Calculate Lifetime Value per school"""
        # Get all completed subscriptions
        completed_subs = Subscription.objects.filter(
            status__in=['ACTIVE', 'EXPIRED']
        )
        
        # Total revenue from subscriptions
        total_revenue = completed_subs.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        # Unique schools
        unique_schools = completed_subs.values('tenant').distinct().count()
        
        if unique_schools == 0:
            return Decimal('0.00')
        
        ltv = total_revenue / unique_schools
        return round(ltv, 2)
    
    @staticmethod
    def get_region_distribution():
        """Get state-wise school distribution"""
        tenants = Tenant.objects.filter(is_active=True)
        
        distribution = {}
        for tenant in tenants:
            state = tenant.state or 'Unknown'
            distribution[state] = distribution.get(state, 0) + 1
        
        return distribution
    
    @staticmethod
    def get_tier_distribution():
        """Get subscription tier distribution"""
        active_subs = Subscription.objects.filter(
            status='ACTIVE',
            end_date__gte=timezone.now().date()
        )
        
        distribution = {}
        for sub in active_subs:
            tier = sub.tier.name if sub.tier else 'Unknown'
            distribution[tier] = distribution.get(tier, 0) + 1
        
        return distribution
    
    @staticmethod
    @transaction.atomic
    def create_daily_snapshot(snapshot_date=None):
        """Create daily snapshot of all metrics"""
        if snapshot_date is None:
            snapshot_date = timezone.now().date()
        
        # Check if snapshot already exists
        if InvestorMetric.objects.filter(snapshot_date=snapshot_date).exists():
            return InvestorMetric.objects.get(snapshot_date=snapshot_date)
        
        # Calculate all metrics
        mrr = InvestorMetricsService.calculate_mrr()
        churn_rate = InvestorMetricsService.calculate_churn_rate()
        cac = InvestorMetricsService.calculate_cac()
        ltv = InvestorMetricsService.calculate_ltv()
        
        # School counts
        total_schools = Tenant.objects.filter(is_active=True).count()
        active_schools = Subscription.objects.filter(
            status='ACTIVE',
            end_date__gte=snapshot_date
        ).values('tenant').distinct().count()
        
        # New schools this month
        month_start = snapshot_date.replace(day=1)
        new_schools = Subscription.objects.filter(
            start_date__gte=month_start,
            start_date__lte=snapshot_date
        ).values('tenant').distinct().count()
        
        # Churned schools this month
        churned_schools = Subscription.objects.filter(
            status='EXPIRED',
            end_date__gte=month_start,
            end_date__lte=snapshot_date
        ).values('tenant').distinct().count()
        
        # Growth rate (compare to last month)
        last_month = snapshot_date - timedelta(days=30)
        try:
            last_metric = InvestorMetric.objects.filter(
                snapshot_date__lte=last_month
            ).order_by('-snapshot_date').first()
            
            if last_metric and last_metric.active_schools > 0:
                growth_rate = ((active_schools - last_metric.active_schools) / 
                              last_metric.active_schools) * 100
            else:
                growth_rate = Decimal('0.00')
        except:
            growth_rate = Decimal('0.00')
        
        # Create snapshot
        snapshot = InvestorMetric.objects.create(
            snapshot_date=snapshot_date,
            mrr=mrr,
            total_schools=total_schools,
            active_schools=active_schools,
            new_schools_this_month=new_schools,
            churned_schools_this_month=churned_schools,
            churn_rate=churn_rate,
            growth_rate=round(growth_rate, 2),
            cac=cac,
            ltv=ltv,
            region_distribution=InvestorMetricsService.get_region_distribution(),
            tier_distribution=InvestorMetricsService.get_tier_distribution(),
        )
        
        return snapshot
    
    @staticmethod
    def get_trend_data(days=90):
        """Get historical trend data for charts"""
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        metrics = InvestorMetric.objects.filter(
            snapshot_date__gte=start_date,
            snapshot_date__lte=end_date
        ).order_by('snapshot_date')
        
        return [
            {
                'date': m.snapshot_date.strftime('%b %Y'),
                'mrr': float(m.mrr),
                'arr': float(m.arr),
                'schools': m.active_schools,
                'churn_rate': float(m.churn_rate),
                'growth_rate': float(m.growth_rate),
            }
            for m in metrics
        ]


class FinancialSegregationService:
    """Handle financial segregation and ledger entries"""
    
    @staticmethod
    @transaction.atomic
    def record_platform_revenue(amount, transaction_type, description, 
                                tenant_schema=None, reference_id=None, 
                                metadata=None, user=None):
        """Record platform revenue in ledger"""
        return FinancialLedger.objects.create(
            transaction_type=transaction_type,
            category='PLATFORM_REVENUE',
            amount=amount,
            tenant_schema=tenant_schema or '',
            reference_type='Subscription',
            reference_id=reference_id,
            description=description,
            metadata=metadata or {},
            created_by=user,
        )
    
    @staticmethod
    @transaction.atomic
    def record_school_collection(amount, tenant_schema, description, 
                                 reference_id=None, metadata=None, user=None):
        """Record school fee collection (pass-through)"""
        return FinancialLedger.objects.create(
            transaction_type='SCHOOL_FEE_COLLECTION',
            category='SCHOOL_COLLECTION',
            amount=amount,
            tenant_schema=tenant_schema,
            reference_type='FeePayment',
            reference_id=reference_id,
            description=description,
            metadata=metadata or {},
            created_by=user,
        )
    
    @staticmethod
    @transaction.atomic
    def record_partner_commission(amount, description, reference_id=None, 
                                  metadata=None, user=None):
        """Record partner commission payout"""
        return FinancialLedger.objects.create(
            transaction_type='PARTNER_COMMISSION',
            category='PARTNER_PAYOUT',
            amount=amount,
            reference_type='Commission',
            reference_id=reference_id,
            description=description,
            metadata=metadata or {},
            created_by=user,
        )
    
    @staticmethod
    @transaction.atomic
    def record_investor_payout(amount, description, reference_id=None, 
                              metadata=None, user=None):
        """Record investor dividend/payout"""
        return FinancialLedger.objects.create(
            transaction_type='INVESTOR_DIVIDEND',
            category='INVESTOR_PAYOUT',
            amount=amount,
            reference_type='InvestorPayout',
            reference_id=reference_id,
            description=description,
            metadata=metadata or {},
            created_by=user,
        )
    
    @staticmethod
    @transaction.atomic
    def record_platform_expense(amount, transaction_type, description, 
                               metadata=None, user=None):
        """Record platform operating expense"""
        return FinancialLedger.objects.create(
            transaction_type=transaction_type,
            category='PLATFORM_EXPENSE',
            amount=amount,
            description=description,
            metadata=metadata or {},
            created_by=user,
        )
    
    @staticmethod
    def verify_ledger_integrity():
        """Verify the integrity of the entire ledger chain"""
        entries = FinancialLedger.objects.order_by('sequence_number')
        
        errors = []
        previous_hash = ''
        
        for entry in entries:
            # Check if previous hash matches
            if entry.previous_hash != previous_hash:
                errors.append({
                    'sequence': entry.sequence_number,
                    'error': 'Previous hash mismatch',
                    'expected': previous_hash,
                    'actual': entry.previous_hash,
                })
            
            # Verify current hash
            if not entry.verify_chain():
                errors.append({
                    'sequence': entry.sequence_number,
                    'error': 'Current hash verification failed',
                })
            
            previous_hash = entry.current_hash
        
        return {
            'is_valid': len(errors) == 0,
            'total_entries': entries.count(),
            'errors': errors,
        }
    
    @staticmethod
    @transaction.atomic
    def create_daily_snapshot(snapshot_date=None):
        """Create daily financial snapshot"""
        if snapshot_date is None:
            snapshot_date = timezone.now().date()
        
        # Check if snapshot already exists
        if FinancialSnapshot.objects.filter(snapshot_date=snapshot_date).exists():
            return FinancialSnapshot.objects.get(snapshot_date=snapshot_date)
        
        # Calculate aggregates
        month_start = snapshot_date.replace(day=1)
        year_start = snapshot_date.replace(month=1, day=1)
        
        # Platform Revenue
        platform_revenue_total = FinancialLedger.objects.filter(
            category='PLATFORM_REVENUE',
            created_at__lte=snapshot_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        platform_revenue_mtd = FinancialLedger.objects.filter(
            category='PLATFORM_REVENUE',
            created_at__gte=month_start,
            created_at__lte=snapshot_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        platform_revenue_ytd = FinancialLedger.objects.filter(
            category='PLATFORM_REVENUE',
            created_at__gte=year_start,
            created_at__lte=snapshot_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # School Collections
        school_collections_total = FinancialLedger.objects.filter(
            category='SCHOOL_COLLECTION',
            created_at__lte=snapshot_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        school_collections_mtd = FinancialLedger.objects.filter(
            category='SCHOOL_COLLECTION',
            created_at__gte=month_start,
            created_at__lte=snapshot_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Partner Commissions
        partner_commissions_paid = FinancialLedger.objects.filter(
            category='PARTNER_PAYOUT',
            created_at__lte=snapshot_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Investor Payouts
        investor_payouts_total = FinancialLedger.objects.filter(
            category='INVESTOR_PAYOUT',
            created_at__lte=snapshot_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        investor_payouts_ytd = FinancialLedger.objects.filter(
            category='INVESTOR_PAYOUT',
            created_at__gte=year_start,
            created_at__lte=snapshot_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Platform Expenses
        platform_expenses_total = FinancialLedger.objects.filter(
            category='PLATFORM_EXPENSE',
            created_at__lte=snapshot_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        platform_expenses_mtd = FinancialLedger.objects.filter(
            category='PLATFORM_EXPENSE',
            created_at__gte=month_start,
            created_at__lte=snapshot_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Calculate net metrics
        gross_profit = platform_revenue_total - platform_expenses_total
        net_profit = gross_profit - partner_commissions_paid - investor_payouts_total
        
        # Get last ledger entry
        last_entry = FinancialLedger.objects.order_by('-sequence_number').first()
        
        # Create snapshot
        snapshot = FinancialSnapshot.objects.create(
            snapshot_date=snapshot_date,
            platform_revenue_total=platform_revenue_total,
            platform_revenue_mtd=platform_revenue_mtd,
            platform_revenue_ytd=platform_revenue_ytd,
            school_collections_total=school_collections_total,
            school_collections_mtd=school_collections_mtd,
            partner_commissions_paid=partner_commissions_paid,
            investor_payouts_total=investor_payouts_total,
            investor_payouts_ytd=investor_payouts_ytd,
            platform_expenses_total=platform_expenses_total,
            platform_expenses_mtd=platform_expenses_mtd,
            gross_profit=gross_profit,
            net_profit=net_profit,
            ledger_entries_count=FinancialLedger.objects.count(),
            last_ledger_sequence=last_entry.sequence_number if last_entry else 0,
        )
        
        return snapshot


class AuditService:
    """Handle audit logging"""
    
    @staticmethod
    def log_action(user, action, model_name, object_id, object_repr, 
                  changes=None, request=None):
        """Create audit log entry"""
        log_data = {
            'user': user,
            'user_email': user.email,
            'user_role': getattr(user, 'role', 'Unknown'),
            'action': action,
            'model_name': model_name,
            'object_id': str(object_id),
            'object_repr': object_repr,
            'changes': changes or {},
        }
        
        if request:
            log_data.update({
                'ip_address': AuditService.get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'request_path': request.path,
                'request_method': request.method,
            })
        
        return AuditLog.objects.create(**log_data)
    
    @staticmethod
    def get_client_ip(request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @staticmethod
    def get_audit_trail(model_name=None, object_id=None, user=None, 
                       start_date=None, end_date=None):
        """Get filtered audit trail"""
        queryset = AuditLog.objects.all()
        
        if model_name:
            queryset = queryset.filter(model_name=model_name)
        
        if object_id:
            queryset = queryset.filter(object_id=str(object_id))
        
        if user:
            queryset = queryset.filter(user=user)
        
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset.order_by('-timestamp')
