"""
Tests for the hr_payroll app — Department, Designation, SalaryComponent,
SalaryStructure, PayrollRun, Payslip.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='hr_test@test.com',
        password='TestPass123!',
        first_name='HR',
        last_name='Tester',
        phone='7777800001',
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
class TestHRPayrollAuth:
    """Verify all HR/Payroll endpoints require authentication."""

    def test_departments_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hr/departments/')
        assert response.status_code == 401

    def test_designations_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hr/designations/')
        assert response.status_code == 401

    def test_salary_components_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hr/salary-components/')
        assert response.status_code == 401

    def test_salary_structures_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hr/salary-structures/')
        assert response.status_code == 401

    def test_payroll_runs_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hr/payroll-runs/')
        assert response.status_code == 401

    def test_payslips_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/hr/payslips/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestHRPayrollAccess:
    """Verify authenticated access to HR/Payroll endpoints."""

    def test_departments_list(self, auth_client):
        response = auth_client.get('/api/v1/hr/departments/')
        assert response.status_code == 200

    def test_designations_list(self, auth_client):
        response = auth_client.get('/api/v1/hr/designations/')
        assert response.status_code == 200

    def test_salary_components_list(self, auth_client):
        response = auth_client.get('/api/v1/hr/salary-components/')
        assert response.status_code == 200

    def test_payroll_runs_list(self, auth_client):
        response = auth_client.get('/api/v1/hr/payroll-runs/')
        assert response.status_code == 200

    def test_payslips_list(self, auth_client):
        response = auth_client.get('/api/v1/hr/payslips/')
        assert response.status_code == 200
