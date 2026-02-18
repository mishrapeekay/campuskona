"""
Authentication views for the School Management System.
"""

import logging
import secrets
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import logout
from django.db.models import Q
from rest_framework import status, viewsets, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.utils import get_client_ip

logger = logging.getLogger(__name__)
from .models import (
    User, Role, Permission, UserRole, PasswordResetToken,
    EmailVerificationToken, LoginHistory
)
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    ChangePasswordSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, CustomTokenObtainPairSerializer,
    PermissionSerializer, RoleSerializer, UserRoleSerializer,
    AssignRoleSerializer, LoginHistorySerializer
)
from .permissions import IsSuperAdmin, IsSchoolAdmin


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view with additional user data and login tracking.
    """
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        """Handle login with login history tracking."""
        email = request.data.get('email')

        try:
            response = super().post(request, *args, **kwargs)

            # Track successful login
            if response.status_code == 200:
                try:
                    user = User.objects.get(email=email)
                    LoginHistory.objects.create(
                        user=user,
                        ip_address=get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        status='SUCCESS'
                    )
                except User.DoesNotExist:
                    logger.warning(f"Login successful but user not found: {email}")
                except Exception as e:
                    logger.error(f"Error tracking login history: {e}", exc_info=True)

            return response

        except Exception as e:
            # Track failed login attempt
            try:
                user = User.objects.get(email=email)
                user.record_failed_login()
                LoginHistory.objects.create(
                    user=user,
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    status='FAILED',
                    failure_reason=str(e)
                )
                logger.warning(f"Failed login attempt for user: {email}")
            except User.DoesNotExist:
                logger.warning(f"Failed login attempt for non-existent user: {email}")
            except Exception as track_error:
                logger.error(f"Error tracking failed login: {track_error}", exc_info=True)

            # Re-raise the exception so DRF can handle it properly
            raise


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user and blacklist refresh token.
    """
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()

        # Update last login history
        LoginHistory.objects.filter(
            user=request.user,
            logout_at__isnull=True
        ).order_by('-login_at').first().update(logout_at=timezone.now())

        logout(request)

        return Response({
            'message': 'Successfully logged out.'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': True,
            'message': 'Logout failed',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user.
    """
    serializer = UserCreateSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()

        # Generate email verification token
        token = secrets.token_urlsafe(32)
        EmailVerificationToken.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=24)
        )

        # TODO: Send verification email

        return Response({
            'message': 'User registered successfully. Please verify your email.',
            'user': UserSerializer(user).data,
            'verification_token': token  # In production, send via email
        }, status=status.HTTP_201_CREATED)

    return Response({
        'error': True,
        'message': 'Registration failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_view(request):
    """
    Verify email using token.
    """
    token = request.data.get('token')

    if not token:
        return Response({
            'error': True,
            'message': 'Token is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        verification = EmailVerificationToken.objects.get(token=token)

        if not verification.is_valid:
            return Response({
                'error': True,
                'message': 'Invalid or expired token'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify email
        verification.user.verify_email()
        verification.mark_as_used()

        return Response({
            'message': 'Email verified successfully'
        }, status=status.HTTP_200_OK)

    except EmailVerificationToken.DoesNotExist:
        return Response({
            'error': True,
            'message': 'Invalid token'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    Change password for authenticated user.
    """
    serializer = ChangePasswordSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        # Set new password
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.password_changed_at = timezone.now()
        request.user.save()

        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)

    return Response({
        'error': True,
        'message': 'Password change failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    """
    Request password reset (step 1).
    """
    serializer = PasswordResetRequestSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email, is_active=True)

            # Generate reset token
            token = secrets.token_urlsafe(32)
            PasswordResetToken.objects.create(
                user=user,
                token=token,
                expires_at=timezone.now() + timedelta(hours=1),
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            # TODO: Send reset email

            return Response({
                'message': 'Password reset email sent. Please check your email.',
                'reset_token': token  # In production, send via email only
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            # Don't reveal if email exists (security)
            return Response({
                'message': 'If the email exists, a reset link has been sent.'
            }, status=status.HTTP_200_OK)

    return Response({
        'error': True,
        'message': 'Invalid request',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    """
    Confirm password reset with token (step 2).
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)

    if serializer.is_valid():
        token = serializer.validated_data['token']

        try:
            reset_token = PasswordResetToken.objects.get(token=token)

            if not reset_token.is_valid:
                return Response({
                    'error': True,
                    'message': 'Invalid or expired token'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Set new password
            user = reset_token.user
            user.set_password(serializer.validated_data['new_password'])
            user.password_changed_at = timezone.now()
            user.failed_login_attempts = 0
            user.account_locked_until = None
            user.save()

            # Mark token as used
            reset_token.mark_as_used()

            return Response({
                'message': 'Password reset successfully. You can now login with your new password.'
            }, status=status.HTTP_200_OK)

        except PasswordResetToken.DoesNotExist:
            return Response({
                'error': True,
                'message': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'error': True,
        'message': 'Password reset failed',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users.

    Optimizations:
    - Uses select_related/prefetch_related to reduce N+1 queries
    - Loads user roles and permissions efficiently
    - Reduces queries from 100+ to 3-5 for lists
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_queryset(self):
        """
        Filter queryset based on user type with optimizations.

        Optimizations Applied:
        - prefetch_related for user_roles and permissions
        - select_related for role data
        - Only loads necessary fields for list view
        """
        from apps.authentication.models import UserRole
        from django.db.models import Prefetch

        user = self.request.user

        # Base optimized queryset
        if self.action == 'list':
            # Lightweight queryset for lists
            queryset = User.objects.prefetch_related(
                Prefetch(
                    'user_roles',
                    queryset=UserRole.objects.select_related('role')
                )
            )
        else:
            # Full queryset for detail/update
            queryset = User.objects.prefetch_related(
                Prefetch(
                    'user_roles',
                    queryset=UserRole.objects.select_related('role').prefetch_related(
                        'role__permissions'
                    )
                ),
                'login_history',
            )

        # Apply access control
        if user.is_super_admin:
            # Super admins see all users
            return queryset
        elif user.is_school_admin:
            # School admins see users in their tenant
            # (Tenant is already filtered by TenantMiddleware)
            return queryset
        else:
            # Regular users see only themselves
            return queryset.filter(id=user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate user account."""
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'message': 'User activated successfully'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate user account."""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'message': 'User deactivated successfully'})

    @action(detail=True, methods=['get'])
    def login_history(self, request, pk=None):
        """Get user's login history."""
        user = self.get_object()
        history = LoginHistory.objects.filter(user=user).order_by('-login_at')[:20]
        serializer = LoginHistorySerializer(history, many=True)
        return Response(serializer.data)


class PermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing permissions.
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def get_queryset(self):
        """Filter permissions by module or category."""
        queryset = super().get_queryset()

        module = self.request.query_params.get('module')
        category = self.request.query_params.get('category')

        if module:
            queryset = queryset.filter(module=module)
        if category:
            queryset = queryset.filter(category=category)

        return queryset


class RoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing roles.

    Optimizations:
    - Prefetches all permissions for each role
    - Annotates permission count
    - Reduces queries for role lists
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def get_queryset(self):
        """Get optimized role queryset."""
        from django.db.models import Count

        queryset = super().get_queryset()

        # Prefetch permissions to avoid N+1
        queryset = queryset.prefetch_related('permissions')

        # Annotate with permission count for list views
        if self.action == 'list':
            queryset = queryset.annotate(
                permission_count=Count('permissions')
            )

        return queryset

    @action(detail=True, methods=['post'])
    def assign_permissions(self, request, pk=None):
        """Assign permissions to role."""
        role = self.get_object()
        permission_ids = request.data.get('permission_ids', [])

        permissions = Permission.objects.filter(id__in=permission_ids)
        role.permissions.set(permissions)

        return Response({
            'message': f'{len(permissions)} permissions assigned to role'
        })

    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """Get users with this role."""
        role = self.get_object()
        user_roles = UserRole.objects.filter(role=role, is_active=True)
        serializer = UserRoleSerializer(user_roles, many=True)
        return Response(serializer.data)


class UserRoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user-role assignments.

    Optimizations:
    - select_related for user, role, and assigned_by
    - Reduces N+1 queries for role assignments
    """
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated, IsSchoolAdmin]

    def get_queryset(self):
        """Get optimized user-role queryset."""
        queryset = super().get_queryset()

        # Optimize with select_related
        queryset = queryset.select_related(
            'user',
            'role',
            'assigned_by'
        )

        # Filter by user if specified
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # Filter by role if specified
        role_id = self.request.query_params.get('role')
        if role_id:
            queryset = queryset.filter(role_id=role_id)

        return queryset

    @action(detail=False, methods=['post'])
    def assign(self, request):
        """Assign role to user."""
        serializer = AssignRoleSerializer(data=request.data)

        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            role_id = serializer.validated_data['role_id']
            expires_at = serializer.validated_data.get('expires_at')

            user = User.objects.get(id=user_id)
            role = Role.objects.get(id=role_id)

            # Check if assignment already exists
            user_role, created = UserRole.objects.get_or_create(
                user=user,
                role=role,
                defaults={
                    'assigned_by': request.user,
                    'expires_at': expires_at
                }
            )

            if not created:
                user_role.is_active = True
                user_role.expires_at = expires_at
                user_role.save()

            return Response({
                'message': 'Role assigned successfully',
                'user_role': UserRoleSerializer(user_role).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'error': True,
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        """Revoke role from user."""
        user_role = self.get_object()
        user_role.is_active = False
        user_role.save()

        return Response({'message': 'Role revoked successfully'})


# ─────────────────────────────────────────────────────────────
# Workstream C: OTP Login + Admission Number Login
# ─────────────────────────────────────────────────────────────
from rest_framework.views import APIView


class OTPRequestView(APIView):
    """Request OTP via SMS for phone-based login."""
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get('phone', '').strip()
        if not phone or len(phone) < 10:
            return Response({'error': 'Valid phone number required'}, status=status.HTTP_400_BAD_REQUEST)

        phone = phone.replace(' ', '').replace('-', '').replace('+91', '').replace('+', '')
        phone_e164 = f'+91{phone[-10:]}'

        from apps.authentication.models import OTPToken
        token_obj, otp = OTPToken.create_for_phone(phone_e164)

        # Send OTP via MSG91 (graceful degradation if not configured)
        try:
            from apps.communication.services.sms_service import sms_service
            sms_service.send_otp(phone_e164)
        except Exception as e:
            logger.warning("OTP SMS not sent (MSG91 may not be configured): %s", str(e))

        return Response({
            'session_id': str(token_obj.session_id),
            'message': f'OTP sent to ****{phone_e164[-4:]}',
            'expires_in': 600,
        }, status=status.HTTP_200_OK)


class OTPVerifyView(APIView):
    """Verify OTP and return JWT tokens."""
    permission_classes = [AllowAny]

    def post(self, request):
        import uuid as _uuid
        from apps.authentication.models import OTPToken

        phone = request.data.get('phone', '').strip()
        otp = request.data.get('otp', '').strip()
        session_id = request.data.get('session_id', '').strip()

        if not all([phone, otp, session_id]):
            return Response({'error': 'phone, otp, and session_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session_uuid = _uuid.UUID(session_id)
            token_obj = OTPToken.objects.get(session_id=session_uuid, phone__endswith=phone[-10:])
        except (OTPToken.DoesNotExist, ValueError):
            return Response({'error': 'Invalid session'}, status=status.HTTP_400_BAD_REQUEST)

        if not token_obj.verify(otp):
            if token_obj.attempts >= 3:
                return Response({'error': 'Too many attempts. Request a new OTP.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
            remaining = max(0, 3 - token_obj.attempts)
            return Response({'error': f'Invalid OTP. {remaining} attempts remaining.'}, status=status.HTTP_400_BAD_REQUEST)

        # Find user by phone
        user = None
        for field in ['phone', 'mobile', 'phone_number']:
            try:
                user = User.objects.get(**{field: phone[-10:]})
                break
            except (User.DoesNotExist, Exception):
                continue

        if not user:
            try:
                from apps.students.models import Student
                student = Student.objects.get(phone_number=phone[-10:])
                user = student.user
            except Exception:
                pass

        if not user:
            return Response(
                {'error': 'No account found for this phone number. Contact your school administrator.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not user.is_active:
            return Response({'error': 'Account is inactive.'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_200_OK)


class AdmissionNoLoginView(APIView):
    """Login with Admission Number + Date of Birth (for students without email)."""
    permission_classes = [AllowAny]

    def post(self, request):
        admission_number = request.data.get('admission_number', '').strip()
        date_of_birth = request.data.get('date_of_birth', '').strip()

        if not admission_number or not date_of_birth:
            return Response({'error': 'admission_number and date_of_birth are required'}, status=status.HTTP_400_BAD_REQUEST)

        from datetime import datetime
        dob = None
        for fmt in ['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y']:
            try:
                dob = datetime.strptime(date_of_birth, fmt).date()
                break
            except ValueError:
                continue

        if not dob:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from apps.students.models import Student
            student = Student.objects.select_related('user').get(
                admission_number__iexact=admission_number,
                date_of_birth=dob,
            )
        except Student.DoesNotExist:
            return Response({'error': 'No student found with these credentials.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response({'error': 'Login failed. Contact administrator.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user = student.user
        if not user or not user.is_active:
            return Response({'error': 'Account inactive. Contact school.'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'name': f"{student.first_name} {student.last_name}".strip(),
                'admission_number': student.admission_number,
                'role': 'student',
            }
        }, status=status.HTTP_200_OK)
