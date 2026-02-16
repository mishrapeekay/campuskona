"""
URL routing for Attendance app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AttendancePeriodViewSet,
    StudentAttendanceViewSet,
    StaffAttendanceViewSet,
    StudentLeaveViewSet,
    StaffLeaveViewSet,
    HolidayViewSet,
    AttendanceSummaryViewSet
)

app_name = 'attendance'

# Create router
router = DefaultRouter()

# Register viewsets
router.register(r'periods', AttendancePeriodViewSet, basename='period')
router.register(r'student-attendance', StudentAttendanceViewSet, basename='student-attendance')
router.register(r'staff-attendance', StaffAttendanceViewSet, basename='staff-attendance')
router.register(r'student-leaves', StudentLeaveViewSet, basename='student-leave')
router.register(r'staff-leaves', StaffLeaveViewSet, basename='staff-leave')
router.register(r'holidays', HolidayViewSet, basename='holiday')
router.register(r'summaries', AttendanceSummaryViewSet, basename='summary')

urlpatterns = [
    path('', include(router.urls)),
]
