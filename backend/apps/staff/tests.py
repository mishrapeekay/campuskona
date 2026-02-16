"""
Tests for the staff app — StaffMember, StaffDocument, StaffQualification, StaffExperience.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='staff_test@test.com',
        password='TestPass123!',
        first_name='Staff',
        last_name='Tester',
        phone='7777740001',
        user_type='SCHOOL_ADMIN',
        is_staff=True,
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def anon_client():
    return APIClient()


@pytest.mark.django_db
class TestStaffAuth:
    """Verify all staff endpoints require authentication.
    StaffMemberViewSet was recently fixed from AllowAny to IsAuthenticated."""

    def test_staff_list_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/staff/members/')
        assert response.status_code == 401

    def test_staff_documents_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/staff/documents/')
        assert response.status_code == 401

    def test_staff_qualifications_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/staff/qualifications/')
        assert response.status_code == 401

    def test_staff_experiences_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/staff/experiences/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestStaffAccess:
    """Verify authenticated access to staff endpoints."""

    def test_staff_list_with_auth(self, auth_client):
        response = auth_client.get('/api/v1/staff/members/')
        assert response.status_code == 200

    def test_staff_documents_with_auth(self, auth_client):
        response = auth_client.get('/api/v1/staff/documents/')
        assert response.status_code == 200

    def test_staff_qualifications_with_auth(self, auth_client):
        response = auth_client.get('/api/v1/staff/qualifications/')
        assert response.status_code == 200

    def test_staff_experiences_with_auth(self, auth_client):
        response = auth_client.get('/api/v1/staff/experiences/')
        assert response.status_code == 200
