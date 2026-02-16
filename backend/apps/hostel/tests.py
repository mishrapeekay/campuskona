"""
Tests for the hostel app — Hostel, Room, RoomAllocation, HostelAttendance,
MessMenu, HostelComplaint, HostelVisitor.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='hostel_test@test.com',
        password='TestPass123!',
        first_name='Hostel',
        last_name='Tester',
        phone='7777790001',
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
class TestHostelAuth:
    """Verify all hostel endpoints require authentication."""

    def test_hostels_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hostel/hostels/')
        assert response.status_code == 401

    def test_rooms_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hostel/rooms/')
        assert response.status_code == 401

    def test_allocations_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hostel/allocations/')
        assert response.status_code == 401

    def test_attendance_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hostel/attendance/')
        assert response.status_code == 401

    def test_mess_menu_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hostel/mess-menu/')
        assert response.status_code == 401

    def test_complaints_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hostel/complaints/')
        assert response.status_code == 401

    def test_visitors_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hostel/visitors/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestHostelAccess:
    """Verify authenticated access to hostel endpoints."""

    def test_hostels_list(self, auth_client):
        response = auth_client.get('/api/v1/hostel/hostels/')
        assert response.status_code == 200

    def test_rooms_list(self, auth_client):
        response = auth_client.get('/api/v1/hostel/rooms/')
        assert response.status_code == 200

    def test_allocations_list(self, auth_client):
        response = auth_client.get('/api/v1/hostel/allocations/')
        assert response.status_code == 200

    def test_mess_menu_list(self, auth_client):
        response = auth_client.get('/api/v1/hostel/mess-menu/')
        assert response.status_code == 200

    def test_complaints_list(self, auth_client):
        response = auth_client.get('/api/v1/hostel/complaints/')
        assert response.status_code == 200

    def test_visitors_list(self, auth_client):
        response = auth_client.get('/api/v1/hostel/visitors/')
        assert response.status_code == 200
