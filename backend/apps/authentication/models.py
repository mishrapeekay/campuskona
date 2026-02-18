"""
Authentication models for the School Management System.

This module defines:
- Custom User model with multiple user types
- Role-Based Access Control (RBAC) models
- Password reset tokens
"""

import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import timedelta
from apps.core.models import BaseModel, SoftDeleteModel
from apps.core.validators import validate_phone_number


class UserManager(BaseUserManager):
    """
    Custom user manager for email-based authentication.
    """

    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user."""
        if not email:
            raise ValueError('The Email field must be set')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('user_type', 'SUPER_ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Custom User model with support for multiple user types.

    User types:
    - SUPER_ADMIN: System-wide administrator
    - SCHOOL_ADMIN: School-level administrator
    - PRINCIPAL: School principal
    - TEACHER: Teaching staff
    - STUDENT: Student
    - PARENT: Parent/Guardian
    - ACCOUNTANT: Finance staff
    - LIBRARIAN: Library staff
    - TRANSPORT_MANAGER: Transport management staff
    """

    # Override default id with UUID
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Remove username, use email instead
    username = None

    # Email as unique identifier
    email = models.EmailField(
        unique=True,
        db_index=True,
        error_messages={
            'unique': 'A user with this email already exists.',
        }
    )

    # Phone number
    phone = models.CharField(
        max_length=15,
        unique=True,
        blank=True,
        null=True,
        validators=[validate_phone_number],
        help_text='Indian phone number (10 digits)'
    )
    alternate_phone = models.CharField(
        max_length=15,
        blank=True,
        validators=[validate_phone_number]
    )

    # User Type
    USER_TYPE_CHOICES = [
        ('SUPER_ADMIN', 'Super Administrator'),
        ('SCHOOL_ADMIN', 'School Administrator'),
        ('PRINCIPAL', 'Principal'),
        ('TEACHER', 'Teacher'),
        ('STUDENT', 'Student'),
        ('PARENT', 'Parent/Guardian'),
        ('ACCOUNTANT', 'Accountant'),
        ('LIBRARIAN', 'Librarian'),
        ('TRANSPORT_MANAGER', 'Transport Manager'),
        ('PARTNER', 'Partner'),
        ('INVESTOR', 'Investor'),
    ]
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        db_index=True
    )

    # Language Preference
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
    ]
    language_preference = models.CharField(
        max_length=10,
        choices=LANGUAGE_CHOICES,
        default='en',
        blank=True,
        help_text='Preferred language for interface and notifications'
    )

    # Personal Information
    date_of_birth = models.DateField(null=True, blank=True)

    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)

    # Profile
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        help_text='Profile picture'
    )
    bio = models.TextField(blank=True, max_length=500)

    # Address
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default='India')
    pincode = models.CharField(max_length=10, blank=True)

    # Verification
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    phone_verified = models.BooleanField(default=False)
    phone_verified_at = models.DateTimeField(null=True, blank=True)

    # Security
    failed_login_attempts = models.IntegerField(default=0)
    last_failed_login = models.DateTimeField(null=True, blank=True)
    account_locked_until = models.DateTimeField(null=True, blank=True)
    password_changed_at = models.DateTimeField(null=True, blank=True)
    force_password_change = models.BooleanField(default=False)

    # Activity Tracking
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    last_activity = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Set email as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'phone', 'user_type']

    objects = UserManager()

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'is_active']),
            models.Index(fields=['user_type', 'is_active']),
            models.Index(fields=['phone']),
        ]

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    def get_full_name(self):
        """Return the full name."""
        return f"{self.first_name} {self.last_name}".strip() or self.email

    @property
    def is_super_admin(self):
        """Check if user is super admin."""
        return self.user_type == 'SUPER_ADMIN' or self.is_superuser

    @property
    def is_school_admin(self):
        """Check if user is school admin."""
        return self.user_type == 'SCHOOL_ADMIN'

    @property
    def is_teacher(self):
        """Check if user is teacher."""
        return self.user_type == 'TEACHER'

    @property
    def is_student(self):
        """Check if user is student."""
        return self.user_type == 'STUDENT'

    @property
    def is_parent(self):
        """Check if user is parent."""
        return self.user_type == 'PARENT'

    @property
    def is_account_locked(self):
        """Check if account is locked due to failed login attempts."""
        if self.account_locked_until:
            return timezone.now() < self.account_locked_until
        return False

    def lock_account(self, duration_minutes=30):
        """Lock account for specified duration."""
        self.account_locked_until = timezone.now() + timedelta(minutes=duration_minutes)
        self.save(update_fields=['account_locked_until'])

    def unlock_account(self):
        """Unlock account."""
        self.account_locked_until = None
        self.failed_login_attempts = 0
        self.save(update_fields=['account_locked_until', 'failed_login_attempts'])

    def record_failed_login(self):
        """Record a failed login attempt."""
        self.failed_login_attempts += 1
        self.last_failed_login = timezone.now()

        # Lock account after 5 failed attempts
        if self.failed_login_attempts >= 5:
            self.lock_account()

        self.save(update_fields=['failed_login_attempts', 'last_failed_login', 'account_locked_until'])

    def record_successful_login(self, ip_address=None):
        """Record a successful login."""
        self.failed_login_attempts = 0
        self.last_login = timezone.now()
        self.last_activity = timezone.now()
        if ip_address:
            self.last_login_ip = ip_address

        self.save(update_fields=['failed_login_attempts', 'last_login', 'last_activity', 'last_login_ip'])

    def verify_email(self):
        """Mark email as verified."""
        self.email_verified = True
        self.email_verified_at = timezone.now()
        self.save(update_fields=['email_verified', 'email_verified_at'])

    def verify_phone(self):
        """Mark phone as verified."""
        self.phone_verified = True
        self.phone_verified_at = timezone.now()
        self.save(update_fields=['phone_verified', 'phone_verified_at'])

    def has_permission(self, permission_code):
        """
        Check if user has a specific permission.

        Args:
            permission_code: Permission code (e.g., 'students.create')

        Returns:
            Boolean indicating if user has permission
        """
        # Super admins have all permissions
        if self.is_super_admin:
            return True

        # Check user's roles for the permission
        return self.user_roles.filter(
            role__permissions__code=permission_code,
            role__is_active=True
        ).exists()

    def get_permissions(self):
        """Get all permissions for this user."""
        if self.is_super_admin:
            return ['*']  # All permissions

        permissions = set()
        for user_role in self.user_roles.filter(role__is_active=True):
            role_permissions = user_role.role.permissions.values_list('code', flat=True)
            permissions.update(role_permissions)

        return list(permissions)

    def get_roles(self):
        """Get all roles for this user."""
        return self.user_roles.filter(role__is_active=True).select_related('role')


