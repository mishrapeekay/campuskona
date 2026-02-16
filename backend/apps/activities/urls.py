from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClubViewSet, 
    ClubMembershipViewSet, 
    ClubActivityViewSet, 
    ActivityAttendanceViewSet
)

router = DefaultRouter()
router.register(r'clubs', ClubViewSet)
router.register(r'memberships', ClubMembershipViewSet)
router.register(r'activities', ClubActivityViewSet)
router.register(r'attendance', ActivityAttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
