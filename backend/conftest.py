"""
Pytest configuration and fixtures for School Management System.

This file provides:
- Django setup
- Database fixtures
- User fixtures
- Tenant fixtures
- API client fixtures
- Factory fixtures
"""

import pytest
import uuid
from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.management import call_command
from rest_framework.test import APIClient
from apps.tenants.models import School, Subscription, FeatureDefinition
from apps.academics.models import AcademicYear, Board, Class, Subject
from apps.students.models import Student
from apps.staff.models import StaffMember
from apps.finance.models import FeeCategory

User = get_user_model()


# =====================
# Django Setup
# =====================

@pytest.fixture(scope='session', autouse=True)
def django_db_setup(django_db_blocker):
    """
    Custom database setup that ensures migrations are run.
    Uses Django's standard migrate command directly to bypass
    django-tenants' migrate_schemas (which requires PostgreSQL).
    """
    from django.core.management.commands.migrate import Command as MigrateCommand
    with django_db_blocker.unblock():
        cmd = MigrateCommand()
        cmd.handle(run_syncdb=True, verbosity=0, interactive=False,
                   database='default', app_label=None, check_unapplied=False,
                   fake=False, fake_initial=False, plan=False,
                   prune=False)

@pytest.fixture(scope='session')
def django_db_keepdb():
    """Keep test database between runs for speed."""
    return True


# =====================
# API Client Fixtures
# =====================

@pytest.fixture
def api_client():
    """Unauthenticated API client."""
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, user):
    """Authenticated API client with regular user."""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    """Authenticated API client with admin user."""
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def teacher_client(api_client, teacher_user):
    """Authenticated API client with teacher user."""
    api_client.force_authenticate(user=teacher_user)
    return api_client


@pytest.fixture
def student_client(api_client, student_user):
    """Authenticated API client with student user."""
    api_client.force_authenticate(user=student_user)
    return api_client


# =====================
# Tenant Fixtures
# =====================

@pytest.fixture
def subscription(db):
    """Create a basic subscription plan."""
    return Subscription.objects.create(
        name='Basic Plan',
        tier='BASIC',
        price_monthly=999,
        price_yearly=9999,
    )


@pytest.fixture
def premium_subscription(db):
    """Create a premium subscription plan."""
    return Subscription.objects.create(
        name='Premium Plan',
        tier='PREMIUM',
        price_monthly=4999,
        price_yearly=49999,
    )


@pytest.fixture
def tenant(db, subscription):
    """Create a test tenant (school)."""
    tenant = School.objects.create(
        name='Test High School',
        code='TST001',
        slug='test-school',
        schema_name='test_school',
        subdomain='test',
        email='admin@testschool.com',
        phone='9876543210',
        address='123 Test Street',
        city='Test City',
        state='Test State',
        country='India',
        pincode='123456',
        is_active=True,
        subscription=subscription,
        subscription_start_date=date.today(),
        subscription_end_date=date.today() + timedelta(days=365),
        auto_create_schema=False,
    )
    return tenant


@pytest.fixture
def tenant_demo(db, subscription):
    """Get or create demo tenant."""
    tenant, created = School.objects.get_or_create(
        slug='demo',
        defaults={
            'name': 'Demo High School',
            'code': 'DEMO01',
            'schema_name': 'school_demo',
            'subdomain': 'demo',
            'email': 'admin@demo.com',
            'phone': '9876543210',
            'address': '456 Demo Avenue',
            'city': 'Demo City',
            'state': 'Demo State',
            'country': 'India',
            'pincode': '654321',
            'is_active': True,
            'subscription': subscription,
            'subscription_start_date': date.today(),
            'subscription_end_date': date.today() + timedelta(days=365),
            'auto_create_schema': False,
        }
    )
    return tenant


# =====================
# User Fixtures
# =====================

@pytest.fixture
def user_password():
    """Standard password for test users."""
    return 'TestPass123!'


@pytest.fixture
def user(db, user_password):
    """Create a regular test user."""
    user = User.objects.create_user(
        email='user@test.com',
        password=user_password,
        first_name='Test',
        last_name='User',
        phone='9876543210',
        user_type='TEACHER',
        is_active=True
    )
    return user


