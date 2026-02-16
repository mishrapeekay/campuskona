"""
Tests for the tenants app — Subscription, School, Domain, TenantConfig,
FeatureDefinition, TenantFeature, and feature service.
"""

import pytest
import uuid
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import patch, MagicMock

from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.utils import timezone

from apps.tenants.models import (
    Subscription, School, Domain, TenantConfig,
    FeatureDefinition, TenantFeature,
)
from apps.tenants.features import get_tenant_features, has_feature, _tier_gte


# =====================
# Fixtures
# =====================

@pytest.fixture
def subscription(db):
    """Create a basic subscription."""
    return Subscription.objects.create(
        name='Basic Plan',
        description='Basic subscription plan',
        max_students=500,
        max_teachers=50,
        max_staff=20,
        price_monthly=Decimal('999.00'),
        price_yearly=Decimal('9990.00'),
        tier='BASIC',
    )


@pytest.fixture
def premium_subscription(db):
    """Create a premium subscription."""
    return Subscription.objects.create(
        name='Premium Plan',
        description='Premium subscription plan',
        max_students=5000,
        max_teachers=500,
        max_staff=200,
        price_monthly=Decimal('4999.00'),
        price_yearly=Decimal('49990.00'),
        tier='PREMIUM',
    )


@pytest.fixture
def school(db, subscription):
    """Create a test school with proper subscription."""
    return School.objects.create(
        name='Test High School',
        code='TEST001',
        schema_name='tenant_test',
        subdomain='test-school',
        email='admin@test.com',
        phone='9876543210',
        address='123 Test Street',
        city='Test City',
        state='Test State',
        country='India',
        pincode='123456',
        subscription=subscription,
        subscription_start_date=date.today() - timedelta(days=30),
        subscription_end_date=date.today() + timedelta(days=335),
        is_active=True,
        auto_create_schema=False,  # Don't create actual PostgreSQL schema in SQLite tests
    )


@pytest.fixture
def expired_school(db, subscription):
    """Create a school with expired subscription."""
    return School.objects.create(
        name='Expired School',
        code='EXP001',
        schema_name='tenant_expired',
        subdomain='expired-school',
        email='admin@expired.com',
        phone='9876543299',
        address='456 Expired Street',
        city='Test City',
        state='Test State',
        country='India',
        pincode='123456',
        subscription=subscription,
        subscription_start_date=date.today() - timedelta(days=400),
        subscription_end_date=date.today() - timedelta(days=35),
        is_active=True,
        auto_create_schema=False,
    )


@pytest.fixture
def feature_basic(db):
    """Create a BASIC-tier feature."""
    return FeatureDefinition.objects.create(
        code='attendance_management',
        name='Attendance Management',
        category='CORE',
        minimum_tier='BASIC',
        is_active=True,
    )


@pytest.fixture
def feature_premium(db):
    """Create a PREMIUM-tier feature."""
    return FeatureDefinition.objects.create(
        code='ai_timetable_generator',
        name='AI Timetable Generator',
        category='AI_PREMIUM',
        minimum_tier='PREMIUM',
        is_active=True,
    )


# =====================
# Subscription Tests
# =====================

@pytest.mark.django_db
class TestSubscription:

    def test_create_subscription(self, subscription):
        assert subscription.name == 'Basic Plan'
        assert subscription.tier == 'BASIC'
        assert subscription.price_monthly == Decimal('999.00')
        assert subscription.is_active is True
        assert isinstance(subscription.id, uuid.UUID)

    def test_subscription_name_unique(self, subscription):
        with pytest.raises(IntegrityError):
            Subscription.objects.create(
                name='Basic Plan',
                price_monthly=Decimal('500.00'),
                price_yearly=Decimal('5000.00'),
            )

    def test_tier_choices(self, db):
        for tier in ['BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE']:
            sub = Subscription.objects.create(
                name=f'{tier} Plan',
                price_monthly=Decimal('100.00'),
                price_yearly=Decimal('1000.00'),
                tier=tier,
            )
            assert sub.tier == tier

    def test_default_limits(self, subscription):
        assert subscription.max_students == 500
        assert subscription.max_teachers == 50
        assert subscription.max_staff == 20

    def test_str_representation(self, subscription):
        assert str(subscription) == 'Basic Plan'

    def test_ordering(self, db):
        Subscription.objects.create(
            name='Expensive', price_monthly=Decimal('5000.00'), price_yearly=Decimal('50000.00'),
        )
        Subscription.objects.create(
            name='Cheap', price_monthly=Decimal('100.00'), price_yearly=Decimal('1000.00'),
        )
        subs = list(Subscription.objects.all())
        assert subs[0].price_monthly <= subs[-1].price_monthly


# =====================
# School Tests
# =====================

