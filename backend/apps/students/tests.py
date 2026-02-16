"""
Tests for the students app — Student CRUD, documents, parents, health records, notes.
"""

import pytest
import uuid
from datetime import date
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


# =====================
# Fixtures
# =====================

@pytest.fixture
def admin_api_client(db):
    user = User.objects.create_user(
        email='studenttest_admin@test.com',
        password='TestPass123!',
        first_name='Admin',
        last_name='Test',
        phone='7777700001',
        user_type='SCHOOL_ADMIN',
        is_staff=True,
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def teacher_api_client(db):
    user = User.objects.create_user(
        email='studenttest_teacher@test.com',
        password='TestPass123!',
        first_name='Teacher',
        last_name='Test',
        phone='7777700002',
        user_type='TEACHER',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


# =====================
# Authentication Tests
# =====================

@pytest.mark.django_db
class TestStudentEndpointAuth:

    def test_students_list_requires_auth(self):
        client = APIClient()
        response = client.get('/api/v1/students/students/')
        assert response.status_code == 401

    def test_documents_requires_auth(self):
        client = APIClient()
        response = client.get('/api/v1/students/documents/')
        assert response.status_code == 401

    def test_parents_requires_auth(self):
        client = APIClient()
        response = client.get('/api/v1/students/parents/')
        assert response.status_code == 401

    def test_health_records_requires_auth(self):
        client = APIClient()
        response = client.get('/api/v1/students/health-records/')
        assert response.status_code == 401

    def test_notes_requires_auth(self):
        client = APIClient()
        response = client.get('/api/v1/students/notes/')
        assert response.status_code == 401


# =====================
# Authenticated Access Tests
# =====================

@pytest.mark.django_db
class TestStudentEndpointAccess:

    def test_students_list_with_auth(self, admin_api_client):
        response = admin_api_client.get('/api/v1/students/students/')
        assert response.status_code == 200

    def test_documents_list_with_auth(self, admin_api_client):
        response = admin_api_client.get('/api/v1/students/documents/')
        assert response.status_code == 200

    def test_parents_list_with_auth(self, admin_api_client):
        response = admin_api_client.get('/api/v1/students/parents/')
        assert response.status_code == 200

    def test_health_records_list_with_auth(self, admin_api_client):
        response = admin_api_client.get('/api/v1/students/health-records/')
        assert response.status_code == 200

    def test_notes_list_with_auth(self, admin_api_client):
        response = admin_api_client.get('/api/v1/students/notes/')
        assert response.status_code == 200
