"""
Tests for the timetable app — TimeSlot, ClassTimetable, TeacherTimetable,
TimetableSubstitution, RoomAllocation, TimetableTemplate, generation configs/runs.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='timetable_test@test.com',
        password='TestPass123!',
        first_name='Timetable',
        last_name='Tester',
        phone='7777780001',
        user_type='TEACHER',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def anon_client():
    return APIClient()


@pytest.mark.django_db
class TestTimetableAuth:
    """Verify all timetable endpoints require authentication."""

    def test_time_slots_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/timetable/time-slots/')
        assert response.status_code == 401

    def test_class_timetable_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/timetable/class-timetable/')
        assert response.status_code == 401

    def test_teacher_timetable_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/timetable/teacher-timetable/')
        assert response.status_code == 401

    def test_substitutions_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/timetable/substitutions/')
        assert response.status_code == 401

    def test_rooms_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/timetable/rooms/')
        assert response.status_code == 401

    def test_templates_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/timetable/templates/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestTimetableAccess:
    """Verify authenticated access to timetable endpoints."""

    def test_time_slots_list(self, auth_client):
        response = auth_client.get('/api/v1/timetable/time-slots/')
        assert response.status_code == 200

    def test_class_timetable_list(self, auth_client):
        response = auth_client.get('/api/v1/timetable/class-timetable/')
        assert response.status_code == 200

    def test_teacher_timetable_list(self, auth_client):
        response = auth_client.get('/api/v1/timetable/teacher-timetable/')
        assert response.status_code == 200

    def test_substitutions_list(self, auth_client):
        response = auth_client.get('/api/v1/timetable/substitutions/')
        assert response.status_code == 200

    def test_rooms_list(self, auth_client):
        response = auth_client.get('/api/v1/timetable/rooms/')
        assert response.status_code == 200
