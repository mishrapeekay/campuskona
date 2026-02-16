from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GovernmentReportsViewSet, RTEComplianceViewSet

router = DefaultRouter()
router.register(r'generated-reports', GovernmentReportsViewSet, basename='government-reports')
router.register(r'rte-compliance', RTEComplianceViewSet, basename='rte-compliance')

urlpatterns = [
    path('', include(router.urls)),
]
