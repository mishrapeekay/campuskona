"""
Tests for the academics app — AcademicYear, Board, Subject, Class, Section,
ClassSubject, StudentEnrollment, StudentSubject.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


# =====================
# Fixtures
# =====================

@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='academics_test@test.com',
        password='TestPass123!',
        first_name='Academics',
        last_name='Tester',
        phone='7777710001',
        user_type='TEACHER',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def anon_client():
    return APIClient()


# =====================
# Authentication Tests
# =====================

@pytest.mark.django_db
class TestAcademicsAuth:

    def test_academic_years_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/academics/academic-years/')
        assert response.status_code == 401

    def test_boards_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/academics/boards/')
        assert response.status_code == 401

    def test_subjects_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/academics/subjects/')
        assert response.status_code == 401

    def test_classes_requires_auth(self, anon_client):
        """ClassViewSet was recently fixed from AllowAny to IsAuthenticated."""
        response = anon_client.get('/api/v1/academics/classes/')
        assert response.status_code == 401

    def test_sections_requires_auth(self, anon_client):
        """SectionViewSet was recently fixed from AllowAny to IsAuthenticated."""
        response = anon_client.get('/api/v1/academics/sections/')
        assert response.status_code == 401

    def test_class_subjects_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/academics/class-subjects/')
        assert response.status_code == 401

    def test_enrollments_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/academics/enrollments/')
        assert response.status_code == 401


# =====================
# Authenticated Access Tests
# =====================

@pytest.mark.django_db
class TestAcademicsAccess:

    def test_academic_years_list(self, auth_client):
        response = auth_client.get('/api/v1/academics/academic-years/')
        assert response.status_code == 200

    def test_boards_list(self, auth_client):
        response = auth_client.get('/api/v1/academics/boards/')
        assert response.status_code == 200

    def test_subjects_list(self, auth_client):
        response = auth_client.get('/api/v1/academics/subjects/')
        assert response.status_code == 200

    def test_classes_list(self, auth_client):
        response = auth_client.get('/api/v1/academics/classes/')
        assert response.status_code == 200

    def test_sections_list(self, auth_client):
        response = auth_client.get('/api/v1/academics/sections/')
        assert response.status_code == 200

    def test_class_subjects_list(self, auth_client):
        response = auth_client.get('/api/v1/academics/class-subjects/')
        assert response.status_code == 200

    def test_enrollments_list(self, auth_client):
        response = auth_client.get('/api/v1/academics/enrollments/')
        assert response.status_code == 200
