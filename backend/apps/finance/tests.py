"""
Tests for the finance app — FeeCategory, FeeStructure, StudentFee, Payment,
Expense, Invoice.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='finance_test@test.com',
        password='TestPass123!',
        first_name='Finance',
        last_name='Tester',
        phone='7777750001',
        user_type='ACCOUNTANT',
    )
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def anon_client():
    return APIClient()


@pytest.mark.django_db
class TestFinanceAuth:
    """Verify all finance endpoints require authentication."""

    def test_fee_categories_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/finance/fee-categories/')
        assert response.status_code == 401

    def test_fee_structures_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/finance/fee-structures/')
        assert response.status_code == 401

    def test_student_fees_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/finance/student-fees/')
        assert response.status_code == 401

    def test_payments_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/finance/payments/')
        assert response.status_code == 401

    def test_expenses_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/finance/expenses/')
        assert response.status_code == 401

    def test_invoices_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/finance/invoices/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestFinanceAccess:
    """Verify authenticated access to finance endpoints."""

    def test_fee_categories_list(self, auth_client):
        response = auth_client.get('/api/v1/finance/fee-categories/')
        assert response.status_code == 200

    def test_fee_structures_list(self, auth_client):
        response = auth_client.get('/api/v1/finance/fee-structures/')
        assert response.status_code == 200

    def test_student_fees_list(self, auth_client):
        response = auth_client.get('/api/v1/finance/student-fees/')
        assert response.status_code == 200

    def test_payments_list(self, auth_client):
        response = auth_client.get('/api/v1/finance/payments/')
        assert response.status_code == 200

    def test_expenses_list(self, auth_client):
        response = auth_client.get('/api/v1/finance/expenses/')
        assert response.status_code == 200

    def test_invoices_list(self, auth_client):
        response = auth_client.get('/api/v1/finance/invoices/')
        assert response.status_code == 200
