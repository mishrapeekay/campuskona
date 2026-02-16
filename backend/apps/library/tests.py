"""
Tests for the library app — Book, BookIssue, Author, Category.
"""

import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def auth_client(db):
    user = User.objects.create_user(
        email='library_test@test.com',
        password='TestPass123!',
        first_name='Library',
        last_name='Tester',
        phone='7777820001',
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
class TestLibraryAuth:
    """Verify all library endpoints require authentication."""

    def test_books_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/library/books/')
        assert response.status_code == 401

    def test_issues_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/library/issues/')
        assert response.status_code == 401

    def test_authors_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/library/authors/')
        assert response.status_code == 401

    def test_categories_requires_auth(self, anon_client):
        response = anon_client.get('/api/v1/library/categories/')
        assert response.status_code == 401


@pytest.mark.django_db
class TestLibraryAccess:
    """Verify authenticated access to library endpoints."""

    def test_books_list(self, auth_client):
        response = auth_client.get('/api/v1/library/books/')
        assert response.status_code == 200

    def test_issues_list(self, auth_client):
        response = auth_client.get('/api/v1/library/issues/')
        assert response.status_code == 200

    def test_authors_list(self, auth_client):
        response = auth_client.get('/api/v1/library/authors/')
        assert response.status_code == 200

    def test_categories_list(self, auth_client):
        response = auth_client.get('/api/v1/library/categories/')
        assert response.status_code == 200
