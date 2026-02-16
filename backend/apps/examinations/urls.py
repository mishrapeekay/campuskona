"""
URL routing for Examinations app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GradeScaleViewSet,
    GradeViewSet,
    ExamTypeViewSet,
    ExaminationViewSet,
    ExamScheduleViewSet,
    StudentMarkViewSet,
    ExamResultViewSet,
    ReportCardViewSet,
    ReportCardTemplateViewSet,
    ExamHallViewSet,
    ExamScheduleConfigViewSet,
    ExamScheduleRunViewSet,
)

app_name = 'examinations'

# Create router
router = DefaultRouter()

# Register viewsets
router.register(r'grade-scales', GradeScaleViewSet, basename='grade-scale')
router.register(r'grades', GradeViewSet, basename='grade')
router.register(r'exam-types', ExamTypeViewSet, basename='exam-type')
router.register(r'exams', ExaminationViewSet, basename='examination')
router.register(r'schedules', ExamScheduleViewSet, basename='schedule')
router.register(r'marks', StudentMarkViewSet, basename='mark')
router.register(r'results', ExamResultViewSet, basename='result')
router.register(r'report-cards', ReportCardViewSet, basename='report-card')
router.register(r'report-card-templates', ReportCardTemplateViewSet, basename='report-card-template')

# AI Exam Scheduler (ENTERPRISE)
router.register(r'exam-halls', ExamHallViewSet, basename='exam-hall')
router.register(r'exam-schedule-configs', ExamScheduleConfigViewSet, basename='exam-schedule-config')
router.register(r'exam-schedule-runs', ExamScheduleRunViewSet, basename='exam-schedule-run')

urlpatterns = [
    path('', include(router.urls)),
]
