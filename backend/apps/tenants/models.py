"""
Tenant models for multi-tenancy support.

This app manages school tenants with schema-per-tenant architecture.
Each school gets its own PostgreSQL schema for complete data isolation.
"""

import logging
import uuid
from django.db import models, connection
from django.core.validators import RegexValidator
from django.utils.text import slugify
from psycopg2 import sql as psycopg2_sql
from django_tenants.models import TenantMixin, DomainMixin # Added mixins

logger = logging.getLogger(__name__)


class TenantBranding(models.Model):
    """
    Tenant branding configuration for white-labeling.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.OneToOneField(
        'School',
        on_delete=models.CASCADE,
        related_name='branding'
    )

    # Logos
    logo_light = models.ImageField(upload_to='branding/logos/', null=True, blank=True, help_text='Logo for light backgrounds')
    logo_dark = models.ImageField(upload_to='branding/logos/', null=True, blank=True, help_text='Logo for dark backgrounds')
    icon = models.ImageField(upload_to='branding/icons/', null=True, blank=True, help_text='Favicon / App Icon')

    # Colors
    primary_color = models.CharField(max_length=7, default='#1976d2', help_text='Primary brand color')
    secondary_color = models.CharField(max_length=7, default='#dc004e', help_text='Secondary brand color')
    accent_color = models.CharField(max_length=7, default='#f50057', help_text='Accent color for highlights')
    
    # Typography
    FONT_CHOICES = [
        ('Inter', 'Inter'),
        ('Roboto', 'Roboto'),
        ('Open Sans', 'Open Sans'),
        ('Lato', 'Lato'),
        ('Poppins', 'Poppins'),
    ]
    font_family = models.CharField(max_length=50, choices=FONT_CHOICES, default='Inter')

    # UI Configuration
    request_login = models.BooleanField(default=True, help_text='Show "Request Info" on login page')
    login_layout = models.CharField(
        max_length=20,
        choices=[('SIMPLE', 'Simple'), ('SPLIT', 'Split Screen'), ('CENTERED', 'Centered Card')],
        default='SIMPLE'
    )

    # Custom CSS/Theme
    css_overrides = models.TextField(blank=True, help_text='Custom CSS for web portal')
    
    # Email & PDF
    email_header_image = models.ImageField(upload_to='branding/email/', null=True, blank=True)
    pdf_header_image = models.ImageField(upload_to='branding/pdf/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'public_tenant_branding'

    def __str__(self):
        return f"Branding for {self.school.name}"



class Subscription(models.Model):
    """
    Subscription plans for schools.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    # Limits
    max_students = models.IntegerField(default=500)
    max_teachers = models.IntegerField(default=50)
    max_staff = models.IntegerField(default=20)

    # Pricing
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')

    # Subscription Tier
    TIER_CHOICES = [
        ('BASIC', 'Basic'),
        ('STANDARD', 'Standard'),
        ('PREMIUM', 'Premium'),
        ('ENTERPRISE', 'Enterprise'),
    ]
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='BASIC')

    # Features (stored as JSON — deprecated, use FeatureDefinition/TenantFeature instead)
    features = models.JSONField(default=dict)

    # Status
    is_active = models.BooleanField(default=True)
    is_trial = models.BooleanField(default=False)
    trial_days = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'public_subscriptions'
        ordering = ['price_monthly']

    def __str__(self):
        return self.name


