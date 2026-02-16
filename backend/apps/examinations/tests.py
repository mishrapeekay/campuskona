"""
Tests for the examinations app — GradeScale, Grade, ExamType, Examination,
ExamSchedule, StudentMark, ExamResult, ReportCardTemplate, ReportCard.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='exam_test@test.com',
        password='TestPass123!',
        first_name='Exam',
        last_name='Tester',
        phone='7777730001',
        user_type='TEACHER',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def anon_client():
    return APIClient()


@pytest.mark.django_db
class TestExaminationAuth:
    """Verify all examination endpoints require authentication."""

    def test_grade_scales_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/examinations/grade-scales/')
        assert response.status_code == 401

    def test_grades_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/examinations/grades/')
        assert response.status_code == 401

    def test_exam_types_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/examinations/exam-types/')
        assert response.status_code == 401

    def test_exams_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/examinations/exams/')
        assert response.status_code == 401

    def test_schedules_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/examinations/schedules/')
        assert response.status_code == 401

    def test_marks_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/examinations/marks/')
        assert response.status_code == 401

    def test_results_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/examinations/results/')
        assert response.status_code == 401

    def test_report_cards_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/examinations/report-cards/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestExaminationAccess:
    """Verify authenticated access to examination endpoints."""

    def test_grade_scales_list(self, auth_client):
        response = auth_client.get('/api/v1/examinations/grade-scales/')
        assert response.status_code == 200

    def test_exam_types_list(self, auth_client):
        response = auth_client.get('/api/v1/examinations/exam-types/')
        assert response.status_code == 200

    def test_exams_list(self, auth_client):
        response = auth_client.get('/api/v1/examinations/exams/')
        assert response.status_code == 200

    def test_marks_list(self, auth_client):
        response = auth_client.get('/api/v1/examinations/marks/')
        assert response.status_code == 200

    def test_results_list(self, auth_client):
        response = auth_client.get('/api/v1/examinations/results/')
        assert response.status_code == 200
