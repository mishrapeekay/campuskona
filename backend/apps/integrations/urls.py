from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IntegrationViewSet, 
    IntegrationCredentialViewSet, 
    WebhookEventViewSet, 
    WebhookSubscriptionViewSet, 
    WebhookDeliveryViewSet
)

router = DefaultRouter()
router.register(r'marketplace', IntegrationViewSet, basename='integration')
router.register(r'credentials', IntegrationCredentialViewSet, basename='integration-credential')
router.register(r'events', WebhookEventViewSet, basename='webhook-event')
router.register(r'subscriptions', WebhookSubscriptionViewSet, basename='webhook-subscription')
router.register(r'activities', WebhookDeliveryViewSet, basename='webhook-delivery')

urlpatterns = [
    path('', include(router.urls)),
]