class Permission(BaseModel):
    """
    Permission model for RBAC.

    Permissions define what actions can be performed on what resources.
    Format: {module}.{action}
    Example: students.create, students.view, finance.approve_payment
    """

    module = models.CharField(
        max_length=50,
        db_index=True,
        help_text='Module name (e.g., students, finance, library)'
    )

    action = models.CharField(
        max_length=50,
        db_index=True,
        help_text='Action name (e.g., view, create, update, delete, approve)'
    )

    code = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
        help_text='Permission code (module.action)'
    )

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    # Categorization
    CATEGORY_CHOICES = [
        ('ACADEMIC', 'Academic'),
        ('ADMINISTRATIVE', 'Administrative'),
        ('FINANCIAL', 'Financial'),
        ('OPERATIONAL', 'Operational'),
        ('SYSTEM', 'System'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='OPERATIONAL')

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'permissions'
        ordering = ['module', 'action']
        indexes = [
            models.Index(fields=['module', 'action']),
            models.Index(fields=['code']),
            models.Index(fields=['category', 'is_active']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs):
        """Auto-generate code from module and action."""
        if not self.code:
            self.code = f"{self.module}.{self.action}"
        super().save(*args, **kwargs)


class Role(BaseModel):
    """
    Role model for RBAC.

    Roles group permissions together and are assigned to users.
    """

    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(
        max_length=50,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[A-Z_]+$',
                message='Code must contain only uppercase letters and underscores'
            )
        ]
    )

    description = models.TextField(blank=True)

    # Permissions
    permissions = models.ManyToManyField(
        Permission,
        related_name='roles',
        blank=True
    )

    # System roles cannot be deleted
    is_system_role = models.BooleanField(
        default=False,
        help_text='System roles cannot be deleted'
    )

    is_active = models.BooleanField(default=True)

    # Hierarchy (optional - for role inheritance)
    parent_role = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='child_roles'
    )

    class Meta:
        db_table = 'roles'
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_all_permissions(self):
        """Get all permissions including inherited from parent roles."""
        permissions = set(self.permissions.filter(is_active=True))

        # Add parent permissions if hierarchy exists
        if self.parent_role:
            permissions.update(self.parent_role.get_all_permissions())

        return list(permissions)


