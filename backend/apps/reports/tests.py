"""
Tests for the reports app — ReportTemplate, GeneratedReport, ReportSchedule,
SavedReport.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='reports_test@test.com',
        password='TestPass123!',
        first_name='Reports',
        last_name='Tester',
        phone='7777840001',
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
class TestReportsAuth:
    """Verify all reports endpoints require authentication."""

    def test_templates_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/reports/templates/')
        assert response.status_code == 401

    def test_generated_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/reports/generated/')
        assert response.status_code == 401

    def test_schedules_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/reports/schedules/')
        assert response.status_code == 401

    def test_saved_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/reports/saved/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestReportsAccess:
    """Verify authenticated access to reports endpoints."""

    def test_templates_list(self, auth_client):
        response = auth_client.get('/api/v1/reports/templates/')
        assert response.status_code == 200

    def test_generated_list(self, auth_client):
        response = auth_client.get('/api/v1/reports/generated/')
        assert response.status_code == 200

    def test_schedules_list(self, auth_client):
        response = auth_client.get('/api/v1/reports/schedules/')
        assert response.status_code == 200

    def test_saved_list(self, auth_client):
        response = auth_client.get('/api/v1/reports/saved/')
        assert response.status_code == 200