@pytest.fixture
def admin_user(db, user_password):
    """Create an admin user."""
    user = User.objects.create_user(
        email='admin@test.com',
        password=user_password,
        first_name='Admin',
        last_name='User',
        phone='9876543211',
        user_type='SCHOOL_ADMIN',
        is_active=True,
        is_staff=True
    )
    return user


@pytest.fixture
def super_admin_user(db, user_password):
    """Create a super admin user."""
    user = User.objects.create_superuser(
        email='superadmin@test.com',
        password=user_password,
        first_name='Super',
        last_name='Admin',
        phone='9876543212',
        user_type='SUPER_ADMIN'
    )
    return user


@pytest.fixture
def teacher_user(db, user_password):
    """Create a teacher user."""
    user = User.objects.create_user(
        email='teacher@test.com',
        password=user_password,
        first_name='Teacher',
        last_name='Test',
        phone='9876543213',
        user_type='TEACHER',
        is_active=True
    )
    return user


@pytest.fixture
def student_user(db, user_password):
    """Create a student user."""
    user = User.objects.create_user(
        email='student@test.com',
        password=user_password,
        first_name='Student',
        last_name='Test',
        phone='9876543214',
        user_type='STUDENT',
        is_active=True
    )
    return user


@pytest.fixture
def parent_user(db, user_password):
    """Create a parent user."""
    user = User.objects.create_user(
        email='parent@test.com',
        password=user_password,
        first_name='Parent',
        last_name='Test',
        phone='9876543215',
        user_type='PARENT',
        is_active=True
    )
    return user


# =====================
# Academic Fixtures
# =====================

@pytest.fixture
def academic_year(db, tenant):
    """Create an academic year."""
    year = AcademicYear.objects.create(
        name='2025-2026',
        start_date=date(2025, 4, 1),
        end_date=date(2026, 3, 31),
        is_current=True
    )
    return year


@pytest.fixture
def board(db):
    """Create a board (CBSE)."""
    board = Board.objects.create(
        name='CBSE',
        code='CBSE',
        description='Central Board of Secondary Education',
        country='India'
    )
    return board


@pytest.fixture
def class_10(db, academic_year):
    """Create Class 10."""
    cls = Class.objects.create(
        name='10',
        section='A',
        academic_year=academic_year,
        capacity=40,
        classroom_number='101'
    )
    return cls


@pytest.fixture
def subject_math(db):
    """Create Math subject."""
    subject = Subject.objects.create(
        name='Mathematics',
        code='MATH',
        subject_type='CORE',
        description='Mathematics subject'
    )
    return subject


@pytest.fixture
def subject_science(db):
    """Create Science subject."""
    subject = Subject.objects.create(
        name='Science',
        code='SCI',
        subject_type='CORE',
        description='Science subject'
    )
    return subject


# =====================
# Student Fixtures
# =====================

@pytest.fixture
def student(db, student_user, class_10, academic_year):
    """Create a student profile."""
    student = Student.objects.create(
        user=student_user,
        enrollment_number='TEST2025001',
        admission_number='ADM001',
        first_name='Student',
        last_name='Test',
        date_of_birth=date(2010, 1, 1),
        gender='M',
        blood_group='O+',
        current_class=class_10,
        admission_date=date(2025, 4, 1),
        academic_year=academic_year,
        status='ACTIVE'
    )
    return student


# =====================
# Utility Fixtures
# =====================

@pytest.fixture
def mock_request(rf, user):
    """Create a mock request with authenticated user."""
    request = rf.get('/')
    request.user = user
    return request


@pytest.fixture
def mock_tenant_request(rf, user, tenant):
    """Create a mock request with tenant."""
    request = rf.get('/')
    request.user = user
    request.tenant = tenant
    return request


# =====================
# Parametrize Helpers
# =====================

@pytest.fixture
def user_types():
    """All user types for parametrized tests."""
    return [
        'SUPER_ADMIN',
        'SCHOOL_ADMIN',
        'PRINCIPAL',
        'TEACHER',
        'STUDENT',
        'PARENT',
        'ACCOUNTANT',
        'LIBRARIAN',
        'TRANSPORT_MANAGER'
    ]


