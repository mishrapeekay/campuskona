"""
Admin configuration for tenants app.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Subscription, School, Domain, TenantConfig, TenantBranding, FeatureDefinition, TenantFeature
from .features import invalidate_feature_cache, invalidate_all_feature_caches

# Import custom admin site configuration
from . import admin_site


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """
    Subscription admin.
    """
    list_display = [
        'name', 'tier', 'max_students', 'max_teachers', 'price_monthly',
        'price_yearly', 'is_active', 'schools_count'
    ]
    list_filter = ['tier', 'is_active', 'is_trial', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['price_monthly']

    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'tier')
        }),
        ('Limits', {
            'fields': ('max_students', 'max_teachers', 'max_staff')
        }),
        ('Pricing', {
            'fields': ('price_monthly', 'price_yearly', 'currency')
        }),
        ('Features (Legacy JSON)', {
            'fields': ('features',),
            'classes': ('collapse',),
            'description': 'Deprecated. Use Feature Definitions & Tier system instead.',
        }),
        ('Trial', {
            'fields': ('is_trial', 'trial_days'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

    def schools_count(self, obj):
        """Display school count."""
        count = obj.schools.count()
        return format_html('<b>{}</b>', count)
    schools_count.short_description = 'Schools'


class TenantFeatureInline(admin.TabularInline):
    """Inline for managing feature overrides on the School admin page."""
    model = TenantFeature
    extra = 0
    fields = ['feature', 'is_enabled', 'override_reason', 'enabled_at', 'disabled_at']
    readonly_fields = ['enabled_at']
    autocomplete_fields = ['feature']

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        invalidate_feature_cache(obj.school_id)


class TenantBrandingInline(admin.StackedInline):
    """Inline for managing branding on the School admin page."""
    model = TenantBranding
    can_delete = False
    verbose_name_plural = 'Branding'
    fieldsets = (
        ('Logos', {
            'fields': ('logo_light', 'logo_dark', 'icon')
        }),
        ('Colors', {
            'fields': ('primary_color', 'secondary_color', 'accent_color')
        }),
        ('Typography & Layout', {
            'fields': ('font_family', 'login_layout', 'request_login')
        }),
        ('Email & PDF', {
            'fields': ('email_header_image', 'pdf_header_image'),
            'classes': ('collapse',)
        }),
        ('Advanced', {
            'fields': ('css_overrides',),
            'classes': ('collapse',)
        }),
    )


class TenantConfigInline(admin.StackedInline):
    model = TenantConfig
    can_delete = False
    verbose_name_plural = 'Configuration'

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    """
    School admin.
    """
    inlines = [TenantConfigInline, TenantBrandingInline, TenantFeatureInline]
    list_display = [
        'name', 'code', 'subdomain', 'primary_board',
        'subscription', 'is_active', 'subscription_status', 'created_at'
    ]
    list_filter = ['is_active', 'is_trial', 'primary_board', 'created_at']
    search_fields = ['name', 'code', 'subdomain', 'email']
    readonly_fields = ['schema_name', 'created_at', 'updated_at', 'created_by']
    ordering = ['-created_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'schema_name', 'subdomain')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'address', 'city', 'state', 'country', 'pincode')
        }),
        ('Educational Details', {
            'fields': ('primary_board', 'supported_boards')
        }),
        ('Branding', {
            'fields': ('logo', 'primary_color', 'secondary_color'),
            'classes': ('collapse',)
        }),
        ('Subscription', {
            'fields': ('subscription', 'subscription_start_date', 'subscription_end_date', 'is_trial')
        }),
        ('Database Configuration', {
            'fields': ('db_host', 'db_port', 'db_name', 'db_user'),
            'classes': ('collapse',)
        }),
        ('Settings', {
            'fields': ('settings', 'auto_create_schema', 'is_active')
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def subscription_status(self, obj):
        """Display subscription status."""
        from django.utils.safestring import mark_safe
        if obj.is_subscription_active:
            return mark_safe('<span style="color: green;">✓ Active</span>')
        return mark_safe('<span style="color: red;">✗ Expired</span>')
    subscription_status.short_description = 'Subscription'


@admin.register(Domain)
class DomainAdmin(admin.ModelAdmin):
    """
    Domain admin.
    """
    list_display = ['domain', 'tenant', 'is_primary', 'is_https', 'is_active', 'created_at']
    list_filter = ['is_primary', 'is_https', 'is_active', 'created_at']
    search_fields = ['domain', 'tenant__name']
    ordering = ['-is_primary', 'domain']

    fieldsets = (
        (None, {
            'fields': ('domain', 'tenant')
        }),
        ('Settings', {
            'fields': ('is_primary', 'is_https', 'is_active')
        }),
    )


@admin.register(TenantConfig)
class TenantConfigAdmin(admin.ModelAdmin):
    """
    Tenant configuration admin.
    """
    list_display = [
        'school', 'enable_online_payments', 'enable_sms_notifications',
        'enable_biometric_attendance', 'enable_mobile_app'
    ]
    search_fields = ['school__name']
    ordering = ['school__name']

    fieldsets = (
        ('School', {
            'fields': ('school',)
        }),
        ('Feature Flags', {
            'fields': (
                'enable_online_payments', 'enable_sms_notifications',
                'enable_email_notifications', 'enable_biometric_attendance',
                'enable_mobile_app', 'enable_parent_portal',
                'enable_library', 'enable_transport', 'enable_hostel',
                'enable_hr_payroll'
            )
        }),
        ('Academic Settings', {
            'fields': ('academic_year_start_month', 'working_days')
        }),
        ('Attendance Settings', {
            'fields': ('attendance_marking_time', 'late_arrival_time')
        }),
        ('Fee Settings', {
            'fields': ('late_fee_enabled', 'late_fee_amount', 'late_fee_grace_days')
        }),
        ('Notification Settings', {
            'fields': ('sms_balance', 'email_quota_monthly')
        }),
        ('Custom Settings', {
            'fields': ('custom_settings',),
            'classes': ('collapse',)
        }),
    )


@admin.register(FeatureDefinition)
class FeatureDefinitionAdmin(admin.ModelAdmin):
    """Admin for managing feature definitions."""
    list_display = ['code', 'name', 'category', 'minimum_tier', 'is_active', 'created_at']
    list_filter = ['category', 'minimum_tier', 'is_active']
    search_fields = ['code', 'name', 'description']
    ordering = ['category', 'minimum_tier', 'name']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (None, {
            'fields': ('code', 'name', 'description')
        }),
        ('Classification', {
            'fields': ('category', 'minimum_tier')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    actions = ['activate_features', 'deactivate_features']

    def activate_features(self, request, queryset):
        count = queryset.update(is_active=True)
        invalidate_all_feature_caches()
        self.message_user(request, f'{count} features activated.')
    activate_features.short_description = 'Activate selected features'

    def deactivate_features(self, request, queryset):
        count = queryset.update(is_active=False)
        invalidate_all_feature_caches()
        self.message_user(request, f'{count} features deactivated.')
    deactivate_features.short_description = 'Deactivate selected features (global kill switch)'

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if change:
            invalidate_all_feature_caches()


@admin.register(TenantFeature)
class TenantFeatureAdmin(admin.ModelAdmin):
    """Admin for managing per-tenant feature overrides."""
    list_display = ['school', 'feature', 'is_enabled', 'override_reason', 'enabled_at']
    list_filter = ['is_enabled', 'feature__category', 'feature__minimum_tier']
    search_fields = ['school__name', 'feature__code', 'feature__name', 'override_reason']
    autocomplete_fields = ['school', 'feature']
    readonly_fields = ['enabled_at', 'created_at', 'updated_at']

    fieldsets = (
        (None, {
            'fields': ('school', 'feature')
        }),
        ('Override', {
            'fields': ('is_enabled', 'override_reason', 'disabled_at')
        }),
        ('Timestamps', {
            'fields': ('enabled_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        invalidate_feature_cache(obj.school_id)
