"""
Tests for the core app — AuditLog, SoftDeleteModel, utilities, and database router.
"""

import pytest
import uuid
from datetime import date, datetime, timedelta
from unittest.mock import MagicMock

from django.utils import timezone

from apps.core.models import AuditLog, BaseModel, SoftDeleteModel
from apps.core.db_router import (
    get_current_tenant, set_current_tenant, clear_current_tenant,
    TenantDatabaseRouter,
)
from apps.core.utils import (
    generate_unique_code,
    generate_admission_number,
    generate_employee_id,
    calculate_age,
    get_academic_year,
    get_financial_year,
    sanitize_filename,
    get_client_ip,
    paginate_queryset,
    calculate_percentage,
    is_working_day,
    get_next_working_day,
    chunk_list,
    mask_sensitive_data,
)


# =====================
# AuditLog Model Tests
# =====================

@pytest.mark.django_db
class TestAuditLog:
    """Tests for AuditLog model."""

    def test_create_audit_log(self, user):
        log = AuditLog.objects.create(
            user=user,
            action='CREATE',
            model_name='Student',
            object_id=str(uuid.uuid4()),
            object_repr='Student: John Doe',
        )
        assert log.id is not None
        assert log.action == 'CREATE'
        assert log.model_name == 'Student'
        assert log.timestamp is not None

    def test_audit_log_action_choices(self, user):
        for action in ['CREATE', 'UPDATE', 'DELETE']:
            log = AuditLog.objects.create(
                user=user,
                action=action,
                model_name='TestModel',
                object_id='1',
            )
            assert log.action == action

    def test_audit_log_json_changes(self, user):
        changes = {'name': {'old': 'John', 'new': 'Jane'}}
        log = AuditLog.objects.create(
            user=user,
            action='UPDATE',
            model_name='Student',
            object_id='1',
            changes=changes,
        )
        assert log.changes == changes

    def test_audit_log_nullable_fields(self):
        log = AuditLog.objects.create(
            action='CREATE',
            model_name='Student',
            object_id='1',
        )
        assert log.user is None
        assert log.school is None
        assert log.ip_address is None

    def test_audit_log_ordering(self, user):
        log1 = AuditLog.objects.create(
            user=user, action='CREATE', model_name='A', object_id='1',
        )
        log2 = AuditLog.objects.create(
            user=user, action='UPDATE', model_name='B', object_id='2',
        )
        logs = list(AuditLog.objects.all())
        # Ordered by -timestamp, so newest first
        assert logs[0].id == log2.id

    def test_audit_log_str(self, user):
        log = AuditLog.objects.create(
            user=user,
            action='CREATE',
            model_name='Student',
            object_id='1',
        )
        assert 'CREATE' in str(log)
        assert 'Student' in str(log)

    def test_audit_log_with_ip_and_user_agent(self, user):
        log = AuditLog.objects.create(
            user=user,
            action='CREATE',
            model_name='Student',
            object_id='1',
            ip_address='192.168.1.1',
            user_agent='Mozilla/5.0',
        )
        assert log.ip_address == '192.168.1.1'
        assert log.user_agent == 'Mozilla/5.0'

    def test_audit_log_uuid_primary_key(self, user):
        log = AuditLog.objects.create(
            user=user, action='CREATE', model_name='Test', object_id='1',
        )
        assert isinstance(log.id, uuid.UUID)


# =====================
# SoftDeleteModel Tests
# =====================

@pytest.mark.django_db
class TestSoftDeleteModel:
    """Tests for SoftDeleteModel using AuditLog as a proxy
    (AuditLog extends BaseModel, not SoftDeleteModel, so we test the concept
    via the abstract class behavior).

    Since SoftDeleteModel is abstract, we test through concrete models that use it.
    Most tenant models like Student, Class, etc. extend SoftDeleteModel.
    For unit testing the abstract model, we verify its method signatures.
    """

    def test_soft_delete_model_methods_exist(self):
        """Verify SoftDeleteModel has the expected methods."""
        assert hasattr(SoftDeleteModel, 'delete')
        assert hasattr(SoftDeleteModel, 'hard_delete')
        assert hasattr(SoftDeleteModel, 'restore')

    def test_soft_delete_model_fields(self):
        """Verify SoftDeleteModel has the expected fields."""
        field_names = [f.name for f in SoftDeleteModel._meta.get_fields()]
        assert 'is_deleted' in field_names
        assert 'deleted_at' in field_names
        assert 'id' in field_names
        assert 'created_at' in field_names
        assert 'updated_at' in field_names

    def test_soft_delete_model_is_abstract(self):
        assert SoftDeleteModel._meta.abstract is True

    def test_base_model_is_abstract(self):
        assert BaseModel._meta.abstract is True


