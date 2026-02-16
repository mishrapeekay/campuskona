"""
Platform Finance Admin
======================
Django admin configuration for platform finance models
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    InvestorMetric, MarketingSpend, InvestorProfile,
    FinancialLedger, FinancialSnapshot, AuditLog,
    RoleBasedAccess, FinancialReport
)


@admin.register(InvestorMetric)
class InvestorMetricAdmin(admin.ModelAdmin):
    list_display = [
        'snapshot_date', 'mrr_display', 'arr_display', 'active_schools',
        'churn_rate', 'growth_rate', 'ltv_cac_ratio', 'calculated_at'
    ]
    list_filter = ['snapshot_date', 'calculated_at']
    search_fields = ['snapshot_date']
    readonly_fields = [
        'id', 'calculated_at', 'arr', 'ltv_cac_ratio',
        'region_distribution', 'tier_distribution'
    ]
    
    fieldsets = (
        ('Snapshot Info', {
            'fields': ('id', 'snapshot_date', 'calculated_at')
        }),
        ('Revenue Metrics', {
            'fields': ('mrr', 'arr')
        }),
        ('School Metrics', {
            'fields': (
                'total_schools', 'active_schools',
                'new_schools_this_month', 'churned_schools_this_month'
            )
        }),
        ('Growth & Health', {
            'fields': ('churn_rate', 'growth_rate', 'cac', 'ltv', 'ltv_cac_ratio')
        }),
        ('Distributions', {
            'fields': ('region_distribution', 'tier_distribution'),
            'classes': ('collapse',)
        }),
    )
    
    def mrr_display(self, obj):
        return f'₹{obj.mrr:,.2f}'
    mrr_display.short_description = 'MRR'
    
    def arr_display(self, obj):
        return f'₹{obj.arr:,.2f}'
    arr_display.short_description = 'ARR'


@admin.register(MarketingSpend)
class MarketingSpendAdmin(admin.ModelAdmin):
    list_display = [
        'month', 'total_spend_display', 'digital_marketing',
        'events_conferences', 'partner_incentives', 'created_at'
    ]
    list_filter = ['month', 'created_at']
    search_fields = ['month', 'notes']
    readonly_fields = ['id', 'total_spend', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Period', {
            'fields': ('id', 'month')
        }),
        ('Spend Categories', {
            'fields': (
                'digital_marketing', 'events_conferences',
                'content_marketing', 'partner_incentives',
                'sales_team_cost', 'other_expenses'
            )
        }),
        ('Total', {
            'fields': ('total_spend',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def total_spend_display(self, obj):
        return f'₹{obj.total_spend:,.2f}'
    total_spend_display.short_description = 'Total Spend'


@admin.register(InvestorProfile)
class InvestorProfileAdmin(admin.ModelAdmin):
    list_display = [
        'investor_name', 'investor_type', 'firm_name',
        'investment_amount_display', 'equity_percentage',
        'dashboard_access', 'is_active'
    ]
    list_filter = ['investor_type', 'is_active', 'board_member', 'investment_date']
    search_fields = ['investor_name', 'firm_name', 'email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Investor Details', {
            'fields': ('id', 'user', 'investor_name', 'investor_type', 'firm_name')
        }),
        ('Investment', {
            'fields': ('investment_amount', 'investment_date', 'equity_percentage')
        }),
        ('Access Control', {
            'fields': (
                'dashboard_access', 'financial_reports_access', 'board_member'
            )
        }),
        ('Contact', {
            'fields': ('email', 'phone')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
    
    def investment_amount_display(self, obj):
        return f'₹{obj.investment_amount:,.2f}'
    investment_amount_display.short_description = 'Investment'


@admin.register(FinancialLedger)
class FinancialLedgerAdmin(admin.ModelAdmin):
    list_display = [
        'sequence_number', 'created_at', 'transaction_type',
        'category', 'amount_display', 'tenant_schema',
        'hash_display', 'is_locked'
    ]
    list_filter = ['category', 'transaction_type', 'created_at', 'is_locked']
    search_fields = ['sequence_number', 'description', 'tenant_schema']
    readonly_fields = [
        'id', 'sequence_number', 'previous_hash', 'current_hash',
        'created_at', 'is_locked'
    ]
    
    fieldsets = (
        ('Ledger Chain', {
            'fields': ('id', 'sequence_number', 'previous_hash', 'current_hash')
        }),
        ('Transaction', {
            'fields': (
                'transaction_type', 'category', 'amount', 'currency'
            )
        }),
        ('References', {
            'fields': (
                'tenant_schema', 'reference_type', 'reference_id'
            )
        }),
        ('Details', {
            'fields': ('description', 'metadata')
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'is_locked')
        }),
    )
    
    def has_add_permission(self, request):
        """Ledger entries should be created via API"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Ledger entries are immutable"""
        return False
    
    def amount_display(self, obj):
        return f'₹{obj.amount:,.2f}'
    amount_display.short_description = 'Amount'
    
    def hash_display(self, obj):
        return format_html(
            '<code style="font-size: 10px;">{}</code>',
            obj.current_hash[:16] + '...'
        )
    hash_display.short_description = 'Hash'


