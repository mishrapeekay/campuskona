"""
URL routing for Timetable app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TimeSlotViewSet,
    ClassTimetableViewSet,
    TeacherTimetableViewSet,
    TimetableSubstitutionViewSet,
    RoomAllocationViewSet,
    TimetableTemplateViewSet,
    SubjectPeriodRequirementViewSet,
    TeacherAvailabilityViewSet,
    TimetableGenerationConfigViewSet,
    TimetableGenerationRunViewSet,
)

app_name = 'timetable'

# Create router
router = DefaultRouter()

# Register viewsets — existing
router.register(r'time-slots', TimeSlotViewSet, basename='time-slot')
router.register(r'class-timetable', ClassTimetableViewSet, basename='class-timetable')
router.register(r'teacher-timetable', TeacherTimetableViewSet, basename='teacher-timetable')
router.register(r'substitutions', TimetableSubstitutionViewSet, basename='substitution')
router.register(r'rooms', RoomAllocationViewSet, basename='room')
router.register(r'templates', TimetableTemplateViewSet, basename='template')

# Register viewsets — AI generation
router.register(r'subject-requirements', SubjectPeriodRequirementViewSet, basename='subject-requirement')
router.register(r'teacher-availability', TeacherAvailabilityViewSet, basename='teacher-availability')
router.register(r'generation-configs', TimetableGenerationConfigViewSet, basename='generation-config')
router.register(r'generation-runs', TimetableGenerationRunViewSet, basename='generation-run')

urlpatterns = [
    path('', include(router.urls)),
]
