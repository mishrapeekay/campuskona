from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Integration, IntegrationCredential, WebhookEvent, WebhookSubscription, WebhookDelivery
from .serializers import (
    IntegrationSerializer, 
    IntegrationCredentialSerializer, 
    WebhookEventSerializer, 
    WebhookSubscriptionSerializer, 
    WebhookDeliverySerializer
)
from .permissions import IsSchoolAdmin
from .services import WebhookService

class IntegrationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List available integrations (Marketplace).
    """
    queryset = Integration.objects.all()
    serializer_class = IntegrationSerializer
    permission_classes = [IsSchoolAdmin]
    
    def get_queryset(self):
        return Integration.objects.filter(is_active=True)

class IntegrationCredentialViewSet(viewsets.ModelViewSet):
    """
    Manage tenant credentials for integrations.
    """
    queryset = IntegrationCredential.objects.all()
    serializer_class = IntegrationCredentialSerializer
    permission_classes = [IsSchoolAdmin]

class WebhookEventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    List available webhook events.
    """
    queryset = WebhookEvent.objects.all()
    serializer_class = WebhookEventSerializer
    permission_classes = [IsSchoolAdmin]

class WebhookSubscriptionViewSet(viewsets.ModelViewSet):
    """
    Manage webhook subscriptions.
    """
    queryset = WebhookSubscription.objects.all()
    serializer_class = WebhookSubscriptionSerializer 
    permission_classes = [IsSchoolAdmin]
    
    @action(detail=True, methods=['post'])
    def test(self, request, pk=None):
        """
        Trigger a test delivery for this subscription.
        """
        subscription = self.get_object()
        
        payload = {
            'event_type': 'ping',
            'msg': 'This is a test webhook from School Management System',
            'timestamp': str(timezone.now())
        }
        
        # Create ad-hoc delivery record without needing a matching event type in registry
        delivery = WebhookDelivery.objects.create(
            subscription=subscription,
            payload=payload,
            status='PENDING'
        )
        
        # Trigger immediate send
        success = WebhookService.send_webhook(delivery.id)
        
        # Reload to get response info
        delivery.refresh_from_db()
        
        return Response({
            'success': success,
            'delivery_id': delivery.id,
            'response_status': delivery.response_status,
            'response_body': delivery.response_body
        })

class WebhookDeliveryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    View delivery logs.
    """
    queryset = WebhookDelivery.objects.all()
    serializer_class = WebhookDeliverySerializer
    permission_classes = [IsSchoolAdmin]