@pytest.mark.django_db
class TestSchool:

    def test_create_school(self, school):
        assert school.name == 'Test High School'
        assert school.code == 'TEST001'
        assert school.is_active is True
        assert isinstance(school.id, uuid.UUID)

    def test_code_validator_uppercase(self, subscription):
        """Code must be uppercase letters and numbers only."""
        school = School(
            name='Test',
            code='abc',  # lowercase — should fail
            schema_name='tenant_abc',
            subdomain='abc-school',
            email='a@b.com',
            phone='1234567890',
            address='Addr',
            city='City',
            state='State',
            pincode='123456',
            subscription=subscription,
            subscription_start_date=date.today(),
            subscription_end_date=date.today() + timedelta(days=365),
            auto_create_schema=False,
        )
        with pytest.raises(ValidationError):
            school.full_clean()

    def test_code_unique(self, school, subscription):
        with pytest.raises(IntegrityError):
            School.objects.create(
                name='Another School',
                code='TEST001',  # duplicate
                schema_name='tenant_another',
                subdomain='another-school',
                email='x@y.com',
                phone='9999999999',
                address='Addr',
                city='City',
                state='State',
                pincode='123456',
                subscription=subscription,
                subscription_start_date=date.today(),
                subscription_end_date=date.today() + timedelta(days=365),
                auto_create_schema=False,
            )

    def test_subdomain_validator(self, subscription):
        """Subdomain must be lowercase letters, numbers, and hyphens."""
        school = School(
            name='Test',
            code='TST002',
            schema_name='tenant_tst',
            subdomain='Invalid_Sub',  # underscore — should fail
            email='a@b.com',
            phone='1234567890',
            address='Addr',
            city='City',
            state='State',
            pincode='123456',
            subscription=subscription,
            subscription_start_date=date.today(),
            subscription_end_date=date.today() + timedelta(days=365),
            auto_create_schema=False,
        )
        with pytest.raises(ValidationError):
            school.full_clean()

    def test_is_subscription_active_true(self, school):
        assert school.is_subscription_active is True

    def test_is_subscription_active_expired(self, expired_school):
        assert expired_school.is_subscription_active is False

    def test_is_subscription_active_inactive_school(self, school):
        school.is_active = False
        school.save()
        assert school.is_subscription_active is False

    def test_days_until_expiry_positive(self, school):
        assert school.days_until_expiry > 0

    def test_days_until_expiry_expired(self, expired_school):
        assert expired_school.days_until_expiry < 0

    def test_default_board(self, school):
        assert school.primary_board == 'CBSE'

    def test_default_country(self, school):
        assert school.country == 'India'

    def test_str_representation(self, school):
        result = str(school)
        assert 'Test High School' in result


# =====================
# Domain Tests
# =====================

@pytest.mark.django_db
class TestDomain:

    def test_create_domain(self, school):
        domain = Domain.objects.create(
            domain='test.schoolmgmt.com',
            tenant=school,
            is_primary=True,
        )
        assert domain.domain == 'test.schoolmgmt.com'
        assert domain.is_primary is True

    def test_domain_uniqueness(self, school):
        Domain.objects.create(
            domain='unique.schoolmgmt.com',
            tenant=school,
        )
        with pytest.raises(IntegrityError):
            Domain.objects.create(
                domain='unique.schoolmgmt.com',
                tenant=school,
            )


# =====================
# TenantConfig Tests
# =====================

@pytest.mark.django_db
class TestTenantConfig:

    def test_create_config(self, school):
        config = TenantConfig.objects.create(school=school)
        assert config.enable_online_payments is True
        assert config.enable_sms_notifications is True
        assert config.enable_biometric_attendance is False
        assert config.enable_hostel is False
        assert config.academic_year_start_month == 4

    def test_config_defaults(self, school):
        config = TenantConfig.objects.create(school=school)
        assert config.late_fee_enabled is True
        assert config.late_fee_amount == Decimal('100')
        assert config.late_fee_grace_days == 5
        assert config.email_quota_monthly == 10000

    def test_one_to_one_constraint(self, school):
        TenantConfig.objects.create(school=school)
        with pytest.raises(IntegrityError):
            TenantConfig.objects.create(school=school)


# =====================
# FeatureDefinition Tests
# =====================

