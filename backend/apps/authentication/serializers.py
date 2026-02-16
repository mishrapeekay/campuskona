"""
Serializers for authentication app.
"""

import logging
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, Role, Permission, UserRole, LoginHistory

logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    """
    User serializer for API responses.
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    permissions = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    staff_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'phone', 'first_name', 'last_name', 'full_name',
            'user_type', 'date_of_birth', 'gender', 'avatar', 'bio',
            'address', 'city', 'state', 'country', 'pincode',
            'email_verified', 'phone_verified',
            'is_active', 'is_staff', 'is_superuser',
            'last_login', 'created_at', 'updated_at',
            'permissions', 'roles', 'student_id', 'staff_id'
        ]
        read_only_fields = [
            'id', 'email_verified', 'phone_verified',
            'is_staff', 'is_superuser', 'last_login', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'avatar': {'required': False},
        }

    def get_permissions(self, obj):
        """Get user's permissions."""
        return obj.get_permissions()

    def get_roles(self, obj):
        """Get user's roles."""
        return [
            {'id': str(ur.role.id), 'name': ur.role.name, 'code': ur.role.code}
            for ur in obj.get_roles()
        ]

    def get_student_id(self, obj):
        """Get student profile ID if user is a student."""
        try:
            if hasattr(obj, 'student_profile') and obj.student_profile:
                return str(obj.student_profile.id)
        except Exception:
            pass
            
        # Fallback: Direct lookup
        try:
            from apps.students.models import Student
            student = Student.objects.get(user_id=obj.id)
            return str(student.id)
        except Exception:
            pass
            
        return None

    def get_staff_id(self, obj):
        """Get staff profile ID if user is staff/teacher."""
        try:
            if hasattr(obj, 'staff_profile') and obj.staff_profile:
                return str(obj.staff_profile.id)
        except Exception:
            pass

        # Fallback: Direct lookup
        try:
            from apps.staff.models import StaffMember
            staff = StaffMember.objects.get(user_id=obj.id)
            return str(staff.id)
        except Exception:
            pass
            
        return None


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'email', 'phone', 'password', 'password_confirm',
            'first_name', 'last_name', 'user_type',
            'date_of_birth', 'gender', 'address', 'city', 'state', 'pincode'
        ]

    def validate(self, attrs):
        """Validate password match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'alternate_phone',
            'date_of_birth', 'gender', 'avatar', 'bio',
            'address', 'city', 'state', 'country', 'pincode'
        ]


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        """Validate passwords."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})

        # Validate old password
        user = self.context['request'].user
        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({"old_password": "Wrong password."})

        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting password reset.
    """
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """Validate that user with this email exists."""
        try:
            User.objects.get(email=value, is_active=True)
        except User.DoesNotExist:
            # Don't reveal if email exists or not (security)
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for confirming password reset.
    """
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        """Validate passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer with additional user data.
    """

    @classmethod
    def get_token(cls, user):
        """Add custom claims to token."""
        token = super().get_token(user)

        # Add custom claims
        try:
            token['user_id'] = str(user.id)
            token['email'] = str(user.email) # Ensure string
            token['user_type'] = str(user.user_type)
            token['full_name'] = str(user.get_full_name())
            token['is_super_admin'] = bool(user.is_super_admin)
            
            perms = user.get_permissions()
            # Ensure proper list of strings
            token['permissions'] = [str(p) for p in perms] if perms else []
            
            logger.info(f"Token claims added for {user.email}")
        except Exception as e:
            logger.error(f"Error adding token claims: {e}")

        return token

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        logger.info(f"Login attempt for user: {email}")

        request = self.context.get('request')
        if request and hasattr(request, 'tenant'):
            from apps.core.db_router import switch_to_tenant_schema, switch_to_public_schema
            from django.db import connection

            # 1. Try finding user in Tenant Schema
            try:
                logger.debug(f"Checking tenant schema: {request.tenant.schema_name}")
                switch_to_tenant_schema(request.tenant)

                # We specifically check for the user here to see if we should stay in this schema
                user_check = User.objects.get(email=email)
                logger.info(f"User found in tenant schema '{request.tenant.schema_name}'")

                # If found, we STAY in this schema context for super().validate()

            except User.DoesNotExist:
                logger.debug(f"User not found in tenant schema. Switching to public.")
                # 2. Fallback to Public Schema
                switch_to_public_schema()

                try:
                    User.objects.get(email=email)
                    logger.info(f"User found in public schema")
                except User.DoesNotExist:
                    logger.warning(f"User not found in public schema either")
            except Exception as e:
                logger.error(f"Schema check error: {e}", exc_info=True)
                # Try to reset to public just in case
                switch_to_public_schema()

        # Check final context - using PostgreSQL search_path query
        from django.db import connection
        if connection.vendor == 'postgresql':
            with connection.cursor() as cursor:
                cursor.execute('SHOW search_path')
                result = cursor.fetchone()
                logger.debug(f"Final schema context for auth: {result[0] if result else 'unknown'}")
        else:
            logger.debug(f"Final schema context for auth: default (non-PostgreSQL)")

        # Check if account is locked
        try:
            user = User.objects.get(email=attrs['email'])
            if user.is_account_locked:
                raise serializers.ValidationError({
                    'detail': f'Account is locked until {user.account_locked_until}. Please try again later.'
                })
        except User.DoesNotExist:
            pass

        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = UserSerializer(self.user).data

        # Explicitly fetch student_id/staff_id from Tenant Schema if needed
        # This handles the case where User is in Public but Profile is in Tenant
        if request and hasattr(request, 'tenant') and request.tenant.schema_name != 'public':
            try:
                from apps.core.db_router import switch_to_tenant_schema, switch_to_public_schema
                from apps.students.models import Student
                from apps.staff.models import StaffMember

                logger.debug(f"Switching to tenant '{request.tenant.schema_name}' to fetch profile IDs")
                switch_to_tenant_schema(request.tenant)

                # Fetch Student ID
                if not data['user'].get('student_id'):
                    try:
                        s = Student.objects.get(user_id=self.user.id)
                        data['user']['student_id'] = str(s.id)
                        logger.info(f"Found Student ID: {s.id} for user {self.user.email}")
                    except Student.DoesNotExist:
                        logger.debug(f"No student profile found for user {self.user.email}")

                # Fetch Staff ID
                if not data['user'].get('staff_id'):
                    try:
                        s = StaffMember.objects.get(user_id=self.user.id)
                        data['user']['staff_id'] = str(s.id)
                        logger.info(f"Found Staff ID: {s.id} for user {self.user.email}")
                    except StaffMember.DoesNotExist:
                        logger.debug(f"No staff profile found for user {self.user.email}")

                # Revert to Public (good practice, though request ends soon)
                switch_to_public_schema()

            except Exception as e:
                logger.error(f"Error fetching profile IDs from tenant: {e}", exc_info=True)
                try:
                    switch_to_public_schema()
                except:
                    pass

        # Record successful login
        if hasattr(self.context.get('request'), 'META'):
            ip_address = self.context['request'].META.get('REMOTE_ADDR')
            self.user.record_successful_login(ip_address)

        return data


