"""
Tests for the transport app — Vehicle, Driver, Route, Stop, TransportAllocation.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='transport_test@test.com',
        password='TestPass123!',
        first_name='Transport',
        last_name='Tester',
        phone='7777810001',
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
class TestTransportAuth:
    """Verify all transport endpoints require authentication."""

    def test_vehicles_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/transport/vehicles/')
        assert response.status_code == 401

    def test_drivers_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/transport/drivers/')
        assert response.status_code == 401

    def test_routes_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/transport/routes/')
        assert response.status_code == 401

    def test_stops_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/transport/stops/')
        assert response.status_code == 401

    def test_allocations_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/transport/allocations/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestTransportAccess:
    """Verify authenticated access to transport endpoints."""

    def test_vehicles_list(self, auth_client):
        response = auth_client.get('/api/v1/transport/vehicles/')
        assert response.status_code == 200

    def test_routes_list(self, auth_client):
        response = auth_client.get('/api/v1/transport/routes/')
        assert response.status_code == 200

    def test_allocations_list(self, auth_client):
        response = auth_client.get('/api/v1/transport/allocations/')
        assert response.status_code == 200
