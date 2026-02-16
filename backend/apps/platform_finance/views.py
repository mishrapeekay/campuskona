"""
Platform Finance Views
=====================
API endpoints for investor dashboard, financial segregation, and audit trail
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count, Q
from datetime import timedelta, date
from decimal import Decimal

from apps.core.permissions import IsSuperAdmin
from .models import (
    InvestorMetric, MarketingSpend, InvestorProfile,
    FinancialLedger, FinancialSnapshot, AuditLog,
    RoleBasedAccess, FinancialReport
)
from .serializers import (
    InvestorMetricSerializer, InvestorDashboardSerializer,
    MarketingSpendSerializer, InvestorProfileSerializer,
    FinancialLedgerSerializer, FinancialLedgerCreateSerializer,
    FinancialSnapshotSerializer, FinancialSegregationSerializer,
    AuditLogSerializer, RoleBasedAccessSerializer,
    FinancialReportSerializer, GenerateReportSerializer,
    PlatformStatisticsSerializer, LedgerIntegritySerializer
)
from .services import (
    InvestorMetricsService, FinancialSegregationService, AuditService
)
from .reports import InvestorReportGenerator, LedgerReportGenerator


class InvestorDashboardViewSet(viewsets.ViewSet):
    """
    Investor Dashboard API
    Provides comprehensive financial metrics for investors
    """
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Get comprehensive investor dashboard data
        
        Query Params:
        - refresh: (optional) 'true' to force recalculation
        """
        refresh = request.query_params.get('refresh', 'false').lower() == 'true'
        
        # Get or create today's snapshot
        today = timezone.now().date()
        
        if refresh:
            snapshot = InvestorMetricsService.create_daily_snapshot(today)
        else:
            try:
                snapshot = InvestorMetric.objects.get(snapshot_date=today)
            except InvestorMetric.DoesNotExist:
                snapshot = InvestorMetricsService.create_daily_snapshot(today)
        
        # Get trend data (last 90 days)
        trends = InvestorMetricsService.get_trend_data(days=90)
        
        # Calculate financial health indicators
        financial_health = {
            'ltv_cac_ratio': float(snapshot.ltv_cac_ratio),
            'ltv_cac_status': 'Excellent' if snapshot.ltv_cac_ratio >= 3 else 'Needs Improvement',
            'churn_status': 'Healthy' if snapshot.churn_rate < 5 else 'High',
            'growth_status': 'Growing' if snapshot.growth_rate > 0 else 'Declining',
            'mrr_growth': float(snapshot.growth_rate),
        }
        
        dashboard_data = {
            'summary': {
                'mrr': float(snapshot.mrr),
                'arr': float(snapshot.arr),
                'churn_rate': float(snapshot.churn_rate),
                'growth_rate': float(snapshot.growth_rate),
                'total_schools': snapshot.total_schools,
                'active_schools': snapshot.active_schools,
                'cac': float(snapshot.cac),
                'ltv': float(snapshot.ltv),
                'ltv_cac_ratio': float(snapshot.ltv_cac_ratio),
            },
            'growth': {
                'regions': snapshot.region_distribution,
                'tiers': snapshot.tier_distribution,
                'new_schools_this_month': snapshot.new_schools_this_month,
                'churned_schools_this_month': snapshot.churned_schools_this_month,
            },
            'trends': trends,
            'financial_health': financial_health,
        }
        
        serializer = InvestorDashboardSerializer(dashboard_data)
        
        # Log access
        AuditService.log_action(
            user=request.user,
            action='VIEW',
            model_name='InvestorDashboard',
            object_id='dashboard',
            object_repr='Investor Dashboard',
            request=request
        )
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def refresh_metrics(self, request):
        """Trigger immediate recalculation of metrics"""
        snapshot = InvestorMetricsService.create_daily_snapshot()
        
        AuditService.log_action(
            user=request.user,
            action='CREATE',
            model_name='InvestorMetric',
            object_id=str(snapshot.id),
            object_repr=str(snapshot),
            request=request
        )
        
        serializer = InvestorMetricSerializer(snapshot)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def metrics_history(self, request):
        """Get historical metrics"""
        days = int(request.query_params.get('days', 90))
        
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        metrics = InvestorMetric.objects.filter(
            snapshot_date__gte=start_date,
            snapshot_date__lte=end_date
        ).order_by('snapshot_date')
        
        serializer = InvestorMetricSerializer(metrics, many=True)
        return Response(serializer.data)