# =====================
# Utility Function Tests
# =====================

class TestGenerateUniqueCode:
    def test_default_length(self):
        code = generate_unique_code()
        assert len(code) == 8

    def test_custom_length(self):
        code = generate_unique_code(length=12)
        assert len(code) == 12

    def test_with_prefix(self):
        code = generate_unique_code(prefix='SCH')
        assert code.startswith('SCH')
        assert len(code) == 3 + 8  # prefix + default length

    def test_uniqueness(self):
        codes = {generate_unique_code() for _ in range(100)}
        assert len(codes) == 100  # All should be unique


class TestGenerateAdmissionNumber:
    def test_format(self):
        num = generate_admission_number('SCH001')
        parts = num.split('/')
        assert len(parts) == 3
        assert parts[0] == 'SCH001'

    def test_custom_year(self):
        num = generate_admission_number('SCH001', year=2025)
        assert '/2025/' in num

    def test_default_year(self):
        num = generate_admission_number('SCH001')
        assert f'/{datetime.now().year}/' in num


class TestGenerateEmployeeId:
    def test_with_department(self):
        eid = generate_employee_id('SCH001', 'MATH')
        assert eid.startswith('SCH001/MATH/')

    def test_without_department(self):
        eid = generate_employee_id('SCH001')
        assert eid.startswith('SCH001/')
        parts = eid.split('/')
        assert len(parts) == 2


class TestCalculateAge:
    def test_age_calculation(self):
        dob = date(2000, 1, 1)
        age = calculate_age(dob)
        expected = datetime.now().year - 2000
        if (datetime.now().month, datetime.now().day) < (1, 1):
            expected -= 1
        assert age == expected

    def test_age_with_datetime(self):
        dob = datetime(2000, 6, 15)
        age = calculate_age(dob)
        assert isinstance(age, int)
        assert age >= 0


class TestGetAcademicYear:
    def test_after_april(self):
        d = datetime(2025, 6, 1)
        assert get_academic_year(d) == '2025-2026'

    def test_before_april(self):
        d = datetime(2025, 2, 1)
        assert get_academic_year(d) == '2024-2025'

    def test_april_boundary(self):
        d = datetime(2025, 4, 1)
        assert get_academic_year(d) == '2025-2026'

    def test_default_date(self):
        result = get_academic_year()
        assert isinstance(result, str)
        assert '-' in result


class TestGetFinancialYear:
    def test_after_april(self):
        d = datetime(2025, 6, 1)
        assert get_financial_year(d) == 'FY 2025-26'

    def test_before_april(self):
        d = datetime(2025, 2, 1)
        assert get_financial_year(d) == 'FY 2024-25'


class TestSanitizeFilename:
    def test_normal_filename(self):
        assert sanitize_filename('report.pdf') == 'report.pdf'

    def test_special_characters(self):
        result = sanitize_filename('file<>name?.txt')
        assert '<' not in result
        assert '>' not in result
        assert '?' not in result

    def test_keeps_valid_chars(self):
        result = sanitize_filename('my-file_name (1).pdf')
        assert result == 'my-file_name (1).pdf'


class TestGetClientIp:
    def test_forwarded_ip(self):
        request = MagicMock()
        request.META = {'HTTP_X_FORWARDED_FOR': '1.2.3.4, 5.6.7.8'}
        assert get_client_ip(request) == '1.2.3.4'

    def test_remote_addr(self):
        request = MagicMock()
        request.META = {'REMOTE_ADDR': '10.0.0.1'}
        assert get_client_ip(request) == '10.0.0.1'

    def test_forwarded_takes_precedence(self):
        request = MagicMock()
        request.META = {
            'HTTP_X_FORWARDED_FOR': '1.2.3.4',
            'REMOTE_ADDR': '10.0.0.1',
        }
        assert get_client_ip(request) == '1.2.3.4'


class TestCalculatePercentage:
    def test_normal(self):
        assert calculate_percentage(75, 100) == 75.0

    def test_zero_total(self):
        assert calculate_percentage(10, 0) == 0.0

    def test_decimal_precision(self):
        result = calculate_percentage(1, 3)
        assert result == 33.33

    def test_full_marks(self):
        assert calculate_percentage(100, 100) == 100.0


