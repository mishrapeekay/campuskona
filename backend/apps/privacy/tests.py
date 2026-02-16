"""
Tests for the privacy app — ConsentPurpose, Consent, Grievance, DataBreach,
DeletionRequest, CorrectionRequest.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='privacy_test@test.com',
        password='TestPass123!',
        first_name='Privacy',
        last_name='Tester',
        phone='7777830001',
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
class TestPrivacyAuth:
    """Verify all privacy/DPDP endpoints require authentication."""

    def test_consent_purposes_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/privacy/consent-purposes/')
        assert response.status_code == 401

    def test_consents_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/privacy/consents/')
        assert response.status_code == 401

    def test_grievances_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/privacy/grievances/')
        assert response.status_code == 401

    def test_breaches_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/privacy/breaches/')
        assert response.status_code == 401

    def test_deletion_requests_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/privacy/deletion-requests/')
        assert response.status_code == 401

    def test_correction_requests_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/privacy/correction-requests/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestPrivacyAccess:
    """Verify authenticated access to privacy/DPDP endpoints."""

    def test_consent_purposes_list(self, auth_client):
        response = auth_client.get('/api/v1/privacy/consent-purposes/')
        assert response.status_code == 200

    def test_consents_list(self, auth_client):
        response = auth_client.get('/api/v1/privacy/consents/')
        assert response.status_code == 200

    def test_grievances_list(self, auth_client):
        response = auth_client.get('/api/v1/privacy/grievances/')
        assert response.status_code == 200

    def test_breaches_list(self, auth_client):
        response = auth_client.get('/api/v1/privacy/breaches/')
        assert response.status_code == 200

    def test_deletion_requests_list(self, auth_client):
        response = auth_client.get('/api/v1/privacy/deletion-requests/')
        assert response.status_code == 200

    def test_correction_requests_list(self, auth_client):
        response = auth_client.get('/api/v1/privacy/correction-requests/')
        assert response.status_code == 200
