"""
Admin configuration for authentication app.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    User, Permission, Role, UserRole, PasswordResetToken,
    EmailVerificationToken, LoginHistory
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User admin.
    """
    list_display = [
        'email', 'full_name_display', 'user_type', 'is_active',
        'email_verified', 'phone_verified', 'created_at'
    ]
    list_filter = ['user_type', 'is_active', 'is_staff', 'is_superuser', 'email_verified', 'created_at']
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']

    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'phone', 'alternate_phone', 'date_of_birth', 'gender', 'avatar', 'bio')
        }),
        ('Address', {
            'fields': ('address', 'city', 'state', 'country', 'pincode'),
            'classes': ('collapse',)
        }),
        ('User Type', {
            'fields': ('user_type',)
        }),
        ('Verification', {
            'fields': ('email_verified', 'email_verified_at', 'phone_verified', 'phone_verified_at')
        }),
        ('Security', {
            'fields': (
                'failed_login_attempts', 'last_failed_login', 'account_locked_until',
                'password_changed_at', 'force_password_change'
            ),
            'classes': ('collapse',)
        }),
        ('Activity', {
            'fields': ('last_login', 'last_login_ip', 'last_activity'),
            'classes': ('collapse',)
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important dates', {
            'fields': ('date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'phone', 'password1', 'password2', 'first_name', 'last_name', 'user_type'),
        }),
    )

    readonly_fields = ['created_at', 'updated_at', 'date_joined', 'last_login', 'email_verified_at', 'phone_verified_at']

    def full_name_display(self, obj):
        """Display full name."""
        return obj.get_full_name()
    full_name_display.short_description = 'Full Name'


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    """
    Permission admin.
    """
    list_display = ['name', 'code', 'module', 'action', 'category', 'is_active']
    list_filter = ['module', 'category', 'is_active']
    search_fields = ['name', 'code', 'module', 'action']
    ordering = ['module', 'action']

    fieldsets = (
        (None, {
            'fields': ('module', 'action', 'code', 'name')
        }),
        ('Details', {
            'fields': ('description', 'category')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

    readonly_fields = ['code']


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """
    Role admin.
    """
    list_display = ['name', 'code', 'permissions_count', 'users_count', 'is_system_role', 'is_active']
    list_filter = ['is_system_role', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    filter_horizontal = ['permissions']
    ordering = ['name']

    fieldsets = (
        (None, {
            'fields': ('name', 'code', 'description')
        }),
        ('Permissions', {
            'fields': ('permissions',)
        }),
        ('Hierarchy', {
            'fields': ('parent_role',),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_system_role', 'is_active')
        }),
    )

    def permissions_count(self, obj):
        """Display permission count."""
        count = obj.permissions.count()
        return format_html('<b>{}</b>', count)
    permissions_count.short_description = 'Permissions'

    def users_count(self, obj):
        """Display user count."""
        count = obj.user_assignments.filter(is_active=True).count()
        return format_html('<b>{}</b>', count)
    users_count.short_description = 'Users'

    def get_readonly_fields(self, request, obj=None):
        """Make code and is_system_role readonly for existing objects."""
        if obj and obj.is_system_role:
            return ['code', 'is_system_role']
        return []


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    """
    User-Role assignment admin.
    """
    list_display = ['user', 'role', 'assigned_at', 'assigned_by', 'is_active', 'is_expired']
    list_filter = ['role', 'is_active', 'assigned_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'role__name']
    raw_id_fields = ['user', 'assigned_by']
    ordering = ['-assigned_at']

    fieldsets = (
        (None, {
            'fields': ('user', 'role')
        }),
        ('Assignment Details', {
            'fields': ('assigned_by', 'assigned_at', 'expires_at')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

    readonly_fields = ['assigned_at']


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    """
    Password reset token admin.
    """
    list_display = ['user', 'token_display', 'created_at', 'expires_at', 'used', 'is_valid_display']
    list_filter = ['used', 'created_at']
    search_fields = ['user__email', 'token']
    readonly_fields = ['user', 'token', 'expires_at', 'used', 'used_at', 'ip_address', 'user_agent', 'created_at']
    ordering = ['-created_at']

    def token_display(self, obj):
        """Display truncated token."""
        return f"{obj.token[:20]}..."
    token_display.short_description = 'Token'

    def is_valid_display(self, obj):
        """Display validity status."""
        if obj.is_valid:
            return format_html('<span style="color: green;">✓ Valid</span>')
        return format_html('<span style="color: red;">✗ Invalid</span>')
    is_valid_display.short_description = 'Valid'

    def has_add_permission(self, request):
        return False


@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    """
    Email verification token admin.
    """
    list_display = ['user', 'token_display', 'created_at', 'expires_at', 'used', 'is_valid_display']
    list_filter = ['used', 'created_at']
    search_fields = ['user__email', 'token']
    readonly_fields = ['user', 'token', 'expires_at', 'used', 'used_at', 'created_at']
    ordering = ['-created_at']

    def token_display(self, obj):
        """Display truncated token."""
        return f"{obj.token[:20]}..."
    token_display.short_description = 'Token'

    def is_valid_display(self, obj):
        """Display validity status."""
        if obj.is_valid:
            return format_html('<span style="color: green;">✓ Valid</span>')
        return format_html('<span style="color: red;">✗ Invalid</span>')
    is_valid_display.short_description = 'Valid'

    def has_add_permission(self, request):
        return False


@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):
    """
    Login history admin.
    """
    list_display = [
        'user', 'login_at', 'logout_at', 'ip_address',
        'device_type', 'browser', 'status'
    ]
    list_filter = ['status', 'device_type', 'login_at']
    search_fields = ['user__email', 'ip_address', 'browser']
    readonly_fields = [
        'user', 'login_at', 'logout_at', 'session_key',
        'ip_address', 'user_agent', 'device_type', 'browser', 'os',
        'country', 'city', 'status', 'failure_reason'
    ]
    ordering = ['-login_at']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
