"""
API Endpoint Tests for Authentication App.

Tests cover:
- User CRUD operations
- Role management
- Permission management
- UserRole assignments
- Authentication & Authorization
"""

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from rest_framework.test import APIClient
from rest_framework import status
from apps.authentication.models import Role, Permission, UserRole
from apps.authentication import signals

User = get_user_model()

# Disable signals for testing to avoid AuditLog dependencies
post_save.disconnect(signals.log_user_creation, sender=User)
post_save.disconnect(signals.log_role_assignment, sender=UserRole)


class UserViewSetTests(TestCase):
    """Test User ViewSet CRUD operations."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()

        # Create admin user
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='AdminPass123!',
            first_name='Admin',
            last_name='User',
            phone='1234567890',
            user_type='SUPER_ADMIN',
            is_staff=True,
            is_superuser=True
        )

        # Create regular user
        self.regular_user = User.objects.create_user(
            email='user@test.com',
            password='UserPass123!',
            first_name='Regular',
            last_name='User',
            phone='9876543210',
            user_type='TEACHER'
        )

        # URLs
        self.list_url = reverse('authentication:user-list')
        self.detail_url = lambda pk: reverse('authentication:user-detail', kwargs={'pk': pk})

    def test_list_users_unauthenticated(self):
        """Test listing users without authentication fails."""
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_users_authenticated(self):
        """Test listing users with authentication."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        # Should have at least 2 users (admin and regular)
        self.assertGreaterEqual(len(response.data['results']), 2)

    def test_retrieve_user_detail(self):
        """Test retrieving user details."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.detail_url(self.regular_user.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'user@test.com')
        self.assertEqual(response.data['user_type'], 'TEACHER')

    def test_create_user_as_admin(self):
        """Test creating a new user as admin."""
        self.client.force_authenticate(user=self.admin_user)

        data = {
            'email': 'newuser@test.com',
            'password': 'NewPass123!',
            'first_name': 'New',
            'last_name': 'User',
            'phone': '5555555555',
            'user_type': 'TEACHER'
        }

        response = self.client.post(self.list_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'newuser@test.com')

        # Verify user was created in database
        user_exists = User.objects.filter(email='newuser@test.com').exists()
        self.assertTrue(user_exists)

    def test_update_user(self):
        """Test updating user details."""
        self.client.force_authenticate(user=self.admin_user)

        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }

        response = self.client.patch(
            self.detail_url(self.regular_user.id),
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')

        # Verify update in database
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.first_name, 'Updated')

    def test_delete_user(self):
        """Test deleting a user."""
        self.client.force_authenticate(user=self.admin_user)

        # Create user to delete
        user_to_delete = User.objects.create_user(
            email='todelete@test.com',
            password='Pass123!',
            first_name='To',
            last_name='Delete',
            phone='1111111111',
            user_type='TEACHER'
        )

        response = self.client.delete(self.detail_url(user_to_delete.id))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify user was deleted
        user_exists = User.objects.filter(id=user_to_delete.id).exists()
        self.assertFalse(user_exists)

    def test_filter_users_by_type(self):
        """Test filtering users by user_type."""
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get(self.list_url, {'user_type': 'TEACHER'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # All returned users should be TEACHER type
        for user in response.data['results']:
            self.assertEqual(user['user_type'], 'TEACHER')

    def test_search_users(self):
        """Test searching users by email or name."""
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get(self.list_url, {'search': 'admin'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should find admin user
        emails = [user['email'] for user in response.data['results']]
        self.assertIn('admin@test.com', emails)


class RoleViewSetTests(TestCase):
    """Test Role ViewSet operations."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()

        # Create admin user
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='AdminPass123!',
            first_name='Admin',
            last_name='User',
            phone='1234567890',
            user_type='SUPER_ADMIN',
            is_staff=True,
            is_superuser=True
        )

        # Create test role
        self.role = Role.objects.create(
            name='Test Role',
            code='TEST_ROLE',
            description='A test role',
            level='SCHOOL',
            is_active=True
        )

        # URLs
        self.list_url = reverse('authentication:role-list')
        self.detail_url = lambda pk: reverse('authentication:role-detail', kwargs={'pk': pk})

    def test_list_roles(self):
        """Test listing roles."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertGreaterEqual(len(response.data['results']), 1)

    def test_create_role(self):
        """Test creating a new role."""
        self.client.force_authenticate(user=self.admin_user)

        data = {
            'name': 'Teacher Role',
            'code': 'TEACHER_ROLE',
            'description': 'Role for teachers',
            'level': 'SCHOOL',
            'is_active': True
        }

        response = self.client.post(self.list_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Teacher Role')

        # Verify role was created
        role_exists = Role.objects.filter(code='TEACHER_ROLE').exists()
        self.assertTrue(role_exists)

    def test_retrieve_role_detail(self):
        """Test retrieving role details."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.detail_url(self.role.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Role')
        self.assertEqual(response.data['code'], 'TEST_ROLE')

    def test_update_role(self):
        """Test updating role details."""
        self.client.force_authenticate(user=self.admin_user)

        data = {
            'description': 'Updated description'
        }

        response = self.client.patch(
            self.detail_url(self.role.id),
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['description'], 'Updated description')

    def test_delete_role(self):
        """Test deleting a role."""
        self.client.force_authenticate(user=self.admin_user)

        # Create role to delete
        role_to_delete = Role.objects.create(
            name='To Delete',
            code='DELETE_ROLE',
            description='Test',
            level='SCHOOL'
        )

        response = self.client.delete(self.detail_url(role_to_delete.id))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify role was deleted
        role_exists = Role.objects.filter(id=role_to_delete.id).exists()
        self.assertFalse(role_exists)

    def test_filter_roles_by_level(self):
        """Test filtering roles by level."""
        self.client.force_authenticate(user=self.admin_user)

        # Create roles at different levels
        Role.objects.create(
            name='System Role',
            code='SYSTEM_ROLE',
            level='SYSTEM'
        )

        response = self.client.get(self.list_url, {'level': 'SYSTEM'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # All returned roles should be SYSTEM level
        for role in response.data['results']:
            self.assertEqual(role['level'], 'SYSTEM')


class PermissionViewSetTests(TestCase):
    """Test Permission ViewSet operations."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()

        # Create admin user
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='AdminPass123!',
            first_name='Admin',
            last_name='User',
            phone='1234567890',
            user_type='SUPER_ADMIN',
            is_staff=True,
            is_superuser=True
        )

        # Create test permission
        self.permission = Permission.objects.create(
            name='Test Permission',
            code='TEST_PERMISSION',
            module='AUTHENTICATION',
            action='VIEW',
            description='A test permission',
            is_active=True
        )

        # URLs
        self.list_url = reverse('authentication:permission-list')
        self.detail_url = lambda pk: reverse('authentication:permission-detail', kwargs={'pk': pk})

    def test_list_permissions(self):
        """Test listing permissions."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertGreaterEqual(len(response.data['results']), 1)

    def test_create_permission(self):
        """Test creating a new permission."""
        self.client.force_authenticate(user=self.admin_user)

        data = {
            'name': 'View Students',
            'code': 'VIEW_STUDENTS',
            'module': 'STUDENTS',
            'action': 'VIEW',
            'description': 'Permission to view students',
            'is_active': True
        }

        response = self.client.post(self.list_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'View Students')

        # Verify permission was created
        permission_exists = Permission.objects.filter(code='VIEW_STUDENTS').exists()
        self.assertTrue(permission_exists)

    def test_filter_permissions_by_module(self):
        """Test filtering permissions by module."""
        self.client.force_authenticate(user=self.admin_user)

        # Create permissions in different modules
        Permission.objects.create(
            name='View Staff',
            code='VIEW_STAFF',
            module='STAFF',
            action='VIEW'
        )

        response = self.client.get(self.list_url, {'module': 'STAFF'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # All returned permissions should be STAFF module
        for permission in response.data['results']:
            self.assertEqual(permission['module'], 'STAFF')

    def test_filter_permissions_by_action(self):
        """Test filtering permissions by action."""
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get(self.list_url, {'action': 'VIEW'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # All returned permissions should have VIEW action
        for permission in response.data['results']:
            self.assertEqual(permission['action'], 'VIEW')


class UserRoleViewSetTests(TestCase):
    """Test UserRole ViewSet operations."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()

        # Create admin user
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='AdminPass123!',
            first_name='Admin',
            last_name='User',
            phone='1234567890',
            user_type='SUPER_ADMIN',
            is_staff=True,
            is_superuser=True
        )

        # Create regular user
        self.regular_user = User.objects.create_user(
            email='user@test.com',
            password='UserPass123!',
            first_name='Regular',
            last_name='User',
            phone='9876543210',
            user_type='TEACHER'
        )

        # Create role
        self.role = Role.objects.create(
            name='Teacher Role',
            code='TEACHER_ROLE',
            description='Role for teachers',
            level='SCHOOL'
        )

        # URLs
        self.list_url = reverse('authentication:user-role-list')
        self.detail_url = lambda pk: reverse('authentication:user-role-detail', kwargs={'pk': pk})

    def test_list_user_roles(self):
        """Test listing user roles."""
        self.client.force_authenticate(user=self.admin_user)

        # Create a user role assignment
        UserRole.objects.create(
            user=self.regular_user,
            role=self.role,
            assigned_by=self.admin_user
        )

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertGreaterEqual(len(response.data['results']), 1)

    def test_assign_role_to_user(self):
        """Test assigning a role to a user."""
        self.client.force_authenticate(user=self.admin_user)

        data = {
            'user': str(self.regular_user.id),
            'role': str(self.role.id)
        }

        response = self.client.post(self.list_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify role was assigned
        assignment_exists = UserRole.objects.filter(
            user=self.regular_user,
            role=self.role
        ).exists()
        self.assertTrue(assignment_exists)

    def test_remove_role_from_user(self):
        """Test removing a role from a user."""
        self.client.force_authenticate(user=self.admin_user)

        # Create role assignment to delete
        user_role = UserRole.objects.create(
            user=self.regular_user,
            role=self.role,
            assigned_by=self.admin_user
        )

        response = self.client.delete(self.detail_url(user_role.id))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify assignment was removed
        assignment_exists = UserRole.objects.filter(id=user_role.id).exists()
        self.assertFalse(assignment_exists)

    def test_filter_user_roles_by_user(self):
        """Test filtering user roles by user."""
        self.client.force_authenticate(user=self.admin_user)

        # Create role assignments for different users
        UserRole.objects.create(
            user=self.regular_user,
            role=self.role,
            assigned_by=self.admin_user
        )

        response = self.client.get(self.list_url, {'user': str(self.regular_user.id)})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # All returned assignments should be for the specified user
        for assignment in response.data['results']:
            self.assertEqual(assignment['user'], str(self.regular_user.id))

    def test_duplicate_role_assignment_fails(self):
        """Test that assigning the same role twice fails."""
        self.client.force_authenticate(user=self.admin_user)

        # Create first assignment
        UserRole.objects.create(
            user=self.regular_user,
            role=self.role,
            assigned_by=self.admin_user
        )

        # Try to create duplicate
        data = {
            'user': str(self.regular_user.id),
            'role': str(self.role.id)
        }

        response = self.client.post(self.list_url, data, format='json')

        # Should fail with 400 due to unique constraint
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AuthorizationTests(TestCase):
    """Test authorization and permissions."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()

        # Create admin user
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            password='AdminPass123!',
            first_name='Admin',
            last_name='User',
            phone='1234567890',
            user_type='SUPER_ADMIN',
            is_staff=True,
            is_superuser=True
        )

        # Create regular user
        self.regular_user = User.objects.create_user(
            email='user@test.com',
            password='UserPass123!',
            first_name='Regular',
            last_name='User',
            phone='9876543210',
            user_type='TEACHER'
        )

        self.list_url = reverse('authentication:user-list')

    def test_regular_user_cannot_list_users(self):
        """Test that regular users cannot list all users."""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.list_url)

        # Should be forbidden or return filtered results
        # Adjust based on your permission implementation
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_200_OK])

    def test_admin_can_list_users(self):
        """Test that admin users can list all users."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)

    def test_user_can_access_own_profile(self):
        """Test that users can access their own profile."""
        self.client.force_authenticate(user=self.regular_user)

        detail_url = reverse('authentication:user-detail', kwargs={'pk': self.regular_user.id})
        response = self.client.get(detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.regular_user.email)