class UserRole(BaseModel):
    """
    User-Role mapping for RBAC.

    Links users to their roles with audit information.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_roles'
    )

    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name='user_assignments'
    )

    # Assignment tracking
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='roles_assigned'
    )

    # Optional expiry
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Role expires at this time (optional)'
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_roles'
        unique_together = ['user', 'role']
        ordering = ['-assigned_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['role', 'is_active']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.role.name}"

    @property
    def is_expired(self):
        """Check if role assignment has expired."""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False


class PasswordResetToken(BaseModel):
    """
    Password reset tokens for password recovery.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens'
    )

    token = models.CharField(max_length=100, unique=True, db_index=True)
    expires_at = models.DateTimeField()

    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)

    # Track request metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        db_table = 'password_reset_tokens'
        ordering = ['-created_at']

    def __str__(self):
        return f"Reset token for {self.user.email}"

    @property
    def is_expired(self):
        """Check if token has expired."""
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        """Check if token is valid (not used and not expired)."""
        return not self.used and not self.is_expired

    def mark_as_used(self):
        """Mark token as used."""
        self.used = True
        self.used_at = timezone.now()
        self.save(update_fields=['used', 'used_at'])


class EmailVerificationToken(BaseModel):
    """
    Email verification tokens.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='email_verification_tokens'
    )

    token = models.CharField(max_length=100, unique=True, db_index=True)
    expires_at = models.DateTimeField()

    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'email_verification_tokens'
        ordering = ['-created_at']

    def __str__(self):
        return f"Email verification for {self.user.email}"

    @property
    def is_expired(self):
        """Check if token has expired."""
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        """Check if token is valid."""
        return not self.used and not self.is_expired

    def mark_as_used(self):
        """Mark token as used."""
        self.used = True
        self.used_at = timezone.now()
        self.save(update_fields=['used', 'used_at'])


class LoginHistory(BaseModel):
    """
    Track user login history for security audit.
    """

    # Explicit UUID primary key for consistency
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='login_history'
    )

    # Login details
    login_at = models.DateTimeField(auto_now_add=True, db_index=True)
    logout_at = models.DateTimeField(null=True, blank=True)

    # Session info
    session_key = models.CharField(max_length=40, blank=True)

    # Request metadata
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    device_type = models.CharField(max_length=50, blank=True)  # web, mobile, tablet
    browser = models.CharField(max_length=100, blank=True)
    os = models.CharField(max_length=100, blank=True)

    # Location (optional - can be determined from IP)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)

    # Status
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('LOCKED', 'Account Locked'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUCCESS')

    failure_reason = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'login_history'
        ordering = ['-login_at']
        indexes = [
            models.Index(fields=['user', 'login_at']),
            models.Index(fields=['ip_address', 'login_at']),
            models.Index(fields=['status', 'login_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.login_at}"


import hashlib as _hashlib
import secrets as _secrets
import uuid as _uuid_mod
from datetime import timedelta as _timedelta


class OTPToken(models.Model):
    """OTP tokens for phone-based authentication (Workstream C)."""
    phone = models.CharField(max_length=15)
    otp_hash = models.CharField(max_length=64)  # SHA-256 of OTP
    session_id = models.UUIDField(default=_uuid_mod.uuid4, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)  # max 3 attempts
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'OTP Token'
        verbose_name_plural = 'OTP Tokens'

    def __str__(self):
        return f"OTP for {self.phone} (used={self.is_used})"

    @classmethod
    def generate_otp(cls):
        return str(_secrets.randbelow(900000) + 100000)

    @classmethod
    def hash_otp(cls, otp):
        return _hashlib.sha256(otp.encode()).hexdigest()

    @classmethod
    def create_for_phone(cls, phone):
        otp = cls.generate_otp()
        cls.objects.filter(phone=phone, is_used=False).update(is_used=True)
        instance = cls.objects.create(
            phone=phone,
            otp_hash=cls.hash_otp(otp),
            expires_at=timezone.now() + _timedelta(minutes=10),
        )
        return instance, otp

    def verify(self, otp):
        if self.is_used or timezone.now() > self.expires_at or self.attempts >= 3:
            return False
        self.attempts += 1
        if self.otp_hash == self.hash_otp(otp):
            self.is_used = True
            self.save(update_fields=['attempts', 'is_used'])
            return True
        self.save(update_fields=['attempts'])
        return False
