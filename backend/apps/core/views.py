from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.http import JsonResponse
from django.conf import settings
from django.db import connection
from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.authentication.permissions import IsSuperAdmin
from apps.core.services.exceptions import ExceptionService

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Viewset for viewing audit logs.
    """
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter logs based on user permissions and query params.
        """
        user = self.request.user
        queryset = AuditLog.objects.all().order_by('-timestamp')

        # If not super admin, only show logs for their own school
        if not user.is_superuser and user.user_type != 'SUPER_ADMIN':
            school = getattr(self.request, 'tenant', None)
            if school:
                queryset = queryset.filter(school=school)
            else:
                return AuditLog.objects.none()

        # Filter by school if provided (for Super Admin)
        school_id = self.request.query_params.get('school_id')
        if school_id and (user.is_superuser or user.user_type == 'SUPER_ADMIN'):
            queryset = queryset.filter(school_id=school_id)

        # Filter by model_name
        model_name = self.request.query_params.get('model_name')
        if model_name:
            queryset = queryset.filter(model_name__iexact=model_name)

        # Filter by action
        action = self.request.query_params.get('action')
        if action:
            queryset = queryset.filter(action=action.upper())

        return queryset


def health_check(request):
    """
    Health check endpoint for monitoring.
    """
    health_status = {
        'status': 'healthy',
        'database': 'disconnected',
    }

    try:
        # Check database connection
        connection.ensure_connection()
        health_status['database'] = 'connected'
    except Exception as e:
        health_status['status'] = 'unhealthy'
        health_status['database_error'] = str(e)

    status_code = 200 if health_status['status'] == 'healthy' else 503

    return JsonResponse(health_status, status=status_code)


def welcome(request):
    """
    Welcome endpoint - shows API is running.
    """
    return JsonResponse({
        'message': 'Welcome to School Management System API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'admin': '/admin/',
            'api_docs': '/api/docs/',
            'api_schema': '/api/schema/',
            'health': '/health/',
            'audit_logs': '/api/v1/core/audit-logs/',
            'authentication': '/api/v1/auth/',
            'students': '/api/v1/students/',
            'staff': '/api/v1/staff/',
            'academics': '/api/v1/academics/',
            'admin_exceptions': '/api/v1/core/admin/exceptions/',
        },
        'documentation': 'Visit /api/docs/ for interactive API documentation'
    })


class ExceptionDashboardView(APIView):
    """
    Endpoint for Admin Dashboard Exceptions.
    Returns categorized actionable items (exceptions) for the admin to address.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        service = ExceptionService()
        
        # Pass filters if needed (e.g. date range)
        filters = {}
        if request.query_params.get('date'):
            filters['date'] = request.query_params.get('date')
            
        try:
            exceptions = service.get_dashboard_exceptions(**filters)
            return Response(exceptions, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "Failed to fetch exceptions", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
