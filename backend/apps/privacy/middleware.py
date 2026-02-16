"""
Middleware for automatic audit logging of sensitive data access
"""
from apps.privacy.services.audit_logging import AuditLoggingService


class SensitiveDataAccessMiddleware:
    """
    Middleware to automatically log sensitive data access
    Intercepts responses and logs when sensitive student fields are accessed
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Process the request
        response = self.get_response(request)

        # Log sensitive data access if applicable
        if hasattr(request, 'user') and request.user.is_authenticated:
            if hasattr(request, '_accessed_sensitive_fields'):
                # Log fields that were accessed
                for student, field_name, value in request._accessed_sensitive_fields:
                    AuditLoggingService.log_field_access(
                        user=request.user,
                        student=student,
                        field_name=field_name,
                        access_type='VIEW',
                        request=request,
                        value=value,
                        access_reason=f'API: {request.path}'
                    )

        return response


def track_sensitive_field_access(request, student, field_name, value=None):
    """
    Helper function to mark a field as accessed
    Call this from serializers or views when sensitive data is retrieved

    Usage:
        from apps.privacy.middleware import track_sensitive_field_access
        track_sensitive_field_access(request, student, 'aadhar_number', student.aadhar_number)
    """
    if not hasattr(request, '_accessed_sensitive_fields'):
        request._accessed_sensitive_fields = []

    request._accessed_sensitive_fields.append((student, field_name, value))
