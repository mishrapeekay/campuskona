from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportTemplateViewSet, GeneratedReportViewSet,
    ReportScheduleViewSet, SavedReportViewSet,
)

router = DefaultRouter()
router.register(r'templates', ReportTemplateViewSet, basename='report-template')
router.register(r'generated', GeneratedReportViewSet, basename='generated-report')
router.register(r'schedules', ReportScheduleViewSet, basename='report-schedule')
router.register(r'saved', SavedReportViewSet, basename='saved-report')

urlpatterns = [
    path('', include(router.urls)),
]