class TestIsWorkingDay:
    def test_monday_is_working(self):
        # Find next Monday
        d = date(2025, 1, 6)  # Monday
        assert is_working_day(d) is True

    def test_saturday_is_working(self):
        d = date(2025, 1, 11)  # Saturday
        assert is_working_day(d) is True

    def test_sunday_not_working(self):
        d = date(2025, 1, 12)  # Sunday
        assert is_working_day(d) is False


class TestGetNextWorkingDay:
    def test_from_friday(self):
        friday = datetime(2025, 1, 10)  # Friday
        result = get_next_working_day(friday)
        assert result.weekday() == 5  # Saturday

    def test_from_sunday(self):
        sunday = datetime(2025, 1, 12)  # Sunday
        result = get_next_working_day(sunday)
        assert result.weekday() == 0  # Monday


class TestChunkList:
    def test_even_chunks(self):
        result = chunk_list([1, 2, 3, 4], 2)
        assert result == [[1, 2], [3, 4]]

    def test_uneven_chunks(self):
        result = chunk_list([1, 2, 3, 4, 5], 2)
        assert result == [[1, 2], [3, 4], [5]]

    def test_empty_list(self):
        assert chunk_list([], 5) == []


class TestMaskSensitiveData:
    def test_long_data(self):
        result = mask_sensitive_data('1234567890')
        assert result == '******7890'

    def test_short_data(self):
        result = mask_sensitive_data('abc')
        assert result == '***'

    def test_custom_visible(self):
        result = mask_sensitive_data('1234567890', visible_chars=2)
        assert result == '********90'

    def test_equal_length(self):
        result = mask_sensitive_data('abcd', visible_chars=4)
        assert result == '****'  # function masks all when length <= visible_chars


@pytest.mark.django_db
class TestPaginateQueryset:
    def test_basic_pagination(self):
        # Create some audit logs
        for i in range(25):
            AuditLog.objects.create(
                action='CREATE', model_name='Test', object_id=str(i),
            )
        qs = AuditLog.objects.all()
        items, total_pages, total_count = paginate_queryset(qs, page=1, page_size=10)
        assert total_count == 25
        assert total_pages == 3
        assert len(list(items)) == 10

    def test_last_page(self):
        for i in range(25):
            AuditLog.objects.create(
                action='CREATE', model_name='Test', object_id=str(i),
            )
        qs = AuditLog.objects.all()
        items, total_pages, total_count = paginate_queryset(qs, page=3, page_size=10)
        assert len(list(items)) == 5


# =====================
# Database Router Tests
# =====================

class TestContextVarTenantStorage:
    """Test context variable tenant storage (safe for WSGI and ASGI)."""

    def test_default_is_none(self):
        clear_current_tenant()
        assert get_current_tenant() is None

    def test_set_and_get(self):
        mock_tenant = MagicMock()
        mock_tenant.schema_name = 'test_schema'
        set_current_tenant(mock_tenant)
        assert get_current_tenant() == mock_tenant
        clear_current_tenant()

    def test_clear(self):
        set_current_tenant('some_tenant')
        clear_current_tenant()
        assert get_current_tenant() is None


class TestTenantDatabaseRouter:
    """Test TenantDatabaseRouter app routing."""

    def setup_method(self):
        self.router = TenantDatabaseRouter()

    def test_public_apps(self):
        expected = {'auth', 'contenttypes', 'sessions', 'admin', 'authentication', 'tenants', 'core'}
        assert self.router.PUBLIC_APPS == expected

    def test_tenant_apps(self):
        expected = {
            'students', 'staff', 'academics', 'attendance', 'timetable',
            'examinations', 'finance', 'communication', 'transport', 'library',
            'admissions', 'hostel', 'hr_payroll', 'reports', 'privacy',
        }
        assert self.router.TENANT_APPS == expected

    def test_no_overlap(self):
        overlap = self.router.PUBLIC_APPS & self.router.TENANT_APPS
        assert len(overlap) == 0

    def test_db_for_read_returns_default(self):
        assert self.router.db_for_read(None) == 'default'

    def test_db_for_write_returns_default(self):
        assert self.router.db_for_write(None) == 'default'

    def test_allow_relation(self):
        assert self.router.allow_relation(None, None) is True

    def test_allow_migrate_default(self):
        assert self.router.allow_migrate('default', 'auth') is True

    def test_disallow_migrate_other_db(self):
        assert self.router.allow_migrate('other', 'auth') is False