class School(TenantMixin):
    """
    School tenant model.

    Each school is a separate tenant with its own database schema.
    """
    # id is auto-added by TenantMixin as auto-increment, but we want UUID. 
    # django-tenants supports custom PK. 
    # However, TenantMixin assumes standard usage. 
    # Let's keep existing fields but ensure we don't conflict.
    # TenantMixin adds: schema_name, slug (optional), domain_url (optional)
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Basic Information
    name = models.CharField(max_length=255)
    code = models.CharField(
        max_length=20,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[A-Z0-9]+$',
                message='Code must contain only uppercase letters and numbers'
            )
        ]
    )

    # Schema Information
    # Schema Information
    # schema_name is provided by TenantMixin, so we REMOVE re-definition or ensure compatibility
    # TenantMixin definition: schema_name = models.CharField(max_length=63, unique=True, validators=[_check_schema_name])
    
    # We will let TenantMixin handle schema_name definition to avoid conflicts.
    # But we need to keep our validators if possible.
    # Actually, it's safer to remove explicit definition effectively and let Mixin handle it, 
    # OR override it if we want custom validators.
    # Given the complexity, let's comment out our definition and rely on TenantMixin's standard one, 
    # which is robust.
    
    # schema_name = ... (Handled by TenantMixin)
    
    subdomain = models.CharField(
        max_length=63,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[a-z0-9-]+$',
                message='Subdomain must contain only lowercase letters, numbers, and hyphens'
            )
        ],
        help_text='Subdomain for accessing the school (e.g., schoolname.schoolmgmt.com)'
    )

    # Contact Information
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    pincode = models.CharField(max_length=10)

    # Educational Details
    BOARD_CHOICES = [
        ('CBSE', 'CBSE - Central Board of Secondary Education'),
        ('ICSE', 'ICSE - Indian Certificate of Secondary Education'),
        ('MPBSE', 'MPBSE - Madhya Pradesh Board of Secondary Education'),
        ('STATE', 'State Board'),
        ('IB', 'International Baccalaureate'),
        ('CAMBRIDGE', 'Cambridge International'),
    ]
    primary_board = models.CharField(max_length=20, choices=BOARD_CHOICES, default='CBSE')
    supported_boards = models.JSONField(
        default=list,
        blank=True,
        help_text='List of all boards supported by this school'
    )

    # Branding
    logo = models.ImageField(upload_to='school_logos/', null=True, blank=True)
    primary_color = models.CharField(max_length=7, default='#1976d2', help_text='Hex color code')
    secondary_color = models.CharField(max_length=7, default='#dc004e', help_text='Hex color code')

    # Subscription
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.PROTECT,
        related_name='schools'
    )
    subscription_start_date = models.DateField()
    subscription_end_date = models.DateField()

    # Database Configuration (for separate DB per tenant - optional)
    # NOTE: Currently unused — all tenants use schema-based isolation on the same database.
    # If per-tenant DB support is needed in future, db_password MUST be encrypted.
    db_host = models.CharField(max_length=255, blank=True, help_text='Leave blank to use default')
    db_port = models.IntegerField(null=True, blank=True)
    db_name = models.CharField(max_length=63, blank=True, help_text='Leave blank to use default')
    db_user = models.CharField(max_length=63, blank=True)
    db_password = models.CharField(max_length=255, blank=True, help_text='DEPRECATED: Use vault or encrypted storage for credentials')

    # Status and Settings
    is_active = models.BooleanField(default=True)
    is_trial = models.BooleanField(default=False)
    auto_create_schema = models.BooleanField(default=True)

    # Settings (stored as JSON)
    settings = models.JSONField(
        default=dict,
        blank=True,
        help_text='School-specific settings and configurations'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='schools_created'
    )

    class Meta:
        db_table = 'public_schools'
        ordering = ['name']
        indexes = [
            models.Index(fields=['schema_name']),
            models.Index(fields=['subdomain']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        """Override save to auto-generate schema_name from subdomain if not provided."""
        if not self.schema_name:
            self.schema_name = f"school_{slugify(self.subdomain).replace('-', '_')}"

        # Ensure supported_boards includes primary_board
        if self.primary_board and self.primary_board not in self.supported_boards:
            self.supported_boards.append(self.primary_board)

        super().save(*args, **kwargs)

        # Create schema if auto_create_schema is True
        if self.auto_create_schema:
            # django-tenants automatically creates schema on save if configured.
            # We can rely on that or call self.save() usually triggers it.
            # But we should check if migration is needed. 
            # With TenantMixin, calling save() automatically creates schema if it doesn't exist.
            pass
            
    # Remove custom create_schema and delete_schema as TenantMixin handles this.
    # But we can leave them if we want manual control, but we must be careful not to conflict.
    # Better to remove them to avoid confusion.

    # Custom schema methods removed to use TenantMixin implementation

    @property
    def is_subscription_active(self):
        """Check if subscription is currently active."""
        from datetime import date
        return (
            self.is_active and
            self.subscription_start_date <= date.today() <= self.subscription_end_date
        )

    @property
    def days_until_expiry(self):
        """Get number of days until subscription expires."""
        from datetime import date
        if self.subscription_end_date:
            delta = self.subscription_end_date - date.today()
            return delta.days
        return None


class Domain(DomainMixin):
    """
    Domain mapping for schools.

    Allows schools to use custom domains or subdomains.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # DomainMixin defines 'domain' and 'tenant' (ForeignKey to TENANT_MODEL)
    # Our model defines 'domain' and 'school'. 
    # We need to map 'school' to 'tenant' or use 'tenant' directly.
    # django-tenants expects 'tenant' field name by default, OR we can override via settings,
    # but simpler to use 'tenant'.
    
    # We will alias school to tenant for backward compatibility if needed, 
    # but for now let's just use what DomainMixin gives us and maybe add a property.
    
    # Actually, DomainMixin has:
    # domain = models.CharField...
    # tenant = models.ForeignKey(settings.TENANT_MODEL...)
    
    # We have 'school'. We should rename 'school' to 'tenant' in our codebase or pointing to it.
    # To avoid massive refactoring right now, we can try to keep 'school' 
    # BUT `DomainMixin` will force a `tenant` field. 
    # So we will have both if we are not careful.
    
    # Strategy: Remove 'school' field and rely on 'tenant' from Mixin. 
    # But we need to update references. 
    # Since we are in remediation, let's stick to standard `django-tenants`.
    
    # We will Comment out our 'domain' and 'school' fields.
    # domain = ... (Handled by DomainMixin)
    # school = ... (Handled by DomainMixin as 'tenant')
    pass

    is_primary = models.BooleanField(
        default=False,
        help_text='Primary domain for this school'
    )

    # SSL Configuration
    is_https = models.BooleanField(default=False)

    # Status
    is_active = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'public_domains'
        ordering = ['-is_primary', 'domain']
        indexes = [
            models.Index(fields=['domain', 'is_active']),
        ]
    
    # Verification & SSL
    is_verified = models.BooleanField(default=False)
    dns_record = models.CharField(max_length=255, blank=True, help_text='TXT record for domain verification')
    
    SSL_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACTIVE', 'Active'),
        ('FAILED', 'Failed'),
    ]
    ssl_status = models.CharField(max_length=20, choices=SSL_STATUS_CHOICES, default='PENDING')

    def generate_dns_record(self):
        """Generate a random TXT record for verification."""
        import secrets
        self.dns_record = f"sms-verification={secrets.token_urlsafe(16)}"


    def __str__(self):
        return f"{self.domain} -> {self.tenant.name}"

    def save(self, *args, **kwargs):
        """Ensure only one primary domain per school."""
        if self.is_primary:
            # Set all other domains for this tenant as non-primary
            Domain.objects.filter(tenant=self.tenant, is_primary=True).update(is_primary=False)

        super().save(*args, **kwargs)


class TenantConfig(models.Model):
    """
    Tenant-specific configuration and feature flags.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    school = models.OneToOneField(
        School,
        on_delete=models.CASCADE,
        related_name='config'
    )

    # Feature Flags
    enable_online_payments = models.BooleanField(default=True)
    enable_sms_notifications = models.BooleanField(default=True)
    enable_email_notifications = models.BooleanField(default=True)
    enable_biometric_attendance = models.BooleanField(default=False)
    enable_mobile_app = models.BooleanField(default=True)
    enable_parent_portal = models.BooleanField(default=True)
    enable_library = models.BooleanField(default=True)
    enable_transport = models.BooleanField(default=True)
    enable_hostel = models.BooleanField(default=False)
    enable_hr_payroll = models.BooleanField(default=True)

    # Academic Settings
    academic_year_start_month = models.IntegerField(default=4, help_text='Month number (1-12)')
    
    # Default working days function (needed for migrations)
    @staticmethod
    def get_default_working_days():
        return [0, 1, 2, 3, 4, 5]  # Monday to Saturday
    
    working_days = models.JSONField(
        default=list,  # Changed from lambda to list
        help_text='Working days (0=Monday, 6=Sunday)'
    )

    # Attendance Settings
    attendance_marking_time = models.TimeField(default='10:00:00')
    late_arrival_time = models.TimeField(default='09:30:00')

    # Fee Settings
    late_fee_enabled = models.BooleanField(default=True)
    late_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=100)
    late_fee_grace_days = models.IntegerField(default=5)

    # Notification Settings
    sms_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    email_quota_monthly = models.IntegerField(default=10000)

    # Localization
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('ta', 'Tamil'),
        ('te', 'Telugu'),
        ('kn', 'Kannada'),
        ('ml', 'Malayalam'),
        ('mr', 'Marathi'),
        ('bn', 'Bengali'),
        ('gu', 'Gujarati'),
    ]
    language = models.CharField(
        max_length=10,
        choices=LANGUAGE_CHOICES,
        default='en',
        help_text='Default language for tenant users and notifications'
    )

    # Custom Fields (stored as JSON)
    custom_settings = models.JSONField(default=dict)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'public_tenant_configs'

    def __str__(self):
        return f"Config for {self.school.name}"


