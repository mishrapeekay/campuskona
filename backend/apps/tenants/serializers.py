"""
Serializers for tenants app.
"""

from rest_framework import serializers
from .models import Subscription, School, Domain, TenantConfig, TenantBranding, FeatureDefinition, TenantFeature


class SubscriptionSerializer(serializers.ModelSerializer):
    """
    Subscription serializer.
    """
    schools_count = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            'id', 'name', 'description', 'tier',
            'max_students', 'max_teachers', 'max_staff',
            'price_monthly', 'price_yearly', 'currency',
            'features', 'is_active', 'is_trial', 'trial_days',
            'schools_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_schools_count(self, obj):
        """Get count of schools using this subscription."""
        return obj.schools.count()


class DomainSerializer(serializers.ModelSerializer):
    """
    Domain serializer.
    """
    class Meta:
        model = Domain
        fields = [
            'id', 'domain', 'tenant', 'is_primary',
            'is_https', 'is_active', 'is_verified', 'ssl_status', 'dns_record',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'dns_record', 'created_at', 'updated_at']

    def create(self, validated_data):
        domain = super().create(validated_data)
        domain.generate_dns_record()
        domain.save()
        return domain


class TenantBrandingSerializer(serializers.ModelSerializer):
    """
    Tenant branding serializer.
    """
    class Meta:
        model = TenantBranding
        fields = [
            'id', 'school',
            'logo_light', 'logo_dark', 'icon',
            'primary_color', 'secondary_color', 'accent_color',
            'font_family', 'request_login', 'login_layout',
            'css_overrides',
            'email_header_image', 'pdf_header_image'
        ]
        read_only_fields = ['id', 'school']


class TenantConfigSerializer(serializers.ModelSerializer):
    """
    Tenant configuration serializer.
    """
    class Meta:
        model = TenantConfig
        fields = [
            'id', 'school',
            'enable_online_payments', 'enable_sms_notifications',
            'enable_email_notifications', 'enable_biometric_attendance',
            'enable_mobile_app', 'enable_parent_portal',
            'enable_library', 'enable_transport', 'enable_hostel',
            'enable_hr_payroll',
            'academic_year_start_month', 'working_days',
            'language',
            'attendance_marking_time', 'late_arrival_time',
            'late_fee_enabled', 'late_fee_amount', 'late_fee_grace_days',
            'sms_balance', 'email_quota_monthly',
            'custom_settings'
        ]
        read_only_fields = ['id']


class SchoolSerializer(serializers.ModelSerializer):
    """
    School serializer.
    """
    domains = DomainSerializer(many=True, read_only=True)
    branding = TenantBrandingSerializer(read_only=True)
    config = TenantConfigSerializer(read_only=True)
    subscription_name = serializers.CharField(source='subscription.name', read_only=True)
    is_subscription_active = serializers.BooleanField(read_only=True)
    days_until_expiry = serializers.IntegerField(read_only=True)
    
    # New aggregate stats fields
    total_students = serializers.SerializerMethodField()
    active_users = serializers.SerializerMethodField()
    total_classes = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = [
            'id', 'name', 'code', 'schema_name', 'subdomain',
            'email', 'phone', 'address', 'city', 'state', 'country', 'pincode',
            'primary_board', 'supported_boards',
            'logo', 'primary_color', 'secondary_color',
            'subscription', 'subscription_name', 'subscription_start_date',
            'subscription_end_date', 'is_subscription_active', 'days_until_expiry',
            'is_active', 'is_trial', 'settings',
            'domains', 'branding', 'config',
            'total_students', 'active_users', 'total_classes',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = [
            'id', 'schema_name', 'created_at', 'updated_at',
            'created_by', 'is_subscription_active', 'days_until_expiry'
        ]

    def get_total_students(self, obj):
        """Get total students in school schema."""
        from django_tenants.utils import tenant_context
        from apps.authentication.models import User
        try:
            with tenant_context(obj):
                return User.objects.filter(user_type='STUDENT').count()
        except Exception:
            return 0

    def get_active_users(self, obj):
        """Get total active users in school schema."""
        from django_tenants.utils import tenant_context
        from apps.authentication.models import User
        try:
            with tenant_context(obj):
                return User.objects.filter(is_active=True).count()
        except Exception:
            return 0

    def get_total_classes(self, obj):
        """Get total classes in school schema."""
        from django_tenants.utils import tenant_context
        from apps.academics.models import Class  # Correct import path
        try:
            with tenant_context(obj):
                return Class.objects.count()
        except Exception:
            return 0


class SchoolCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating schools.
    """
    class Meta:
        model = School
        fields = [
            'name', 'code', 'subdomain',
            'email', 'phone', 'address', 'city', 'state', 'country', 'pincode',
            'primary_board', 'supported_boards',
            'subscription', 'subscription_start_date', 'subscription_end_date',
            'is_trial'
        ]

    def create(self, validated_data):
        """Create school with auto schema creation."""
        school = School.objects.create(**validated_data)

        # Create default tenant config
        TenantConfig.objects.create(school=school)

        return school


# ============================================================================
# FEATURE FLAG SERIALIZERS
# ============================================================================

class FeatureDefinitionSerializer(serializers.ModelSerializer):
    """Serializer for FeatureDefinition model."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    minimum_tier_display = serializers.CharField(source='get_minimum_tier_display', read_only=True)

    class Meta:
        model = FeatureDefinition
        fields = [
            'id', 'code', 'name', 'description',
            'category', 'category_display',
            'minimum_tier', 'minimum_tier_display',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TenantFeatureSerializer(serializers.ModelSerializer):
    """Serializer for TenantFeature model (override records)."""
    feature_code = serializers.CharField(source='feature.code', read_only=True)
    feature_name = serializers.CharField(source='feature.name', read_only=True)
    feature_category = serializers.CharField(source='feature.category', read_only=True)
    feature_minimum_tier = serializers.CharField(source='feature.minimum_tier', read_only=True)

    class Meta:
        model = TenantFeature
        fields = [
            'id', 'school', 'feature',
            'feature_code', 'feature_name', 'feature_category', 'feature_minimum_tier',
            'is_enabled', 'enabled_at', 'disabled_at',
            'override_reason', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'enabled_at', 'created_at', 'updated_at']


class TenantFeatureToggleSerializer(serializers.Serializer):
    """Serializer for toggling a feature for a school."""
    feature_code = serializers.CharField(max_length=100)
    is_enabled = serializers.BooleanField()
    override_reason = serializers.CharField(max_length=500, required=False, default='')


class TenantFeaturesMapSerializer(serializers.Serializer):
    """Serializer for the features map returned to frontend/mobile."""
    # Dynamic dict of feature_code -> bool
    # Represented as a flat JSON object
    pass
