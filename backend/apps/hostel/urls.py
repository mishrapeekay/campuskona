from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HostelViewSet, RoomViewSet, RoomAllocationViewSet,
    HostelAttendanceViewSet, MessMenuViewSet,
    HostelComplaintViewSet, HostelVisitorViewSet,
)

router = DefaultRouter()
router.register(r'hostels', HostelViewSet, basename='hostel')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'allocations', RoomAllocationViewSet, basename='allocation')
router.register(r'attendance', HostelAttendanceViewSet, basename='hostel-attendance')
router.register(r'mess-menu', MessMenuViewSet, basename='mess-menu')
router.register(r'complaints', HostelComplaintViewSet, basename='complaint')
router.register(r'visitors', HostelVisitorViewSet, basename='visitor')

urlpatterns = [
    path('', include(router.urls)),
]
