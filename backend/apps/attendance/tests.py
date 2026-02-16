"""
Tests for the attendance app — AttendancePeriod, StudentAttendance, StaffAttendance,
StudentLeave, StaffLeave, Holiday, AttendanceSummary.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='attendance_test@test.com',
        password='TestPass123!',
        first_name='Attendance',
        last_name='Tester',
        phone='7777720001',
        user_type='TEACHER',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def anon_client():
    return APIClient()


@pytest.mark.django_db
class TestAttendanceAuth:
    """Verify all attendance endpoints require authentication."""

    def test_periods_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/attendance/periods/')
        assert response.status_code == 401

    def test_student_attendance_requires_auth(self, anon_client):
        """Was recently fixed from AllowAny to IsAuthenticated."""
        response = anon_client.get('/api/v1/attendance/student-attendance/')
        assert response.status_code == 401

    def test_staff_attendance_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/attendance/staff-attendance/')
        assert response.status_code == 401

    def test_student_leaves_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/attendance/student-leaves/')
        assert response.status_code == 401

    def test_staff_leaves_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/attendance/staff-leaves/')
        assert response.status_code == 401

    def test_holidays_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/attendance/holidays/')
        assert response.status_code == 401

    def test_summaries_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/attendance/summaries/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestAttendanceAccess:
    """Verify authenticated access to attendance endpoints."""

    def test_periods_list(self, auth_client):
        response = auth_client.get('/api/v1/attendance/periods/')
        assert response.status_code == 200

    def test_student_attendance_list(self, auth_client):
        response = auth_client.get('/api/v1/attendance/student-attendance/')
        assert response.status_code == 200

    def test_staff_attendance_list(self, auth_client):
        response = auth_client.get('/api/v1/attendance/staff-attendance/')
        assert response.status_code == 200

    def test_student_leaves_list(self, auth_client):
        response = auth_client.get('/api/v1/attendance/student-leaves/')
        assert response.status_code == 200

    def test_holidays_list(self, auth_client):
        response = auth_client.get('/api/v1/attendance/holidays/')
        assert response.status_code == 200

    def test_summaries_list(self, auth_client):
        response = auth_client.get('/api/v1/attendance/summaries/')
        assert response.status_code == 200
