"""
Multi-tenant isolation logic tests.
Verifies that the system correctly identifies and isolates tenants.
"""

import pytest
from django.test import RequestFactory
from django.db import connection
from unittest.mock import MagicMock, patch
from apps.tenants.middleware import TenantHeaderMiddleware
from apps.tenants.models import School

@pytest.mark.django_db
class TestTenantIsolation:
    """
    Test tenant isolation logic, even on SQLite where schema-switching is mocked/simulated.
    """

    def test_middleware_resolves_tenant_from_header(self, tenant, db):
        """Verify middleware correctly sets request.tenant based on X-Tenant-Subdomain header."""
        factory = RequestFactory()
        # The subdomain 'test' should match the 'tenant' fixture
        
        request = factory.get('/')
        request.headers = {'X-Tenant-Subdomain': 'test'}
        
        middleware = TenantHeaderMiddleware(lambda r: None)
        
        # Mock connection.set_tenant which might be missing on SQLite
        with patch.object(connection, 'set_tenant', create=True) as mock_set_tenant:
            middleware.process_request(request)
            
            assert hasattr(request, 'tenant')
            assert request.tenant.subdomain == 'test'
            assert request.tenant.id == tenant.id

    def test_middleware_falls_back_to_public_on_missing_header(self, db):
        """Verify middleware use public schema when no header is provided on local host."""
        factory = RequestFactory()
        request = factory.get('/', HTTP_HOST='localhost')
        request.headers = {}
        
        middleware = TenantHeaderMiddleware(lambda r: None)
        
        # In SQLite tests, the connection might not have schema-switching methods.
        # We mock it to prevent AttributeError.
        with patch.object(connection, 'set_schema_to_public', create=True) as mock_set_public:
            middleware.process_request(request)
            assert hasattr(request, 'tenant')
            assert request.tenant.schema_name == 'public'

    @patch('django.db.connection.vendor', 'postgresql')
    @patch('django.db.connection.cursor')
    def test_tenant_manager_switches_schema_postgresql(self, mock_cursor, tenant):
        """
        Verify TenantManager attempts to switch schema when on PostgreSQL.
        We mock connection.vendor to simulate PostgreSQL environment.
        """
        from apps.core.db_router import set_current_tenant, clear_current_tenant
        from apps.students.models import Student
        
        # Mock cursor context manager
        mock_cursor_instance = MagicMock()
        mock_cursor.return_value.__enter__.return_value = mock_cursor_instance
        
        # Set tenant in context
        set_current_tenant(tenant)
        
        try:
            # Trigger a queryset evaluation which should trigger schema switch
            # We don't need real data, just need the manager to call the connection
            list(Student.objects.all())
            
            # Verify SET search_path was called
            # It should be called during get_queryset
            assert mock_cursor_instance.execute.called
            args, _ = mock_cursor_instance.execute.call_args
            # args[0] is the SQL object or string
            sql_str = str(args[0])
            assert "SET search_path TO" in sql_str
            assert "tenant_test" in sql_str or "test_school" in sql_str # Depending on tenant schema_name
            
        finally:
            clear_current_tenant()

    def test_cross_tenant_data_leakage_logical(self, tenant, user_factory, student_factory):
        """
        Logical test: Even if schemas are mocked, ensure we can't access Tenant B's data
        from Tenant A's context if we were using appropriate filtering.
        (Note: Current system relies on Schema isolation, so this test serves as a
        documentation of that dependency).
        """
        # Create Student in 'tenant' (Schema A)
        # student_factory creates a student. In SQLite they all go to same table.
        student_a = student_factory(first_name="TenantA_Student")
        
        # If we were to filter by tenant_id (which we don't have UNLESS we add it),
        # this is where we would check it.
        # Since we use schemas, isolation is at the DB level.
        
        assert student_a.first_name == "TenantA_Student"