class PermissionSerializer(serializers.ModelSerializer):
    """
    Permission serializer.
    """
    class Meta:
        model = Permission
        fields = ['id', 'module', 'action', 'code', 'name', 'description', 'category', 'is_active']
        read_only_fields = ['id', 'code']


class RoleSerializer(serializers.ModelSerializer):
    """
    Role serializer with permissions.
    """
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    users_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = [
            'id', 'name', 'code', 'description',
            'permissions', 'permission_ids',
            'is_system_role', 'is_active', 'parent_role',
            'users_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_users_count(self, obj):
        """Get count of users with this role."""
        return obj.user_assignments.filter(is_active=True).count()

    def create(self, validated_data):
        """Create role with permissions."""
        permission_ids = validated_data.pop('permission_ids', [])
        role = Role.objects.create(**validated_data)

        if permission_ids:
            permissions = Permission.objects.filter(id__in=permission_ids)
            role.permissions.set(permissions)

        return role

    def update(self, instance, validated_data):
        """Update role with permissions."""
        permission_ids = validated_data.pop('permission_ids', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if permission_ids is not None:
            permissions = Permission.objects.filter(id__in=permission_ids)
            instance.permissions.set(permissions)

        return instance


class UserRoleSerializer(serializers.ModelSerializer):
    """
    User-Role assignment serializer.
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.get_full_name', read_only=True)

    class Meta:
        model = UserRole
        fields = [
            'id', 'user', 'user_email', 'user_name',
            'role', 'role_name',
            'assigned_at', 'assigned_by', 'assigned_by_name',
            'expires_at', 'is_active', 'is_expired'
        ]
        read_only_fields = ['id', 'assigned_at', 'assigned_by', 'is_expired']


class AssignRoleSerializer(serializers.Serializer):
    """
    Serializer for assigning roles to users.
    """
    user_id = serializers.UUIDField(required=True)
    role_id = serializers.UUIDField(required=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate_user_id(self, value):
        """Validate user exists."""
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        return value

    def validate_role_id(self, value):
        """Validate role exists."""
        try:
            Role.objects.get(id=value)
        except Role.DoesNotExist:
            raise serializers.ValidationError("Role not found.")
        return value


class LoginHistorySerializer(serializers.ModelSerializer):
    """
    Login history serializer.
    """
    user_email = serializers.EmailField(source='user.email', read_only=True)
    duration = serializers.SerializerMethodField()

    class Meta:
        model = LoginHistory
        fields = [
            'id', 'user', 'user_email', 'login_at', 'logout_at', 'duration',
            'ip_address', 'user_agent', 'device_type', 'browser', 'os',
            'country', 'city', 'status', 'failure_reason'
        ]
        read_only_fields = fields

    def get_duration(self, obj):
        """Calculate session duration in minutes."""
        if obj.logout_at:
            delta = obj.logout_at - obj.login_at
            return int(delta.total_seconds() / 60)
        return None