class MarketingSpendViewSet(viewsets.ModelViewSet):
    """Marketing spend tracking"""
    queryset = MarketingSpend.objects.all()
    serializer_class = MarketingSpendSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def perform_create(self, serializer):
        instance = serializer.save()
        AuditService.log_action(
            user=self.request.user,
            action='CREATE',
            model_name='MarketingSpend',
            object_id=str(instance.id),
            object_repr=str(instance),
            request=self.request
        )
    
    def perform_update(self, serializer):
        instance = serializer.save()
        AuditService.log_action(
            user=self.request.user,
            action='UPDATE',
            model_name='MarketingSpend',
            object_id=str(instance.id),
            object_repr=str(instance),
            changes=serializer.validated_data,
            request=self.request
        )


class InvestorProfileViewSet(viewsets.ModelViewSet):
    """Investor profile management"""
    queryset = InvestorProfile.objects.all()
    serializer_class = InvestorProfileSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by investor type
        investor_type = self.request.query_params.get('type')
        if investor_type:
            queryset = queryset.filter(investor_type=investor_type)
        
        # Filter by active status
        is_active = self.request.query_params.get('active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset


class FinancialLedgerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Financial Ledger API (Read-only)
    Immutable ledger with blockchain-inspired audit trail
    """
    queryset = FinancialLedger.objects.all()
    serializer_class = FinancialLedgerSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by transaction type
        transaction_type = self.request.query_params.get('transaction_type')
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        
        # Filter by tenant
        tenant_schema = self.request.query_params.get('tenant')
        if tenant_schema:
            queryset = queryset.filter(tenant_schema=tenant_schema)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset.order_by('-sequence_number')
    
    @action(detail=False, methods=['post'])
    def create_entry(self, request):
        """Create a new ledger entry"""
        serializer = FinancialLedgerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        transaction_type = data['transaction_type']
        
        # Determine category from transaction type
        category_map = {
            'PLATFORM_SUBSCRIPTION': 'PLATFORM_REVENUE',
            'PLATFORM_SETUP_FEE': 'PLATFORM_REVENUE',
            'PLATFORM_ADDON': 'PLATFORM_REVENUE',
            'SCHOOL_FEE_COLLECTION': 'SCHOOL_COLLECTION',
            'SCHOOL_OTHER_INCOME': 'SCHOOL_COLLECTION',
            'PARTNER_COMMISSION': 'PARTNER_PAYOUT',
            'PARTNER_TDS': 'PARTNER_PAYOUT',
            'INVESTOR_DIVIDEND': 'INVESTOR_PAYOUT',
            'INVESTOR_RETURN': 'INVESTOR_PAYOUT',
            'PLATFORM_EXPENSE': 'PLATFORM_EXPENSE',
            'MARKETING_EXPENSE': 'PLATFORM_EXPENSE',
            'SALARY_EXPENSE': 'PLATFORM_EXPENSE',
        }
        
        category = category_map.get(transaction_type, 'PLATFORM_EXPENSE')
        
        # Create ledger entry
        entry = FinancialLedger.objects.create(
            transaction_type=transaction_type,
            category=category,
            amount=data['amount'],
            description=data['description'],
            tenant_schema=data.get('tenant_schema', ''),
            reference_id=data.get('reference_id'),
            metadata=data.get('metadata', {}),
            created_by=request.user,
        )
        
        # Log action
        AuditService.log_action(
            user=request.user,
            action='CREATE',
            model_name='FinancialLedger',
            object_id=str(entry.id),
            object_repr=str(entry),
            request=request
        )
        
        return Response(
            FinancialLedgerSerializer(entry).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def verify_integrity(self, request):
        """Verify ledger chain integrity"""
        result = FinancialSegregationService.verify_ledger_integrity()
        result['last_verified'] = timezone.now()
        
        serializer = LedgerIntegritySerializer(result)
        
        # Log verification
        AuditService.log_action(
            user=request.user,
            action='VIEW',
            model_name='FinancialLedger',
            object_id='integrity_check',
            object_repr='Ledger Integrity Verification',
            changes={'result': result},
            request=request
        )
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export ledger to Excel"""
        # Get filtered queryset
        queryset = self.get_queryset()
        
        # Generate report
        report_generator = LedgerReportGenerator()
        file_path = report_generator.generate_ledger_export(queryset)
        
        # Create report record
        report = FinancialReport.objects.create(
            report_type='LEDGER_EXPORT',
            report_format='EXCEL',
            start_date=request.query_params.get('start_date', timezone.now().date()),
            end_date=request.query_params.get('end_date', timezone.now().date()),
            file=file_path,
            generated_by=request.user,
            parameters=request.query_params.dict()
        )
        
        # Log export
        AuditService.log_action(
            user=request.user,
            action='EXPORT',
            model_name='FinancialLedger',
            object_id='export',
            object_repr=f'Ledger Export ({queryset.count()} entries)',
            request=request
        )
        
        return Response({
            'report_id': str(report.id),
            'download_url': report.file.url if report.file else None,
            'entries_count': queryset.count()
        })


class FinancialSnapshotViewSet(viewsets.ReadOnlyModelViewSet):
    """Financial snapshots (read-only)"""
    queryset = FinancialSnapshot.objects.all()
    serializer_class = FinancialSnapshotSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    @action(detail=False, methods=['post'])
    def create_snapshot(self, request):
        """Create daily financial snapshot"""
        snapshot = FinancialSegregationService.create_daily_snapshot()
        
        AuditService.log_action(
            user=request.user,
            action='CREATE',
            model_name='FinancialSnapshot',
            object_id=str(snapshot.id),
            object_repr=str(snapshot),
            request=request
        )
        
        serializer = FinancialSnapshotSerializer(snapshot)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def segregation_report(self, request):
        """Get comprehensive financial segregation report"""
        # Get latest snapshot
        snapshot = FinancialSnapshot.objects.order_by('-snapshot_date').first()
        
        if not snapshot:
            snapshot = FinancialSegregationService.create_daily_snapshot()
        
        report_data = {
            'platform_revenue': {
                'total': float(snapshot.platform_revenue_total),
                'mtd': float(snapshot.platform_revenue_mtd),
                'ytd': float(snapshot.platform_revenue_ytd),
            },
            'school_collections': {
                'total': float(snapshot.school_collections_total),
                'mtd': float(snapshot.school_collections_mtd),
            },
            'partner_commissions': {
                'paid': float(snapshot.partner_commissions_paid),
                'pending': float(snapshot.partner_commissions_pending),
            },
            'investor_payouts': {
                'total': float(snapshot.investor_payouts_total),
                'ytd': float(snapshot.investor_payouts_ytd),
            },
            'platform_expenses': {
                'total': float(snapshot.platform_expenses_total),
                'mtd': float(snapshot.platform_expenses_mtd),
            },
            'net_metrics': {
                'gross_profit': float(snapshot.gross_profit),
                'net_profit': float(snapshot.net_profit),
                'profit_margin': float((snapshot.net_profit / snapshot.platform_revenue_total * 100) 
                                      if snapshot.platform_revenue_total > 0 else 0),
            }
        }
        
        serializer = FinancialSegregationSerializer(report_data)
        
        # Log access
        AuditService.log_action(
            user=request.user,
            action='VIEW',
            model_name='FinancialSnapshot',
            object_id='segregation_report',
            object_repr='Financial Segregation Report',
            request=request
        )
        
        return Response(serializer.data)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Audit log (read-only)"""
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by model
        model_name = self.request.query_params.get('model')
        if model_name:
            queryset = queryset.filter(model_name=model_name)
        
        # Filter by user
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by action
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset.order_by('-timestamp')


class RoleBasedAccessViewSet(viewsets.ModelViewSet):
    """Role-based access control management"""
    queryset = RoleBasedAccess.objects.all()
    serializer_class = RoleBasedAccessSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]


class FinancialReportViewSet(viewsets.ModelViewSet):
    """Financial report generation and management"""
    queryset = FinancialReport.objects.all()
    serializer_class = FinancialReportSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new financial report"""
        serializer = GenerateReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Generate report based on type
        report_generator = InvestorReportGenerator()
        
        if data['report_type'] == 'INVESTOR_DASHBOARD':
            file_path = report_generator.generate_investor_dashboard_report(
                data['start_date'],
                data['end_date'],
                data['report_format']
            )
        elif data['report_type'] == 'LEDGER_EXPORT':
            ledger_generator = LedgerReportGenerator()
            file_path = ledger_generator.generate_ledger_export(
                FinancialLedger.objects.filter(
                    created_at__gte=data['start_date'],
                    created_at__lte=data['end_date']
                )
            )
        else:
            return Response(
                {'error': 'Report type not implemented yet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create report record
        report = FinancialReport.objects.create(
            report_type=data['report_type'],
            report_format=data['report_format'],
            start_date=data['start_date'],
            end_date=data['end_date'],
            file=file_path,
            generated_by=request.user,
            parameters=data.get('parameters', {})
        )
        
        # Log generation
        AuditService.log_action(
            user=request.user,
            action='CREATE',
            model_name='FinancialReport',
            object_id=str(report.id),
            object_repr=str(report),
            request=request
        )
        
        return Response(
            FinancialReportSerializer(report).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download a generated report"""
        report = self.get_object()
        report.download_count += 1
        report.save()
        
        # Log download
        AuditService.log_action(
            user=request.user,
            action='VIEW',
            model_name='FinancialReport',
            object_id=str(report.id),
            object_repr=f'Downloaded {report}',
            request=request
        )
        
        return Response({
            'download_url': report.file.url if report.file else None,
            'file_size': report.file_size,
            'download_count': report.download_count
        })
