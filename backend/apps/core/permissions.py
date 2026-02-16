from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    The request is authenticated as a user, or is a read-only request.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        # BUT we only want Authenticated users to read.
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are allowed to Super Admins, School Admins, and Librarians (for library context)
        # We check user_type since 'role' attribute might not be populated in all contexts
        allowed_types = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'LIBRARIAN']
        return (
            request.user.is_superuser or 
            getattr(request.user, 'role', '') == 'ADMIN' or
            request.user.user_type in allowed_types
        )


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission class for Super Admin only access.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_superuser or request.user.user_type == 'SUPER_ADMIN')
        )


class IsSalesTeam(permissions.BasePermission):
    """
    Permission class for Sales Team access.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            (
                request.user.is_superuser or 
                request.user.user_type in ['SUPER_ADMIN', 'SALES']
            )
        )

