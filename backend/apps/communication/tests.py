"""
Tests for the communication app — Notice, Event, Notification.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='comm_test@test.com',
        password='TestPass123!',
        first_name='Comm',
        last_name='Tester',
        phone='7777770001',
        user_type='TEACHER',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def anon_client():
    return APIClient()


@pytest.mark.django_db
class TestCommunicationAuth:
    """Verify all communication endpoints require authentication."""

    def test_notices_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/communication/notices/')
        assert response.status_code == 401

    def test_events_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/communication/events/')
        assert response.status_code == 401

    def test_notifications_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/communication/notifications/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestCommunicationAccess:
    """Verify authenticated access to communication endpoints."""

    def test_notices_list(self, auth_client):
        response = auth_client.get('/api/v1/communication/notices/')
        assert response.status_code == 200

    def test_events_list(self, auth_client):
        response = auth_client.get('/api/v1/communication/events/')
        assert response.status_code == 200

    def test_notifications_list(self, auth_client):
        response = auth_client.get('/api/v1/communication/notifications/')
        assert response.status_code == 200
