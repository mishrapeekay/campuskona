"""
Custom exceptions for the application.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


class TenantNotFoundError(Exception):
    """Raised when tenant cannot be resolved."""
    pass


class InvalidTenantError(Exception):
    """Raised when tenant is invalid or inactive."""
    pass


class PermissionDeniedError(Exception):
    """Raised when user doesn't have required permission."""
    pass


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that provides consistent error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the response data
        custom_response_data = {
            'error': True,
            'message': None,
            'details': None,
        }

        if isinstance(response.data, dict):
            custom_response_data['message'] = response.data.get('detail', 'An error occurred')
            custom_response_data['details'] = {k: v for k, v in response.data.items() if k != 'detail'}
        elif isinstance(response.data, list):
            custom_response_data['message'] = 'Validation error'
            custom_response_data['details'] = response.data
        else:
            custom_response_data['message'] = str(response.data)

        response.data = custom_response_data

    # Handle custom exceptions
    elif isinstance(exc, TenantNotFoundError):
        response = Response(
            {
                'error': True,
                'message': 'Tenant not found',
                'details': str(exc)
            },
            status=status.HTTP_404_NOT_FOUND
        )
    elif isinstance(exc, InvalidTenantError):
        response = Response(
            {
                'error': True,
                'message': 'Invalid or inactive tenant',
                'details': str(exc)
            },
            status=status.HTTP_403_FORBIDDEN
        )
    elif isinstance(exc, PermissionDeniedError):
        response = Response(
            {
                'error': True,
                'message': 'Permission denied',
                'details': str(exc)
            },
            status=status.HTTP_403_FORBIDDEN
        )

    return response
