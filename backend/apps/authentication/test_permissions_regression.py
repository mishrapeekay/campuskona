"""
Permission regression tests — verifies that the DEFAULT_PERMISSION_CLASSES=IsAuthenticated
enforcement is working correctly:
1. Public endpoints (login, register, etc.) remain accessible without auth
2. Protected endpoints reject unauthenticated requests with 401
3. Protected endpoints accept authenticated requests
4. Role-based permissions enforce correctly
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


# =====================
# Fixtures
# =====================

@pytest.fixture
def anon_client():
    """Unauthenticated API client."""
    return APIClient()


@pytest.fixture
def super_admin_client(db):
    """Authenticated client with super admin privileges."""
    user = User.objects.create_superuser(
        email='superadmin_perm@test.com',
        password='TestPass123!',
        first_name='Super',
        last_name='Admin',
        phone='9999999990',
        user_type='SUPER_ADMIN',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def school_admin_client(db):
    """Authenticated client with school admin privileges."""
    user = User.objects.create_user(
        email='schooladmin_perm@test.com',
        password='TestPass123!',
        first_name='School',
        last_name='Admin',
        phone='9999999991',
        user_type='SCHOOL_ADMIN',
        is_staff=True,
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def teacher_client(db):
    """Authenticated client with teacher privileges."""
    user = User.objects.create_user(
        email='teacher_perm@test.com',
        password='TestPass123!',
        first_name='Teacher',
        last_name='Test',
        phone='9999999992',
        user_type='TEACHER',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def login_user(db):
    """User for login flow tests."""
    user = User.objects.create_user(
        email='logintest@test.com',
        password='TestPass123!',
        first_name='Login',
        last_name='Test',
        phone='9999999993',
        user_type='TEACHER',
    )
    return user


# =====================
# Public Endpoints (AllowAny) — Should NOT return 401
# =====================

@pytest.mark.django_db
class TestPublicEndpoints:
    """Endpoints that MUST remain accessible without authentication."""

    def test_login_accessible(self, anon_client):
        """POST /api/v1/auth/login/ should accept unauthenticated requests.
        It may return 400 (bad credentials) but NOT 401/403."""
        response = anon_client.post('/api/v1/auth/login/', {
            'email': 'nonexistent@test.com',
            'password': 'wrong',
        })
        # Should get 400 or 401 (auth failure), but NOT 403 (forbidden)
        # and critically, should NOT get "Authentication credentials were not provided"
        assert response.status_code != 403

    def test_login_with_valid_credentials(self, anon_client, login_user):
        """Login with valid credentials should return 200 with tokens."""
        response = anon_client.post('/api/v1/auth/login/', {
            'email': 'logintest@test.com',
            'password': 'TestPass123!',
        })
        assert response.status_code == 200
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_token_refresh_accessible(self, anon_client, login_user):
        """POST /api/v1/auth/refresh/ should accept unauthenticated requests."""
        # First login to get a refresh token
        login_response = anon_client.post('/api/v1/auth/login/', {
            'email': 'logintest@test.com',
            'password': 'TestPass123!',
        })
        refresh_token = login_response.data.get('refresh')
        assert refresh_token is not None

        # Now refresh
        response = anon_client.post('/api/v1/auth/refresh/', {
            'refresh': refresh_token,
        })
        assert response.status_code == 200
        assert 'access' in response.data

    def test_register_accessible(self, anon_client):
        """POST /api/v1/auth/register/ should accept unauthenticated requests.
        We send incomplete data to get a 400 (validation error), which proves
        the endpoint is reachable without auth. Sending valid data would hit
        the email token creation which fails on SQLite (UUID compat).
        """
        response = anon_client.post('/api/v1/auth/register/', {
            'email': 'newuser@test.com',
        })
        # 400 = validation error (reached the view, no auth block)
        # NOT 401 or 403
        assert response.status_code != 401
        assert response.status_code != 403

    def test_verify_email_accessible(self, anon_client):
        """POST /api/v1/auth/verify-email/ should accept unauthenticated requests."""
        response = anon_client.post('/api/v1/auth/verify-email/', {
            'token': 'invalid-token',
        })
        # Should be 400 (invalid token), NOT 401/403
        assert response.status_code == 400

    def test_password_reset_request_accessible(self, anon_client):
        """POST /api/v1/auth/password-reset/ should accept unauthenticated requests."""
        response = anon_client.post('/api/v1/auth/password-reset/', {
            'email': 'nonexistent@test.com',
        })
        # Should be 200 (doesn't reveal if email exists) or 400, NOT 401/403
        assert response.status_code in [200, 400]
        assert response.status_code != 401
        assert response.status_code != 403

    def test_password_reset_confirm_accessible(self, anon_client):
        """POST /api/v1/auth/password-reset/confirm/ should accept unauthenticated requests."""
        response = anon_client.post('/api/v1/auth/password-reset/confirm/', {
            'token': 'invalid-token',
            'new_password': 'NewPass123!',
            'new_password_confirm': 'NewPass123!',
        })
        # Should be 400 (invalid token), NOT 401/403
        assert response.status_code == 400


# =====================
# Protected Auth Endpoints — Should return 401 for unauthenticated
# =====================

@pytest.mark.django_db
class TestProtectedAuthEndpoints:
    """Auth endpoints that require authentication."""

    def test_logout_requires_auth(self, anon_client):
        response = anon_client.post('/api/v1/auth/logout/')
        assert response.status_code == 401

    def test_change_password_requires_auth(self, anon_client):
        response = anon_client.post('/api/v1/auth/change-password/', {
            'old_password': 'TestPass123!',
            'new_password': 'NewPass456!',
            'new_password_confirm': 'NewPass456!',
        })
        assert response.status_code == 401

    def test_users_me_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/auth/users/me/')
        assert response.status_code == 401

    def test_users_list_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/auth/users/')
        assert response.status_code == 401


# =====================
# Protected Data Endpoints — Regression for AllowAny fixes
# =====================

@pytest.mark.django_db
class TestProtectedDataEndpoints:
    """These ViewSets were JUST changed from AllowAny to IsAuthenticated.
    Verify they now properly reject unauthenticated requests."""

    def test_staff_list_requires_auth(self, anon_client):
        """StaffMemberViewSet was AllowAny, now IsAuthenticated."""
        response = anon_client.get('/api/v1/staff/members/')
        assert response.status_code == 401

    def test_student_attendance_requires_auth(self, anon_client):
        """StudentAttendanceViewSet was AllowAny, now IsAuthenticated."""
        response = anon_client.get('/api/v1/attendance/student-attendance/')
        assert response.status_code == 401

    def test_classes_requires_auth(self, anon_client):
        """ClassViewSet was AllowAny, now IsAuthenticated."""
        response = anon_client.get('/api/v1/academics/classes/')
        assert response.status_code == 401

    def test_sections_requires_auth(self, anon_client):
        """SectionViewSet was AllowAny, now IsAuthenticated."""
        response = anon_client.get('/api/v1/academics/sections/')
        assert response.status_code == 401


# =====================
# Protected Endpoints Accept Authenticated Requests
# =====================

@pytest.mark.django_db
class TestAuthenticatedAccess:
    """Verify protected endpoints work with valid authentication."""

    def test_users_me_with_auth(self, teacher_client):
        response = teacher_client.get('/api/v1/auth/users/me/')
        assert response.status_code == 200

    def test_staff_list_with_auth(self, teacher_client):
        response = teacher_client.get('/api/v1/staff/members/')
        assert response.status_code == 200

    def test_classes_with_auth(self, teacher_client):
        response = teacher_client.get('/api/v1/academics/classes/')
        assert response.status_code == 200

    def test_sections_with_auth(self, teacher_client):
        response = teacher_client.get('/api/v1/academics/sections/')
        assert response.status_code == 200

    def test_student_attendance_with_auth(self, teacher_client):
        response = teacher_client.get('/api/v1/attendance/student-attendance/')
        assert response.status_code == 200


# =====================
# Role-Based Access Control
# =====================

@pytest.mark.django_db
class TestRoleBasedAccess:
    """Verify role-based permissions enforce correctly."""

    def test_permissions_requires_super_admin(self, teacher_client):
        """PermissionViewSet requires IsSuperAdmin."""
        response = teacher_client.get('/api/v1/auth/permissions/')
        assert response.status_code == 403

    def test_permissions_accessible_by_super_admin(self, super_admin_client):
        response = super_admin_client.get('/api/v1/auth/permissions/')
        assert response.status_code == 200

    def test_roles_requires_school_admin(self, teacher_client):
        """RoleViewSet requires IsSchoolAdmin."""
        response = teacher_client.get('/api/v1/auth/roles/')
        assert response.status_code == 403

    def test_roles_accessible_by_school_admin(self, school_admin_client):
        response = school_admin_client.get('/api/v1/auth/roles/')
        assert response.status_code == 200

    def test_roles_accessible_by_super_admin(self, super_admin_client):
        """Super admin should also access school admin endpoints."""
        response = super_admin_client.get('/api/v1/auth/roles/')
        assert response.status_code == 200

    def test_user_roles_requires_school_admin(self, teacher_client):
        """UserRoleViewSet requires IsSchoolAdmin."""
        response = teacher_client.get('/api/v1/auth/user-roles/')
        assert response.status_code == 403

    def test_user_roles_accessible_by_school_admin(self, school_admin_client):
        response = school_admin_client.get('/api/v1/auth/user-roles/')
        assert response.status_code == 200


# =====================
# Login Flow Integration
# =====================

@pytest.mark.django_db
class TestLoginFlow:
    """End-to-end login and token refresh flow."""

    def test_full_login_refresh_cycle(self, anon_client, login_user):
        """Login → get tokens → refresh → use access token → logout."""
        # Step 1: Login
        login_resp = anon_client.post('/api/v1/auth/login/', {
            'email': 'logintest@test.com',
            'password': 'TestPass123!',
        })
        assert login_resp.status_code == 200
        access_token = login_resp.data['access']
        refresh_token = login_resp.data['refresh']

        # Step 2: Access protected endpoint
        anon_client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        me_resp = anon_client.get('/api/v1/auth/users/me/')
        assert me_resp.status_code == 200
        assert me_resp.data['email'] == 'logintest@test.com'

        # Step 3: Refresh token
        anon_client.credentials()  # Clear auth
        refresh_resp = anon_client.post('/api/v1/auth/refresh/', {
            'refresh': refresh_token,
        })
        assert refresh_resp.status_code == 200
        new_access = refresh_resp.data['access']

        # Step 4: Use new access token
        anon_client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_access}')
        me_resp2 = anon_client.get('/api/v1/auth/users/me/')
        assert me_resp2.status_code == 200

    def test_invalid_credentials(self, anon_client, login_user):
        """Login with wrong password should fail."""
        response = anon_client.post('/api/v1/auth/login/', {
            'email': 'logintest@test.com',
            'password': 'WrongPassword!',
        })
        assert response.status_code == 401

    def test_invalid_refresh_token(self, anon_client):
        """Refresh with invalid token should fail."""
        response = anon_client.post('/api/v1/auth/refresh/', {
            'refresh': 'invalid-token-value',
        })
        assert response.status_code == 401
