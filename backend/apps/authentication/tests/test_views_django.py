"""
Authentication Views Tests using Django TestCase.

Tests cover:
- JWT token authentication
- Login/Logout flows
- Multi-tenant authentication
- Password reset flows
- Email verification
- Account locking after failed attempts
"""

from django.test import TestCase, override_settings
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import LoginHistory, PasswordResetToken, EmailVerificationToken
from apps.authentication import signals

User = get_user_model()


# Disable signals for testing to avoid AuditLog dependencies
post_save.disconnect(signals.log_user_creation, sender=User)


class LoginViewTests(TestCase):
    """Test login functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.login_url = reverse('authentication:login')

        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User',
            phone='9876543210',
            user_type='TEACHER',
            is_active=True
        )

    def test_login_with_valid_credentials(self):
        """Test successful login with valid credentials."""
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }

        response = self.client.post(self.login_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], self.user.email)

    def test_login_with_invalid_password(self):
        """Test login fails with incorrect password."""
        data = {
            'email': 'test@example.com',
            'password': 'WrongPassword123'
        }

        response = self.client.post(self.login_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_with_nonexistent_user(self):
        """Test login fails with non-existent email."""
        data = {
            'email': 'nonexistent@example.com',
            'password': 'SomePassword123'
        }

        response = self.client.post(self.login_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_with_inactive_user(self):
        """Test login fails for inactive users."""
        self.user.is_active = False
        self.user.save()

        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }

        response = self.client.post(self.login_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_account_locks_after_failed_attempts(self):
        """Test account locks after 5 failed login attempts."""
        data = {
            'email': 'test@example.com',
            'password': 'WrongPassword'
        }

        # Make 5 failed login attempts
        for i in range(5):
            response = self.client.post(self.login_url, data, format='json')
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

            # Refresh and check progress
            self.user.refresh_from_db()
            print(f"Attempt {i+1}: failed_login_attempts = {self.user.failed_login_attempts}, is_locked = {self.user.is_account_locked}")

        # Refresh user from database
        self.user.refresh_from_db()

        # Verify account is locked
        self.assertTrue(self.user.is_account_locked, f"Account should be locked but is_account_locked={self.user.is_account_locked}, failed_attempts={self.user.failed_login_attempts}")
        self.assertEqual(self.user.failed_login_attempts, 5)

    def test_login_tracking_in_history(self):
        """Test successful logins are tracked in LoginHistory."""
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }

        # Initial count
        initial_count = LoginHistory.objects.filter(user=self.user).count()

        response = self.client.post(self.login_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify login was tracked
        new_count = LoginHistory.objects.filter(user=self.user).count()
        self.assertEqual(new_count, initial_count + 1)

        # Verify latest login entry
        latest_login = LoginHistory.objects.filter(user=self.user).latest('login_at')
        self.assertEqual(latest_login.status, 'SUCCESS')


class LogoutViewTests(TestCase):
    """Test logout functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.logout_url = reverse('authentication:logout')

        # Create and authenticate user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User',
            phone='9876543210',
            user_type='TEACHER'
        )

        # Login to get tokens
        login_url = reverse('authentication:login')
        response = self.client.post(login_url, {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }, format='json')

        self.access_token = response.data['access']
        self.refresh_token = response.data['refresh']

    def test_logout_with_valid_token(self):
        """Test successful logout with valid refresh token."""
        data = {'refresh': self.refresh_token}

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.post(self.logout_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_without_token(self):
        """Test logout fails without refresh token."""
        response = self.client.post(self.logout_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class RegistrationViewTests(TestCase):
    """Test user registration functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.register_url = reverse('authentication:register')

    def test_register_new_user(self):
        """Test successful registration of a new user."""
        data = {
            'email': 'newuser@example.com',
            'password': 'NewPass123!',
            'password2': 'NewPass123!',
            'first_name': 'New',
            'last_name': 'User',
            'phone': '9876543210',
            'user_type': 'TEACHER'
        }

        response = self.client.post(self.register_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'newuser@example.com')

        # Verify user was created in database
        user = User.objects.get(email='newuser@example.com')
        self.assertIsNotNone(user)
        self.assertEqual(user.first_name, 'New')

    def test_register_duplicate_email(self):
        """Test registration fails with duplicate email."""
        # Create existing user
        User.objects.create_user(
            email='existing@example.com',
            password='Pass123!',
            first_name='Existing',
            last_name='User',
            phone='1234567890'
        )

        # Try to register with same email
        data = {
            'email': 'existing@example.com',
            'password': 'NewPass123!',
            'password2': 'NewPass123!',
            'first_name': 'Another',
            'last_name': 'User',
            'phone': '9876543210',
            'user_type': 'TEACHER'
        }

        response = self.client.post(self.register_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        """Test registration fails when passwords don't match."""
        data = {
            'email': 'newuser@example.com',
            'password': 'Pass123!',
            'password2': 'DifferentPass123!',
            'first_name': 'New',
            'last_name': 'User',
            'phone': '9876543210',
            'user_type': 'TEACHER'
        }

        response = self.client.post(self.register_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class PasswordResetTests(TestCase):
    """Test password reset functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.password_reset_url = reverse('authentication:password-reset')

        self.user = User.objects.create_user(
            email='test@example.com',
            password='OldPass123!',
            first_name='Test',
            last_name='User',
            phone='9876543210'
        )

    def test_password_reset_request(self):
        """Test requesting a password reset sends email."""
        data = {'email': 'test@example.com'}

        response = self.client.post(self.password_reset_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify token was created
        token_exists = PasswordResetToken.objects.filter(user=self.user).exists()
        self.assertTrue(token_exists)

    def test_password_reset_with_invalid_email(self):
        """Test password reset request with non-existent email."""
        data = {'email': 'nonexistent@example.com'}

        response = self.client.post(self.password_reset_url, data, format='json')

        # Should still return 200 to prevent email enumeration
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class TokenRefreshTests(TestCase):
    """Test JWT token refresh functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.refresh_url = reverse('authentication:token-refresh')

        # Create and login user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123!',
            first_name='Test',
            last_name='User',
            phone='9876543210'
        )

        login_url = reverse('authentication:login')
        response = self.client.post(login_url, {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }, format='json')

        self.refresh_token = response.data['refresh']

    def test_refresh_token_with_valid_token(self):
        """Test refreshing access token with valid refresh token."""
        data = {'refresh': self.refresh_token}

        response = self.client.post(self.refresh_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_refresh_token_with_invalid_token(self):
        """Test refresh fails with invalid token."""
        data = {'refresh': 'invalid_token_string'}

        response = self.client.post(self.refresh_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
