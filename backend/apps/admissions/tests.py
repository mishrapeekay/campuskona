"""
Tests for the admissions app — AdmissionEnquiry, AdmissionApplication,
AdmissionDocument, AdmissionSetting.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='admissions_test@test.com',
        password='TestPass123!',
        first_name='Admissions',
        last_name='Tester',
        phone='7777760001',
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
class TestAdmissionsAuth:
    """Verify all admissions endpoints require authentication."""

    def test_enquiries_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/admissions/enquiries/')
        assert response.status_code == 401

    def test_applications_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/admissions/applications/')
        assert response.status_code == 401

    def test_documents_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/admissions/documents/')
        assert response.status_code == 401

    def test_settings_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/admissions/settings/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestAdmissionsAccess:
    """Verify authenticated access to admissions endpoints."""

    def test_enquiries_list(self, auth_client):
        response = auth_client.get('/api/v1/admissions/enquiries/')
        assert response.status_code == 200

    def test_applications_list(self, auth_client):
        response = auth_client.get('/api/v1/admissions/applications/')
        assert response.status_code == 200

    def test_documents_list(self, auth_client):
        response = auth_client.get('/api/v1/admissions/documents/')
        assert response.status_code == 200

    def test_settings_list(self, auth_client):
        response = auth_client.get('/api/v1/admissions/settings/')
        assert response.status_code == 200
