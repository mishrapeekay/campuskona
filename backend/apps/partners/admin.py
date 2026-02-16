"""
Partner Commission Admin

Django admin configuration for partner commission tracking.
"""

from django.contrib import admin
from .models import Partner, Lead, Commission, CommissionRule, Payout


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    """Admin for Partner model."""
    
    list_display = [
        'partner_code', 'name', 'email', 'commission_type',
        'commission_rate', 'status', 'total_leads',
        'total_conversions', 'conversion_rate', 'pending_commission'
    ]
    
    list_filter = ['status', 'commission_type', 'joined_date']
    
    search_fields = ['name', 'email', 'partner_code', 'company_name']
    
    readonly_fields = [
        'partner_code', 'total_leads', 'total_conversions',
        'total_commission_earned', 'total_commission_paid',
        'conversion_rate', 'pending_commission',
        'joined_date', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': (
                'partner_code', 'name', 'email', 'phone', 'company_name', 'status'
            )
        }),
        ('Commission Structure', {
            'fields': (
                'commission_type', 'commission_rate', 'flat_commission_amount'
            )
        }),
        ('Payment Details', {
            'fields': (
                'bank_name', 'account_number', 'ifsc_code',
                'pan_number', 'gst_number', 'upi_id'
            )
        }),
        ('Statistics', {
            'fields': (
                'total_leads', 'total_conversions', 'conversion_rate',
                'total_commission_earned', 'total_commission_paid', 'pending_commission'
            )
        }),
        ('Timestamps', {
            'fields': ('joined_date', 'created_at', 'updated_at')
        }),
    )


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    """Admin for Lead model."""
    
    list_display = [
        'school_name', 'partner', 'contact_person', 'email',
        'status', 'assigned_to', 'submitted_date'
    ]
    
    list_filter = ['status', 'partner', 'board', 'submitted_date']
    
    search_fields = [
        'school_name', 'contact_person', 'email', 'phone',
        'partner__name', 'partner__partner_code'
    ]
    
    readonly_fields = [
        'submitted_date', 'conversion_date', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Lead Information', {
            'fields': (
                'partner', 'school_name', 'contact_person',
                'email', 'phone', 'city', 'state'
            )
        }),
        ('Lead Details', {
            'fields': (
                'estimated_students', 'board', 'notes', 'status'
            )
        }),
        ('Assignment', {
            'fields': ('assigned_to', 'last_contacted_date')
        }),
        ('Conversion', {
            'fields': ('converted_school', 'conversion_date')
        }),
        ('Lost Information', {
            'fields': ('lost_reason', 'lost_notes')
        }),
        ('Timestamps', {
            'fields': ('submitted_date', 'created_at', 'updated_at')
        }),
    )


@admin.register(CommissionRule)
class CommissionRuleAdmin(admin.ModelAdmin):
    """Admin for CommissionRule model."""
    
    list_display = [
        'name', 'partner', 'subscription_tier', 'calculation_type',
        'commission_percentage', 'flat_amount', 'priority',
        'is_active', 'is_valid_now'
    ]
    
    list_filter = [
        'calculation_type', 'subscription_tier', 'is_active',
        'partner', 'created_at'
    ]
    
    search_fields = ['name', 'description', 'partner__name']
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'partner', 'subscription_tier')
        }),
        ('Commission Calculation', {
            'fields': (
                'calculation_type', 'commission_percentage',
                'flat_amount', 'recurring_months'
            )
        }),
        ('Priority & Status', {
            'fields': ('priority', 'is_active')
        }),
        ('Validity Period', {
            'fields': ('valid_from', 'valid_until')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def is_valid_now(self, obj):
        """Display if rule is currently valid."""
        return obj.is_valid_now()
    is_valid_now.boolean = True
    is_valid_now.short_description = 'Valid Now'


@admin.register(Commission)
class CommissionAdmin(admin.ModelAdmin):
    """Admin for Commission model."""
    
    list_display = [
        'partner', 'lead', 'school', 'commission_amount',
        'commission_type', 'status', 'earned_date', 'payout'
    ]
    
    list_filter = [
        'status', 'commission_type', 'partner',
        'earned_date', 'approved_date', 'paid_date'
    ]
    
    search_fields = [
        'partner__name', 'lead__school_name',
        'school__name', 'notes'
    ]
    
    readonly_fields = [
        'earned_date', 'approved_date', 'paid_date',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Commission Details', {
            'fields': (
                'partner', 'lead', 'school', 'commission_rule'
            )
        }),
        ('Amounts', {
            'fields': (
                'subscription_amount', 'commission_amount', 'commission_type'
            )
        }),
        ('Period (for recurring)', {
            'fields': ('period_start', 'period_end')
        }),
        ('Status & Payment', {
            'fields': ('status', 'payout', 'notes')
        }),
        ('Timestamps', {
            'fields': (
                'earned_date', 'approved_date', 'paid_date',
                'created_at', 'updated_at'
            )
        }),
    )


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    """Admin for Payout model."""
    
    list_display = [
        'payout_number', 'partner', 'total_amount', 'net_amount',
        'commission_count', 'status', 'payout_date', 'created_at'
    ]
    
    list_filter = [
        'status', 'payment_method', 'partner',
        'payout_date', 'created_at'
    ]
    
    search_fields = [
        'payout_number', 'partner__name',
        'transaction_reference', 'notes'
    ]
    
    readonly_fields = [
        'payout_number', 'tds_amount', 'net_amount',
        'payout_date', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Payout Information', {
            'fields': (
                'payout_number', 'partner', 'period_start', 'period_end'
            )
        }),
        ('Amounts', {
            'fields': (
                'total_amount', 'commission_count',
                'tds_percentage', 'tds_amount', 'net_amount'
            )
        }),
        ('Payment Details', {
            'fields': (
                'payment_method', 'transaction_reference', 'status'
            )
        }),
        ('Documents', {
            'fields': ('invoice_url', 'payment_receipt_url')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': (
                'payout_date', 'created_at', 'updated_at', 'created_by'
            )
        }),
    )
