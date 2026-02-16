from rest_framework import permissions

class IsSchoolAdmin(permissions.BasePermission):
    """
    Allocates permissions only to School Admins and Super Admins.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        allowed_types = ['SUPER_ADMIN', 'SCHOOL_ADMIN']
        return request.user.user_type in allowed_types or request.user.is_superuser
