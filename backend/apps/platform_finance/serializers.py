"""
Platform Finance Serializers
============================
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    InvestorMetric, MarketingSpend, InvestorProfile,
    FinancialLedger, FinancialSnapshot, AuditLog,
    RoleBasedAccess, FinancialReport
)

User = get_user_model()


# ============================================================================
# INVESTOR DASHBOARD SERIALIZERS
# ============================================================================

class InvestorMetricSerializer(serializers.ModelSerializer):
    """Serializer for investor metrics snapshots"""
    
    class Meta:
        model = InvestorMetric
        fields = [
            'id', 'snapshot_date', 'calculated_at',
            'mrr', 'arr', 'total_schools', 'active_schools',
            'new_schools_this_month', 'churned_schools_this_month',
            'churn_rate', 'growth_rate', 'cac', 'ltv', 'ltv_cac_ratio',
            'region_distribution', 'tier_distribution'
        ]
        read_only_fields = ['id', 'calculated_at', 'arr', 'ltv_cac_ratio']


class InvestorDashboardSerializer(serializers.Serializer):
    """Comprehensive investor dashboard data"""
    summary = serializers.DictField()
    growth = serializers.DictField()
    trends = serializers.ListField()
    financial_health = serializers.DictField()


class MarketingSpendSerializer(serializers.ModelSerializer):
    """Serializer for marketing spend tracking"""
    
    class Meta:
        model = MarketingSpend
        fields = [
            'id', 'month', 'digital_marketing', 'events_conferences',
            'content_marketing', 'partner_incentives', 'sales_team_cost',
            'other_expenses', 'total_spend', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_spend', 'created_at', 'updated_at']


class InvestorProfileSerializer(serializers.ModelSerializer):
    """Serializer for investor profiles"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = InvestorProfile
        fields = [
            'id', 'user', 'user_email', 'user_name',
            'investor_name', 'investor_type', 'firm_name',
            'investment_amount', 'investment_date', 'equity_percentage',
            'dashboard_access', 'financial_reports_access', 'board_member',
            'email', 'phone', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============================================================================
# FINANCIAL SEGREGATION SERIALIZERS
# ============================================================================

class FinancialLedgerSerializer(serializers.ModelSerializer):
    """Serializer for financial ledger entries"""
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display', 
        read_only=True
    )
    category_display = serializers.CharField(
        source='get_category_display', 
        read_only=True
    )
    
    class Meta:
        model = FinancialLedger
        fields = [
            'id', 'sequence_number', 'previous_hash', 'current_hash',
            'transaction_type', 'transaction_type_display',
            'category', 'category_display',
            'amount', 'currency',
            'tenant_schema', 'reference_type', 'reference_id',
            'description', 'metadata',
            'created_by', 'created_by_email', 'created_at',
            'is_locked'
        ]
        read_only_fields = [
            'id', 'sequence_number', 'previous_hash', 'current_hash',
            'created_at', 'is_locked'
        ]


class FinancialLedgerCreateSerializer(serializers.Serializer):
    """Serializer for creating ledger entries"""
    transaction_type = serializers.ChoiceField(choices=FinancialLedger.TRANSACTION_TYPE_CHOICES)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    description = serializers.CharField()
    tenant_schema = serializers.CharField(required=False, allow_blank=True)
    reference_id = serializers.UUIDField(required=False, allow_null=True)
    metadata = serializers.JSONField(required=False)


class FinancialSnapshotSerializer(serializers.ModelSerializer):
    """Serializer for financial snapshots"""
    
    class Meta:
        model = FinancialSnapshot
        fields = [
            'id', 'snapshot_date', 'calculated_at',
            'platform_revenue_total', 'platform_revenue_mtd', 'platform_revenue_ytd',
            'school_collections_total', 'school_collections_mtd',
            'partner_commissions_paid', 'partner_commissions_pending',
            'investor_payouts_total', 'investor_payouts_ytd',
            'platform_expenses_total', 'platform_expenses_mtd',
            'gross_profit', 'net_profit',
            'ledger_entries_count', 'last_ledger_sequence'
        ]
        read_only_fields = '__all__'


class FinancialSegregationSerializer(serializers.Serializer):
    """Comprehensive financial segregation report"""
    platform_revenue = serializers.DictField()
    school_collections = serializers.DictField()
    partner_commissions = serializers.DictField()
    investor_payouts = serializers.DictField()
    platform_expenses = serializers.DictField()
    net_metrics = serializers.DictField()


# ============================================================================
# AUDIT & ACCESS CONTROL SERIALIZERS
# ============================================================================

class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for audit log entries"""
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'action', 'action_display',
            'model_name', 'object_id', 'object_repr',
            'user', 'user_email', 'user_role',
            'timestamp', 'ip_address', 'user_agent',
            'changes', 'request_path', 'request_method'
        ]
        read_only_fields = '__all__'


class RoleBasedAccessSerializer(serializers.ModelSerializer):
    """Serializer for role-based access control"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = RoleBasedAccess
        fields = [
            'id', 'role', 'role_display',
            'can_view_platform_revenue', 'can_view_school_collections',
            'can_view_partner_commissions', 'can_view_investor_payouts',
            'can_view_expenses', 'can_export_ledger',
            'can_view_audit_logs', 'can_approve_payouts',
            'can_view_all_tenants', 'restricted_to_own_data',
            'description', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FinancialReportSerializer(serializers.ModelSerializer):
    """Serializer for financial reports"""
    generated_by_email = serializers.EmailField(source='generated_by.email', read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    report_format_display = serializers.CharField(source='get_report_format_display', read_only=True)
    
    class Meta:
        model = FinancialReport
        fields = [
            'id', 'report_type', 'report_type_display',
            'report_format', 'report_format_display',
            'start_date', 'end_date',
            'file', 'file_size',
            'generated_by', 'generated_by_email', 'generated_at',
            'is_confidential', 'download_count',
            'parameters'
        ]
        read_only_fields = [
            'id', 'file', 'file_size', 'generated_at', 
            'download_count'
        ]


class GenerateReportSerializer(serializers.Serializer):
    """Serializer for report generation request"""
    report_type = serializers.ChoiceField(choices=FinancialReport.REPORT_TYPE_CHOICES)
    report_format = serializers.ChoiceField(choices=FinancialReport.FORMAT_CHOICES)
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    parameters = serializers.JSONField(required=False)
    
    def validate(self, data):
        """Validate date range"""
        if data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data


# ============================================================================
# STATISTICS SERIALIZERS
# ============================================================================

class PlatformStatisticsSerializer(serializers.Serializer):
    """Overall platform statistics"""
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_schools = serializers.IntegerField()
    active_subscriptions = serializers.IntegerField()
    mrr = serializers.DecimalField(max_digits=12, decimal_places=2)
    arr = serializers.DecimalField(max_digits=12, decimal_places=2)
    churn_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    growth_rate = serializers.DecimalField(max_digits=5, decimal_places=2)


class LedgerIntegritySerializer(serializers.Serializer):
    """Ledger integrity verification result"""
    is_valid = serializers.BooleanField()
    total_entries = serializers.IntegerField()
    errors = serializers.ListField()
    last_verified = serializers.DateTimeField()
