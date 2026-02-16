from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import health_check, AuditLogViewSet, ExceptionDashboardView

app_name = 'core'

router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('exceptions/dashboard/', ExceptionDashboardView.as_view(), name='exception-dashboard'),
    path('', include(router.urls)),
]
