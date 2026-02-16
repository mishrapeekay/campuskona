from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.students import views
from apps.students.parent_views import (
    ParentDashboardView,
    ParentChildAttendanceView,
    ParentChildResultsView,
    ParentChildFeesView,
    ParentChildTimetableView,
)

router = DefaultRouter()
router.register(r'students', views.StudentViewSet, basename='student')
router.register(r'documents', views.StudentDocumentViewSet, basename='student-document')
router.register(r'parents', views.StudentParentViewSet, basename='student-parent')
router.register(r'health-records', views.StudentHealthRecordViewSet, basename='student-health-record')
router.register(r'notes', views.StudentNoteViewSet, basename='student-note')

urlpatterns = [
    # Parent Portal endpoints
    path('parent-portal/dashboard/', ParentDashboardView.as_view(), name='parent-dashboard'),
    path('parent-portal/attendance/', ParentChildAttendanceView.as_view(), name='parent-attendance'),
    path('parent-portal/results/', ParentChildResultsView.as_view(), name='parent-results'),
    path('parent-portal/fees/', ParentChildFeesView.as_view(), name='parent-fees'),
    path('parent-portal/timetable/', ParentChildTimetableView.as_view(), name='parent-timetable'),

    path('', include(router.urls)),
]
