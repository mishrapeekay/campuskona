from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoticeViewSet, EventViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'notices', NoticeViewSet, basename='notice')
router.register(r'events', EventViewSet, basename='event')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