@pytest.mark.django_db
class TestFeatureDefinition:

    def test_create_feature(self, feature_basic):
        assert feature_basic.code == 'attendance_management'
        assert feature_basic.category == 'CORE'
        assert feature_basic.minimum_tier == 'BASIC'
        assert feature_basic.is_active is True

    def test_code_uniqueness(self, feature_basic):
        with pytest.raises(IntegrityError):
            FeatureDefinition.objects.create(
                code='attendance_management',
                name='Duplicate',
                category='CORE',
                minimum_tier='BASIC',
            )

    def test_all_categories(self, db):
        categories = ['CORE', 'ACADEMICS', 'COMMUNICATION', 'FINANCE', 'OPERATIONS', 'AI_PREMIUM']
        for cat in categories:
            FeatureDefinition.objects.create(
                code=f'feature_{cat.lower()}',
                name=f'Feature {cat}',
                category=cat,
                minimum_tier='BASIC',
            )
        assert FeatureDefinition.objects.count() == len(categories)

    def test_global_kill_switch(self, feature_basic):
        feature_basic.is_active = False
        feature_basic.save()
        feature_basic.refresh_from_db()
        assert feature_basic.is_active is False


# =====================
# TenantFeature Tests
# =====================

@pytest.mark.django_db
class TestTenantFeature:

    def test_create_override(self, school, feature_basic):
        tf = TenantFeature.objects.create(
            school=school,
            feature=feature_basic,
            is_enabled=True,
        )
        assert tf.is_enabled is True
        assert tf.enabled_at is not None

    def test_unique_together(self, school, feature_basic):
        TenantFeature.objects.create(
            school=school, feature=feature_basic, is_enabled=True,
        )
        with pytest.raises(IntegrityError):
            TenantFeature.objects.create(
                school=school, feature=feature_basic, is_enabled=False,
            )

    def test_disable_feature(self, school, feature_basic):
        tf = TenantFeature.objects.create(
            school=school, feature=feature_basic, is_enabled=False,
            override_reason='Not needed',
        )
        assert tf.is_enabled is False
        assert tf.override_reason == 'Not needed'


# =====================
# Feature Service Tests
# =====================

@pytest.mark.django_db
class TestFeatureService:

    def test_tier_hierarchy(self):
        assert _tier_gte('BASIC', 'BASIC') is True
        assert _tier_gte('STANDARD', 'BASIC') is True
        assert _tier_gte('PREMIUM', 'BASIC') is True
        assert _tier_gte('ENTERPRISE', 'BASIC') is True
        assert _tier_gte('BASIC', 'STANDARD') is False
        assert _tier_gte('BASIC', 'PREMIUM') is False
        assert _tier_gte('STANDARD', 'PREMIUM') is False
        assert _tier_gte('PREMIUM', 'ENTERPRISE') is False
        assert _tier_gte('ENTERPRISE', 'ENTERPRISE') is True

    def test_get_tenant_features_basic_school(self, school, feature_basic, feature_premium):
        """Basic school should have BASIC features but not PREMIUM."""
        features = get_tenant_features(school)
        assert features.get('attendance_management') is True
        assert features.get('ai_timetable_generator') is False

    def test_get_tenant_features_with_override(self, school, feature_premium):
        """Override should grant PREMIUM feature to BASIC school."""
        TenantFeature.objects.create(
            school=school, feature=feature_premium, is_enabled=True,
            override_reason='Promotional access',
        )
        features = get_tenant_features(school)
        assert features.get('ai_timetable_generator') is True

    def test_get_tenant_features_disable_override(self, school, feature_basic):
        """Override can disable a feature the school would normally have."""
        TenantFeature.objects.create(
            school=school, feature=feature_basic, is_enabled=False,
        )
        features = get_tenant_features(school)
        assert features.get('attendance_management') is False

    def test_has_feature_true(self, school, feature_basic):
        assert has_feature(school, 'attendance_management') is True

    def test_has_feature_false(self, school, feature_premium):
        assert has_feature(school, 'ai_timetable_generator') is False

    def test_has_feature_nonexistent(self, school):
        assert has_feature(school, 'nonexistent_feature') is False

    def test_inactive_feature_returns_false(self, school, feature_basic):
        """Globally disabled feature should not appear in tenant features."""
        feature_basic.is_active = False
        feature_basic.save()
        assert has_feature(school, 'attendance_management') is False

    @patch('apps.tenants.features.cache')
    def test_features_are_cached(self, mock_cache, school, feature_basic):
        """Verify features use caching."""
        mock_cache.get.return_value = None
        get_tenant_features(school)
        # Should have called cache.set
        assert mock_cache.set.called


# =====================
# API Tests
# =====================

@pytest.mark.django_db
class TestTenantAPI:

    def test_school_list_requires_auth(self, api_client):
        """Unauthenticated request to schools should return 401."""
        response = api_client.get('/api/v1/tenants/schools/')
        assert response.status_code == 401

    def test_school_list_requires_super_admin(self, authenticated_client):
        """Regular authenticated user should get 403 for school management."""
        response = authenticated_client.get('/api/v1/tenants/schools/')
        assert response.status_code == 403

    def test_feature_definitions_requires_auth(self, api_client):
        response = api_client.get('/api/v1/tenants/feature-definitions/')
        assert response.status_code == 401