@admin.register(FinancialSnapshot)
class FinancialSnapshotAdmin(admin.ModelAdmin):
    list_display = [
        'snapshot_date', 'platform_revenue_total_display',
        'gross_profit_display', 'net_profit_display',
        'ledger_entries_count', 'calculated_at'
    ]
    list_filter = ['snapshot_date', 'calculated_at']
    search_fields = ['snapshot_date']
    readonly_fields = [
        'id', 'snapshot_date', 'platform_revenue_total', 'platform_revenue_mtd',
        'platform_revenue_ytd', 'school_collections_total', 'school_collections_mtd',
        'partner_commissions_paid', 'partner_commissions_pending', 'investor_payouts_total',
        'investor_payouts_ytd', 'platform_expenses_total', 'platform_expenses_mtd',
        'gross_profit', 'net_profit', 'calculated_at', 'ledger_entries_count',
        'last_ledger_sequence'
    ]
    
    fieldsets = (
        ('Snapshot Info', {
            'fields': ('id', 'snapshot_date', 'calculated_at')
        }),
        ('Platform Revenue', {
            'fields': (
                'platform_revenue_total', 'platform_revenue_mtd',
                'platform_revenue_ytd'
            )
        }),
        ('School Collections', {
            'fields': ('school_collections_total', 'school_collections_mtd')
        }),
        ('Payouts', {
            'fields': (
                'partner_commissions_paid', 'partner_commissions_pending',
                'investor_payouts_total', 'investor_payouts_ytd'
            )
        }),
        ('Expenses', {
            'fields': ('platform_expenses_total', 'platform_expenses_mtd')
        }),
        ('Net Metrics', {
            'fields': ('gross_profit', 'net_profit')
        }),
        ('Ledger Info', {
            'fields': ('ledger_entries_count', 'last_ledger_sequence')
        }),
    )
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def platform_revenue_total_display(self, obj):
        return f'₹{obj.platform_revenue_total:,.2f}'
    platform_revenue_total_display.short_description = 'Platform Revenue'
    
    def gross_profit_display(self, obj):
        return f'₹{obj.gross_profit:,.2f}'
    gross_profit_display.short_description = 'Gross Profit'
    
    def net_profit_display(self, obj):
        return f'₹{obj.net_profit:,.2f}'
    net_profit_display.short_description = 'Net Profit'


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = [
        'timestamp', 'user_email', 'action', 'model_name',
        'object_repr', 'ip_address'
    ]
    list_filter = ['action', 'model_name', 'timestamp']
    search_fields = ['user_email', 'object_repr', 'model_name']
    readonly_fields = [
        'id', 'action', 'model_name', 'object_id', 'object_repr',
        'user', 'user_email', 'user_role', 'timestamp', 'ip_address',
        'user_agent', 'changes', 'request_path', 'request_method'
    ]
    
    fieldsets = (
        ('Action', {
            'fields': ('action', 'model_name', 'object_id', 'object_repr')
        }),
        ('User', {
            'fields': ('user', 'user_email', 'user_role')
        }),
        ('Context', {
            'fields': ('timestamp', 'ip_address', 'user_agent')
        }),
        ('Request', {
            'fields': ('request_path', 'request_method')
        }),
        ('Changes', {
            'fields': ('changes',),
            'classes': ('collapse',)
        }),
    )
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(RoleBasedAccess)
class RoleBasedAccessAdmin(admin.ModelAdmin):
    list_display = [
        'role', 'can_view_platform_revenue', 'can_view_investor_payouts',
        'can_export_ledger', 'can_approve_payouts'
    ]
    list_filter = ['role']
    search_fields = ['role', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Role', {
            'fields': ('id', 'role', 'description')
        }),
        ('View Permissions', {
            'fields': (
                'can_view_platform_revenue', 'can_view_school_collections',
                'can_view_partner_commissions', 'can_view_investor_payouts',
                'can_view_expenses'
            )
        }),
        ('Action Permissions', {
            'fields': (
                'can_export_ledger', 'can_view_audit_logs',
                'can_approve_payouts'
            )
        }),
        ('Data Access', {
            'fields': ('can_view_all_tenants', 'restricted_to_own_data')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(FinancialReport)
class FinancialReportAdmin(admin.ModelAdmin):
    list_display = [
        'report_type', 'report_format', 'start_date', 'end_date',
        'generated_by', 'generated_at', 'download_count', 'is_confidential'
    ]
    list_filter = ['report_type', 'report_format', 'is_confidential', 'generated_at']
    search_fields = ['report_type', 'generated_by__email']
    readonly_fields = [
        'id', 'file', 'file_size', 'generated_at', 'download_count'
    ]
    
    fieldsets = (
        ('Report Details', {
            'fields': ('id', 'report_type', 'report_format')
        }),
        ('Date Range', {
            'fields': ('start_date', 'end_date')
        }),
        ('File', {
            'fields': ('file', 'file_size')
        }),
        ('Generation', {
            'fields': ('generated_by', 'generated_at')
        }),
        ('Access', {
            'fields': ('is_confidential', 'download_count')
        }),
        ('Parameters', {
            'fields': ('parameters',),
            'classes': ('collapse',)
        }),
    )
