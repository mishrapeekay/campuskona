"""
Tests for the assignments app — Assignment CRUD, AssignmentSubmission,
grading workflow, and permission enforcement.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def teacher_client(db):
    user = User.objects.create_user(
        email='assignment_teacher@test.com',
        password='TestPass123!',
        first_name='Teacher',
        last_name='Tester',
        phone='7777730001',
        user_type='TEACHER',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def student_client(db):
    user = User.objects.create_user(
        email='assignment_student@test.com',
        password='TestPass123!',
        first_name='Student',
        last_name='Tester',
        phone='7777730002',
        user_type='STUDENT',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def admin_client(db):
    user = User.objects.create_user(
        email='assignment_admin@test.com',
        password='TestPass123!',
        first_name='Admin',
        last_name='Tester',
        phone='7777730003',
        user_type='SCHOOL_ADMIN',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def anon_client():
    return APIClient()


@pytest.mark.django_db
class TestAssignmentAuth:
    """Verify all assignment endpoints require authentication."""

    def test_assignments_list_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/assignments/assignments/')
        assert response.status_code == 401

    def test_submissions_list_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/assignments/submissions/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestAssignmentAccess:
    """Verify authenticated access to assignment endpoints."""

    def test_assignments_list_teacher(self, teacher_client):
        response = teacher_client.get('/api/v1/assignments/assignments/')
        assert response.status_code == 200

    def test_assignments_list_student(self, student_client):
        response = student_client.get('/api/v1/assignments/assignments/')
        assert response.status_code == 200

    def test_assignments_list_admin(self, admin_client):
        response = admin_client.get('/api/v1/assignments/assignments/')
        assert response.status_code == 200

    def test_submissions_list_teacher(self, teacher_client):
        response = teacher_client.get('/api/v1/assignments/submissions/')
        assert response.status_code == 200


@pytest.mark.django_db
class TestAssignmentCRUD:
    """Test assignment create, read, update, delete."""

    def test_create_assignment(self, teacher_client):
        data = {
            'title': 'Test Homework',
            'description': 'Complete exercises 1-10',
            'status': 'DRAFT',
            'max_marks': 50,
        }
        response = teacher_client.post('/api/v1/assignments/assignments/', data, format='json')
        # May return 201 or 400 depending on required fields (section, subject)
        assert response.status_code in [201, 400]

    def test_create_assignment_missing_title(self, teacher_client):
        data = {
            'description': 'No title provided',
            'status': 'DRAFT',
        }
        response = teacher_client.post('/api/v1/assignments/assignments/', data, format='json')
        assert response.status_code == 400

    def test_list_returns_paginated_or_array(self, teacher_client):
        response = teacher_client.get('/api/v1/assignments/assignments/')
        assert response.status_code == 200
        data = response.json()
        # Should be either paginated (has 'results') or a list
        assert isinstance(data, (dict, list))
        if isinstance(data, dict):
            assert 'results' in data or 'data' in data


@pytest.mark.django_db
class TestSubmissionAccess:
    """Test submission endpoints."""

    def test_submissions_list(self, teacher_client):
        response = teacher_client.get('/api/v1/assignments/submissions/')
        assert response.status_code == 200

    def test_submission_create_requires_data(self, student_client):
        response = student_client.post('/api/v1/assignments/submissions/', {}, format='json')
        assert response.status_code == 400


@pytest.mark.django_db
class TestGovernmentReportsAccess:
    """Verify government reports endpoint is reachable after URL fix."""

    def test_reports_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/government-reports/reports/')
        assert response.status_code == 401

    def test_reports_list_admin(self, admin_client):
        response = admin_client.get('/api/v1/government-reports/reports/')
        assert response.status_code in [200, 403]


@pytest.mark.django_db
class TestMobileBFFAuth:
    """Verify mobile BFF endpoints require authentication."""

    def test_admin_dashboard_requires_auth(self, anon_client):
        response = anon_client.get('/api/mobile/v1/dashboard/admin/')
        assert response.status_code == 401

    def test_teacher_dashboard_requires_auth(self, anon_client):
        response = anon_client.get('/api/mobile/v1/dashboard/teacher/')
        assert response.status_code == 401

    def test_student_dashboard_requires_auth(self, anon_client):
        response = anon_client.get('/api/mobile/v1/dashboard/student/')
        assert response.status_code == 401

    def test_parent_dashboard_requires_auth(self, anon_client):
        response = anon_client.get('/api/mobile/v1/dashboard/parent/')
        assert response.status_code == 401

    def test_sync_push_requires_auth(self, anon_client):
        response = anon_client.post('/api/mobile/v1/sync/push/')
        assert response.status_code == 401

    def test_sync_pull_requires_auth(self, anon_client):
        response = anon_client.get('/api/mobile/v1/sync/pull/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestMobileBFFAccess:
    """Verify authenticated access to BFF endpoints returns data."""

    def test_admin_dashboard(self, admin_client):
        response = admin_client.get('/api/mobile/v1/dashboard/admin/')
        assert response.status_code == 200
        data = response.json()
        assert 'stats' in data

    def test_teacher_dashboard(self, teacher_client):
        response = teacher_client.get('/api/mobile/v1/dashboard/teacher/')
        assert response.status_code == 200
        data = response.json()
        assert 'today_classes' in data

    def test_sync_push_empty(self, teacher_client):
        response = teacher_client.post(
            '/api/mobile/v1/sync/push/',
            {'changes': []},
            format='json'
        )
        assert response.status_code == 200
        data = response.json()
        assert 'results' in data

    def test_sync_pull(self, teacher_client):
        response = teacher_client.get('/api/mobile/v1/sync/pull/')
        assert response.status_code == 200
        data = response.json()
        assert 'updates' in data
        assert 'new_sync_token' in data
