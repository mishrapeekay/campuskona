"""
Partner Commission Views

REST API views for partner commission tracking.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Partner, Lead, Commission, CommissionRule, Payout
from .serializers import (
    PartnerSerializer, PartnerListSerializer,
    LeadSerializer, LeadSubmissionSerializer, LeadConversionSerializer,
    CommissionSerializer, CommissionApprovalSerializer,
    CommissionRuleSerializer,
    PayoutSerializer, PayoutCreateSerializer, PayoutProcessSerializer,
    PartnerStatisticsSerializer, LeadStatisticsSerializer, PayoutSummarySerializer
)
from .services import (
    CommissionCalculationService,
    LeadManagementService,
    PayoutService
)
from .reports import PayoutReportGenerator
from apps.core.permissions import IsSuperAdmin, IsSalesTeam


class PartnerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing partners.
    """
    queryset = Partner.objects.all()
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PartnerListSerializer
        return PartnerSerializer
    
    def get_queryset(self):
        queryset = Partner.objects.all()
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Search by name or code
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(partner_code__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get detailed statistics for a partner."""
        partner = self.get_object()
        
        # Lead statistics
        lead_stats = LeadManagementService.get_lead_statistics(partner_id=partner.id)
        
        # Commission statistics
        commission_stats = Commission.objects.filter(partner=partner).aggregate(
            total_commissions=Count('id'),
            pending_commissions=Count('id', filter=Q(status='PENDING')),
            approved_commissions=Count('id', filter=Q(status='APPROVED')),
            paid_commissions=Count('id', filter=Q(status='PAID')),
            total_earned=Sum('commission_amount'),
            total_paid=Sum('commission_amount', filter=Q(status='PAID'))
        )
        
        # Payout statistics
        payout_stats = Payout.objects.filter(partner=partner).aggregate(
            total_payouts=Count('id'),
            completed_payouts=Count('id', filter=Q(status='COMPLETED')),
            total_payout_amount=Sum('net_amount', filter=Q(status='COMPLETED'))
        )
        
        return Response({
            'partner': PartnerSerializer(partner).data,
            'leads': lead_stats,
            'commissions': commission_stats,
            'payouts': payout_stats
        })
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get overall partner program dashboard statistics."""
        # Partner statistics
        partner_stats = Partner.objects.aggregate(
            total_partners=Count('id'),
            active_partners=Count('id', filter=Q(status='ACTIVE')),
            total_leads=Sum('total_leads'),
            converted_leads=Sum('total_conversions'),
            total_commission_earned=Sum('total_commission_earned'),
            total_commission_paid=Sum('total_commission_paid')
        )
        
        # Calculate conversion rate
        if partner_stats['total_leads'] and partner_stats['total_leads'] > 0:
            partner_stats['conversion_rate'] = round(
                (partner_stats['converted_leads'] / partner_stats['total_leads']) * 100,
                2
            )
        else:
            partner_stats['conversion_rate'] = 0
        
        # Calculate pending commission
        partner_stats['pending_commission'] = (
            partner_stats['total_commission_earned'] - partner_stats['total_commission_paid']
        )
        
        # Recent activity
        recent_leads = Lead.objects.order_by('-submitted_date')[:10]
        recent_conversions = Lead.objects.filter(
            status='CONVERTED'
        ).order_by('-conversion_date')[:10]
        
        return Response({
            'statistics': PartnerStatisticsSerializer(partner_stats).data,
            'recent_leads': LeadSerializer(recent_leads, many=True).data,
            'recent_conversions': LeadSerializer(recent_conversions, many=True).data
        })


class LeadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing leads.
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Lead.objects.select_related(
            'partner', 'converted_school', 'assigned_to'
        )
        
        # Filter by partner
        partner_id = self.request.query_params.get('partner_id')
        if partner_id:
            queryset = queryset.filter(partner_id=partner_id)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by assigned user
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(school_name__icontains=search) |
                Q(contact_person__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        
        return queryset.order_by('-submitted_date')
    
    @action(detail=False, methods=['post'], permission_classes=[])
    def submit(self, request):
        """
        Public endpoint for partners to submit leads.
        No authentication required - uses partner_code for validation.
        """
        serializer = LeadSubmissionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            lead = LeadManagementService.submit_lead(
                partner_code=serializer.validated_data['partner_code'],
                lead_data=serializer.validated_data
            )
            return Response(
                LeadSerializer(lead).data,
                status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def convert(self, request, pk=None):
        """Convert a lead to a school."""
        lead = self.get_object()
        serializer = LeadConversionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            commission = LeadManagementService.convert_lead(
                lead_id=lead.id,
                school_id=serializer.validated_data['school_id']
            )
            return Response({
                'lead': LeadSerializer(lead).data,
                'commission': CommissionSerializer(commission).data
            })
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """Assign lead to a sales person."""
        lead = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lead.assigned_to_id = user_id
        lead.save()
        
        return Response(LeadSerializer(lead).data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update lead status."""
        lead = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status or new_status not in dict(Lead.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        lead.status = new_status
        
        # Update last contacted date if status changed to CONTACTED
        if new_status == 'CONTACTED':
            lead.last_contacted_date = timezone.now()
        
        # Handle lost leads
        if new_status == 'LOST':
            lead.lost_reason = request.data.get('lost_reason', '')
            lead.lost_notes = request.data.get('lost_notes', '')
        
        lead.save()
        
        return Response(LeadSerializer(lead).data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get lead statistics."""
        partner_id = request.query_params.get('partner_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Parse dates if provided
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        stats = LeadManagementService.get_lead_statistics(
            partner_id=partner_id,
            start_date=start_date,
            end_date=end_date
        )
        
        return Response(LeadStatisticsSerializer(stats).data)


class CommissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing commissions.
    """
    queryset = Commission.objects.all()
    serializer_class = CommissionSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get_queryset(self):
        queryset = Commission.objects.select_related(
            'partner', 'lead', 'school', 'commission_rule', 'payout'
        )
        
        # Filter by partner
        partner_id = self.request.query_params.get('partner_id')
        if partner_id:
            queryset = queryset.filter(partner_id=partner_id)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by commission type
        commission_type = self.request.query_params.get('commission_type')
        if commission_type:
            queryset = queryset.filter(commission_type=commission_type)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(earned_date__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(earned_date__lte=end_date)
        
        return queryset.order_by('-earned_date')
    
    @action(detail=False, methods=['post'])
    def approve_bulk(self, request):
        """Approve multiple commissions."""
        serializer = CommissionApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        commission_ids = serializer.validated_data['commission_ids']
        commissions = Commission.objects.filter(
            id__in=commission_ids,
            status='PENDING'
        )
        
        approved_count = 0
        for commission in commissions:
            commission.approve()
            approved_count += 1
        
        return Response({
            'approved_count': approved_count,
            'message': f'{approved_count} commissions approved successfully'
        })
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a single commission."""
        commission = self.get_object()
        
        if commission.status != 'PENDING':
            return Response(
                {'error': 'Only pending commissions can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        commission.approve()
        
        return Response(CommissionSerializer(commission).data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending commissions."""
        partner_id = request.query_params.get('partner_id')
        commissions = PayoutService.get_pending_commissions(partner_id=partner_id)
        
        serializer = CommissionSerializer(commissions, many=True)
        return Response(serializer.data)


class CommissionRuleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing commission rules.
    """
    queryset = CommissionRule.objects.all()
    serializer_class = CommissionRuleSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get_queryset(self):
        queryset = CommissionRule.objects.select_related('partner')
        
        # Filter by partner
        partner_id = self.request.query_params.get('partner_id')
        if partner_id:
            queryset = queryset.filter(partner_id=partner_id)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.order_by('-priority', '-created_at')


class PayoutViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing payouts.
    """
    queryset = Payout.objects.all()
    serializer_class = PayoutSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get_queryset(self):
        queryset = Payout.objects.select_related('partner', 'created_by')
        
        # Filter by partner
        partner_id = self.request.query_params.get('partner_id')
        if partner_id:
            queryset = queryset.filter(partner_id=partner_id)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by year
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(created_at__year=year)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def create_payout(self, request):
        """Create a new payout from approved commissions."""
        serializer = PayoutCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            payout = PayoutService.create_payout(
                partner_id=serializer.validated_data['partner_id'],
                period_start=serializer.validated_data['period_start'],
                period_end=serializer.validated_data['period_end'],
                tds_percentage=serializer.validated_data.get('tds_percentage', 10),
                created_by=request.user
            )
            return Response(
                PayoutSerializer(payout).data,
                status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Process a payout and mark commissions as paid."""
        payout = self.get_object()
        
        if payout.status != 'PENDING':
            return Response(
                {'error': 'Only pending payouts can be processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PayoutProcessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Update payout details
        payout.payment_method = serializer.validated_data['payment_method']
        payout.transaction_reference = serializer.validated_data.get('transaction_reference', '')
        payout.notes = serializer.validated_data.get('notes', '')
        payout.save()
        
        # Process payout
        success = payout.process_payout()
        
        if success:
            return Response(PayoutSerializer(payout).data)
        else:
            return Response(
                {'error': 'Failed to process payout'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def commissions(self, request, pk=None):
        """Get all commissions included in this payout."""
        payout = self.get_object()
        commissions = payout.commissions.all()
        
        serializer = CommissionSerializer(commissions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get payout summary statistics."""
        partner_id = request.query_params.get('partner_id')
        year = request.query_params.get('year')
        
        summary = PayoutService.get_payout_summary(
            partner_id=partner_id,
            year=int(year) if year else None
        )
        
        return Response(PayoutSummarySerializer(summary).data)
    
    @action(detail=True, methods=['get'])
    def download_report(self, request, pk=None):
        """Download payout report as Excel file."""
        payout = self.get_object()
        return PayoutReportGenerator.generate_excel_report(payout.id)
    
    @action(detail=False, methods=['get'])
    def download_partner_summary(self, request):
        """Download partner annual summary report."""
        partner_id = request.query_params.get('partner_id')
        year = request.query_params.get('year')
        
        if not partner_id:
            return Response(
                {'error': 'partner_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return PayoutReportGenerator.generate_partner_summary_report(
            partner_id=partner_id,
            year=int(year) if year else None
        )

