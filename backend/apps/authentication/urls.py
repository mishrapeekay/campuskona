"""
URL configuration for authentication app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    logout_view,
    register_view,
    verify_email_view,
    change_password_view,
    password_reset_request_view,
    password_reset_confirm_view,
    UserViewSet,
    PermissionViewSet,
    RoleViewSet,
    UserRoleViewSet,
    OTPRequestView,
    OTPVerifyView,
    AdmissionNoLoginView,
)

app_name = 'authentication'

# Router for viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'user-roles', UserRoleViewSet, basename='user-role')

urlpatterns = [
    # JWT Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('refresh/', TokenRefreshView.as_view(permission_classes=[AllowAny]), name='token_refresh'),

    # User Registration & Verification
    path('register/', register_view, name='register'),
    path('verify-email/', verify_email_view, name='verify_email'),

    # Password Management
    path('change-password/', change_password_view, name='change_password'),
    path('password-reset/', password_reset_request_view, name='password_reset'),
    path('password-reset/confirm/', password_reset_confirm_view, name='password_reset_confirm'),

    # OTP Login (Workstream C)
    path('otp/request/', OTPRequestView.as_view(), name='otp-request'),
    path('otp/verify/', OTPVerifyView.as_view(), name='otp-verify'),
    path('admission-login/', AdmissionNoLoginView.as_view(), name='admission-login'),

    # ViewSets
    path('', include(router.urls)),
]