@pytest.fixture
def api_methods():
    """HTTP methods for API testing."""
    return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']


# =====================
# Cleanup Fixtures
# =====================

@pytest.fixture(autouse=True)
def reset_sequences(db):
    """Reset database sequences after each test."""
    yield
    # Cleanup happens automatically with pytest-django


# =====================
# Logging Fixtures
# =====================

@pytest.fixture
def disable_logging():
    """Disable logging during tests for cleaner output."""
    import logging
    logging.disable(logging.CRITICAL)
    yield
    logging.disable(logging.NOTSET)


# =====================
# Time/Date Fixtures
# =====================

@pytest.fixture
def today():
    """Get today's date."""
    return timezone.now().date()


@pytest.fixture
def yesterday():
    """Get yesterday's date."""
    return timezone.now().date() - timedelta(days=1)


@pytest.fixture
def tomorrow():
    """Get tomorrow's date."""
    return timezone.now().date() + timedelta(days=1)


# =====================
# Factory Fixtures
# =====================

@pytest.fixture
def user_factory(db):
    """Factory function to create users."""
    def create_user(**kwargs):
        defaults = {
            'email': f'user{uuid.uuid4().hex[:8]}@test.com',
            'password': 'TestPass123!',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': f'98765{uuid.uuid4().hex[:5]}',
            'user_type': 'TEACHER',
            'is_active': True
        }
        defaults.update(kwargs)
        password = defaults.pop('password')
        user = User.objects.create_user(**defaults)
        user.set_password(password)
        user.save()
        return user
    return create_user


@pytest.fixture
def student_factory(db, user_factory):
    """Factory function to create students."""
    def create_student(**kwargs):
        user = kwargs.pop('user', None)
        if not user:
            user = user_factory(user_type='STUDENT')

        defaults = {
            'user': user,
            'enrollment_number': f'TEST{uuid.uuid4().hex[:8].upper()}',
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_of_birth': date(2010, 1, 1),
            'gender': 'M',
            'status': 'ACTIVE'
        }
        defaults.update(kwargs)
        return Student.objects.create(**defaults)
    return create_student


# =====================
# Feature Fixtures
# =====================

@pytest.fixture
def feature_definition(db):
    """Create a basic feature definition."""
    return FeatureDefinition.objects.create(
        code='test_feature',
        name='Test Feature',
        description='A test feature for unit testing',
        category='ACADEMIC',
        minimum_tier='BASIC',
        is_active=True,
    )


# =====================
# Staff Fixtures
# =====================

@pytest.fixture
def staff_member(db, teacher_user):
    """Create a staff member linked to teacher_user."""
    return StaffMember.objects.create(
        user=teacher_user,
        employee_id='EMP001',
        first_name='Teacher',
        last_name='Test',
        date_of_birth=date(1990, 5, 15),
        gender='M',
        phone_number='9876543213',
        email='teacher@test.com',
        designation='TEACHER',
        joining_date=date(2023, 4, 1),
        emergency_contact_name='Emergency Contact',
        emergency_contact_number='9876500001',
        emergency_contact_relation='Spouse',
        current_address_line1='123 Current St',
        current_city='Test City',
        current_state='Test State',
        current_pincode='123456',
        permanent_address_line1='456 Permanent St',
        permanent_city='Test City',
        permanent_state='Test State',
        permanent_pincode='654321',
    )


# =====================
# Finance Fixtures
# =====================

@pytest.fixture
def fee_category(db):
    """Create a mandatory fee category."""
    return FeeCategory.objects.create(
        name='Tuition Fee',
        code='TUITION',
        description='Monthly tuition fee',
        is_mandatory=True,
    )


# =====================
# Academic Year (Current) Fixture
# =====================

@pytest.fixture
def academic_year_current(db):
    """Create a current academic year (standalone, no tenant dependency)."""
    return AcademicYear.objects.create(
        name='2025-2026 Current',
        start_date=date(2025, 4, 1),
        end_date=date(2026, 3, 31),
        is_current=True,
    )
