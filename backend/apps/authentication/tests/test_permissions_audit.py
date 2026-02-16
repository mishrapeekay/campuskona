"""
Comprehensive Permission Audit Tests.
Verifies role-based access control (RBAC) across different modules.
"""

import pytest
from django.urls import reverse
from rest_framework import status

@pytest.mark.django_db
class TestRBACPermissions:
    """
    Test RBAC enforcement for various roles across the system.
    """

    # --- Configuration ---
    # format: (url_name, method, roles_that_should_have_access)
    ENDPOINTS = [
        # (url_name, method, allowed_roles)
        ('user-list', 'GET', ['SUPER_ADMIN', 'SCHOOL_ADMIN']),
        ('user-me', 'GET', ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'LIBRARIAN', 'TRANSPORT_MANAGER']),
        ('permission-list', 'GET', ['SUPER_ADMIN', 'SCHOOL_ADMIN']),
        ('role-list', 'GET', ['SUPER_ADMIN', 'SCHOOL_ADMIN']),
        ('school-list', 'GET', ['SUPER_ADMIN']),
        ('subscription-list', 'GET', ['SUPER_ADMIN', 'SCHOOL_ADMIN']),
        ('staffmember-list', 'GET', ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL']),
        ('student-list', 'GET', ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'TRANSPORT_MANAGER']),
        ('class-list', 'GET', ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'TRANSPORT_MANAGER']),
        ('feecategory-list', 'GET', ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT']),
    ]

    @pytest.mark.parametrize("url_name, method, allowed_roles", ENDPOINTS)
    def test_endpoint_permissions(self, api_client, user_factory, url_name, method, allowed_roles, user_types):
        """
        Parametrized test to check if each user type has correct access to each endpoint.
        """
        for user_role in user_types:
            # Create user with this role
            user = user_factory(user_type=user_role)
            api_client.force_authenticate(user=user)
            
            # Resolve URL (using naming convention, handle potential NoReverseMatch)
            try:
                # Some endpoints might need namespaces like 'api:v1:...'
                # For this test we'll try to find them or use hardcoded paths if needed
                # But let's assume we can resolve them.
                if ':' not in url_name:
                   url = f'/api/v1/auth/{url_name.replace("-list", "s/")}' # Fallback guestimate
                   # Better: check actual URL patterns if possible
                
                # For now, let's use common paths directly to be safe
                path_map = {
                    'user-list': '/api/v1/auth/users/',
                    'user-me': '/api/v1/auth/users/me/',
                    'permission-list': '/api/v1/auth/permissions/',
                    'role-list': '/api/v1/auth/roles/',
                    'school-list': '/api/v1/tenants/schools/',
                    'subscription-list': '/api/v1/tenants/subscriptions/',
                    'staffmember-list': '/api/v1/staff/members/',
                    'student-list': '/api/v1/students/students/',
                    'class-list': '/api/v1/academics/classes/',
                    'feecategory-list': '/api/v1/finance/fee-categories/',
                }
                url = path_map.get(url_name, f'/api/v1/{url_name}/')
                
                response = getattr(api_client, method.lower())(url)
                
                is_allowed = user_role in allowed_roles
                
                if is_allowed:
                    # Should be 200 OK or 201 Created etc.
                    assert response.status_code in [200, 201, 204], f"User {user_role} should have access to {url} but got {response.status_code}"
                else:
                    # Should be 403 Forbidden
                    assert response.status_code == 403, f"User {user_role} should NOT have access to {url} but got {response.status_code}"
            
            except Exception as e:
                # If URL resolve fails, we might need to skip or fix the mapping
                pytest.fail(f"Test failed for {url_name} with user {user_role}: {str(e)}")

    def test_librarian_restricted_from_finance(self, api_client, user_factory):
        """Librarian should not have access to finance endpoints."""
        librarian = user_factory(user_type='LIBRARIAN')
        api_client.force_authenticate(user=librarian)
        
        response = api_client.get('/api/v1/finance/fee-categories/')
        assert response.status_code == 403

    def test_student_restricted_from_staff(self, api_client, user_factory):
        """Student should not have access to staff endpoints."""
        student = user_factory(user_type='STUDENT')
        api_client.force_authenticate(user=student)
        
        response = api_client.get('/api/v1/staff/members/')
        assert response.status_code == 403