# ============================================================================
# FEATURE FLAG SYSTEM
# ============================================================================

class FeatureDefinition(models.Model):
    """
    Central registry of all features in the system.
    Lives in public schema — shared across all tenants.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    code = models.CharField(
        max_length=100,
        unique=True,
        help_text='Unique feature code, e.g. "ai_timetable_generator"'
    )
    name = models.CharField(max_length=200, help_text='Human-readable feature name')
    description = models.TextField(blank=True)

    CATEGORY_CHOICES = [
        ('CORE', 'Core'),
        ('ACADEMICS', 'Academics'),
        ('COMMUNICATION', 'Communication'),
        ('FINANCE', 'Finance'),
        ('OPERATIONS', 'Operations'),
        ('AI_PREMIUM', 'AI & Premium'),
        ('INTEGRATION', 'Integrations & Marketplace'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='CORE')

    TIER_CHOICES = Subscription.TIER_CHOICES
    minimum_tier = models.CharField(
        max_length=20,
        choices=TIER_CHOICES,
        default='BASIC',
        help_text='Minimum subscription tier required for this feature'
    )

    is_active = models.BooleanField(
        default=True,
        help_text='Global kill switch — disables feature for ALL tenants'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'public_feature_definitions'
        ordering = ['category', 'minimum_tier', 'name']

    def __str__(self):
        return f"{self.name} ({self.code}) — {self.get_minimum_tier_display()}"


class TenantFeature(models.Model):
    """
    Maps a tenant (school) to a feature with override capability.

    Rows are only needed for overrides:
    - Enable a feature above the school's subscription tier
    - Disable a feature within the school's tier

    If no row exists, access is determined by subscription tier >= feature minimum_tier.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='feature_overrides'
    )
    feature = models.ForeignKey(
        FeatureDefinition,
        on_delete=models.CASCADE,
        related_name='tenant_assignments'
    )

    is_enabled = models.BooleanField(default=True)
    enabled_at = models.DateTimeField(auto_now_add=True)
    disabled_at = models.DateTimeField(null=True, blank=True)
    override_reason = models.CharField(
        max_length=500,
        blank=True,
        help_text='Reason for manual override (e.g., "Trial period for premium feature")'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'public_tenant_features'
        unique_together = ['school', 'feature']
        ordering = ['school', 'feature__category', 'feature__name']

    def __str__(self):
        status = 'enabled' if self.is_enabled else 'disabled'
        return f"{self.school.name} — {self.feature.name} ({status})"

class SubscriptionBilling(models.Model):
    """
    Billing records for school subscriptions.
    Lives in public schema.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='billing_records'
    )
    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.PROTECT
    )
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    
    billing_date = models.DateTimeField(auto_now_add=True)
    period_start = models.DateField()
    period_end = models.DateField()
    
    payment_method = models.CharField(max_length=50, default='RAZORPAY')
    transaction_id = models.CharField(max_length=100, unique=True)
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUCCESS')
    
    invoice_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'public_subscription_billing'
        ordering = ['-billing_date']

    def __str__(self):
        return f"{self.school.name} - {self.amount} ({self.billing_date.date()})"
