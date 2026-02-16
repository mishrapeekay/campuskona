"""
Custom permission classes for authentication and authorization.
"""

from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """
    Permission class for super administrators only.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_super_admin


class IsSchoolAdmin(BasePermission):
    """
    Permission class for school administrators.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_super_admin or request.user.is_school_admin)
        )


class IsPrincipal(BasePermission):
    """
    Permission class for principals.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.user_type in ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL']
        )


class IsTeacher(BasePermission):
    """
    Permission class for teachers.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_teacher
        )


class IsStudent(BasePermission):
    """
    Permission class for students.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_student
        )


class IsParent(BasePermission):
    """
    Permission class for parents.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_parent
        )


class IsAccountant(BasePermission):
    """
    Permission class for accountants.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_super_admin or request.user.is_school_admin or request.user.user_type == 'ACCOUNTANT')
        )


class IsLibrarian(BasePermission):
    """
    Permission class for librarians.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_super_admin or request.user.is_school_admin or request.user.user_type == 'LIBRARIAN')
        )


class IsTransportManager(BasePermission):
    """
    Permission class for transport managers.
    """
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (request.user.is_super_admin or request.user.is_school_admin or request.user.user_type == 'TRANSPORT_MANAGER')
        )


class HasPermission(BasePermission):
    """
    Permission class that checks if user has specific permission.

    Usage in view:
        permission_classes = [HasPermission]
        required_permission = 'students.create'
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Get required permission from view
        required_permission = getattr(view, 'required_permission', None)

        if not required_permission:
            # No specific permission required
            return True

        # Check if user has permission
        return request.user.has_permission(required_permission)


class IsOwnerOrAdmin(BasePermission):
    """
    Permission class that allows access to owners or admins.
    """

    def has_object_permission(self, request, view, obj):
        # Super admins and school admins can access anything
        if request.user.is_super_admin or request.user.is_school_admin:
            return True

        # Check if object has user attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user

        # Check if object is the user itself
        if obj == request.user:
            return True

        return False


class IsOwnerOrReadOnly(BasePermission):
    """
    Permission class that allows edit to owner, read to everyone.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions for everyone
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        # Write permissions only to owner or admin
        if request.user.is_super_admin or request.user.is_school_admin:
            return True

        if hasattr(obj, 'user'):
            return obj.user == request.user

        return obj == request.user


class HasFeature(BasePermission):
    """
    Permission class that checks if the current tenant has access to a feature.

    Usage in view:
        class MyView(APIView):
            required_feature = 'ai_timetable_generator'
            permission_classes = [IsAuthenticated, HasFeature]

    Super admins always pass this check.
    """
    message = 'This feature is not available on your current subscription plan.'

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Super admins bypass feature checks
        if request.user.is_super_admin:
            return True

        feature_code = getattr(view, 'required_feature', None)
        if not feature_code:
            return True

        # Use pre-attached tenant_features from middleware if available
        tenant_features = getattr(request, 'tenant_features', None)
        if tenant_features is not None:
            return tenant_features.get(feature_code, False)

        # Fallback: check directly
        school = getattr(request, 'tenant', None)
        if not school:
            return False

        from apps.tenants.features import has_feature
        return has_feature(school, feature_code)
