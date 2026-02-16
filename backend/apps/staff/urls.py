from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.staff import views

router = DefaultRouter()
router.register(r'members', views.StaffMemberViewSet, basename='staff-member')
router.register(r'documents', views.StaffDocumentViewSet, basename='staff-document')
# NOTE: attendance and leaves routes moved to apps.attendance.urls
router.register(r'qualifications', views.StaffQualificationViewSet, basename='staff-qualification')
router.register(r'experiences', views.StaffExperienceViewSet, basename='staff-experience')

urlpatterns = [
    path('', include(router.urls)),
]
