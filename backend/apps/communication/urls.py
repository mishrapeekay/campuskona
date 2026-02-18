from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoticeViewSet, EventViewSet, NotificationViewSet, FCMTokenView, SendWhatsAppView

router = DefaultRouter()
router.register(r'notices', NoticeViewSet, basename='notice')
router.register(r'events', EventViewSet, basename='event')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    # Workstream F: FCM Token registration
    path('fcm-token/', FCMTokenView.as_view(), name='fcm-token'),
    # Workstream B: WhatsApp send
    path('send-whatsapp/', SendWhatsAppView.as_view(), name='send-whatsapp'),
]
