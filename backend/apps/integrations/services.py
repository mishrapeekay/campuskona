import hmac
import hashlib
import json
import logging
import requests
from django.utils import timezone
from .models import WebhookSubscription, WebhookDelivery, WebhookEvent

logger = logging.getLogger(__name__)

class WebhookService:
    @staticmethod
    def sign_payload(payload: dict, secret: str) -> str:
        """
        Sign the payload using HMAC-SHA256.
        """
        # Ensure consistent ordering and separators provided default separators are used
        payload_str = json.dumps(payload, sort_keys=True, separators=(',', ':'))
        signature = hmac.new(
            secret.encode('utf-8'),
            payload_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        return signature

    @staticmethod
    def trigger_event(event_type: str, payload: dict):
        """
        Trigger a webhook event for the current tenant.
        Finds all active subscriptions for this event_type.
        Creates WebhookDelivery records.
        Returns list of created delivery IDs.
        """
        logger.info(f"Triggering event {event_type}")
        
        # Ensure event exists (optional, could just query subscriptions directly)
        try:
            event = WebhookEvent.objects.get(event_type=event_type)
        except WebhookEvent.DoesNotExist:
            logger.warning(f"Event type {event_type} not found in registry")
            return []

        subscriptions = WebhookSubscription.objects.filter(
            event__event_type=event_type, # Use valid field lookup
            is_active=True
        )
        
        delivery_ids = []
        for sub in subscriptions:
            delivery = WebhookDelivery.objects.create(
                subscription=sub,
                payload=payload,
                status='PENDING',
                next_retry_at=timezone.now() # Ready immediately
            )
            delivery_ids.append(delivery.id)
            
            # TODO: Fire Celery task
            # from .tasks import deliver_webhook
            # deliver_webhook.delay(delivery.id)
            
        logger.info(f"Created {len(delivery_ids)} webhook deliveries for {event_type}")
        return delivery_ids

    @staticmethod
    def send_webhook(delivery_id):
        """
        Actual delivery logic.
        """
        try:
            delivery = WebhookDelivery.objects.get(id=delivery_id)
        except WebhookDelivery.DoesNotExist:
            logger.error(f"WebhookDelivery {delivery_id} not found")
            return False

        # If manually decrypted secret is needed
        # secret = delivery.subscription.secret_key 
        # EncryptedCharField automatically handles decryption on access usually, 
        # but if it returns encrypted object, we might need .decrypt() or similar depending on implementation.
        # Assuming transparent access for now based on typical django-encrypted-model usage.
        
        secret = str(delivery.subscription.secret_key) 
        
        signature = WebhookService.sign_payload(delivery.payload, secret)
        headers = {
            'Content-Type': 'application/json',
            'X-Hub-Signature-256': f'sha256={signature}',
            'X-Event-Type': delivery.subscription.event.event_type,
            'User-Agent': 'SchoolMgmt-Webhook-Bot/1.0',
        }
        if delivery.subscription.headers:
            headers.update(delivery.subscription.headers)

        success = False
        try:
            response = requests.post(
                delivery.subscription.target_url,
                json=delivery.payload,
                headers=headers,
                timeout=10
            )
            delivery.response_status = response.status_code
            delivery.response_body = response.text[:5000] # truncate
            
            if 200 <= response.status_code < 300:
                delivery.status = 'SUCCESS'
                success = True
            else:
                delivery.status = 'FAILED'
                
        except Exception as e:
            delivery.status = 'FAILED'
            delivery.response_body = str(e)
            logger.error(f"Webhook delivery failed: {e}")
        
        delivery.attempt_count += 1
        
        # Retry logic
        if not success and delivery.attempt_count < 5:
             # Exponential backoff: 1min, 4min, 9min, 16min
             backoff_minutes = delivery.attempt_count ** 2
             delivery.next_retry_at = timezone.now() + timezone.timedelta(minutes=backoff_minutes)
        elif success:
             delivery.next_retry_at = None
        else:
             # Max retries reached
             delivery.next_retry_at = None
             
        delivery.save()
        return success
