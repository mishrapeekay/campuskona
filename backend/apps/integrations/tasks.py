from celery import shared_task
from .services import WebhookService
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

@shared_task
def process_webhook_delivery(delivery_id):
    """
    Process a single webhook delivery attempt.
    """
    try:
        logger.info(f"Processing webhook delivery {delivery_id}")
        # Import inside task to avoid circular dependency if service imports task
        from .services import WebhookService 
        success = WebhookService.send_webhook(delivery_id)
        return success
    except Exception as e:
        logger.error(f"Error processing webhook {delivery_id}: {e}")
        return False

@shared_task
def retry_failed_webhooks():
    """
    Periodic task to retry pending/failed webhooks that are due.
    """
    from .models import WebhookDelivery
    
    now = timezone.now()
    # Find failed deliveries that are due for retry
    due_deliveries = WebhookDelivery.objects.filter(
        status='FAILED', 
        next_retry_at__lte=now,
        attempt_count__lt=5
    )[:100] # Limit batch size
    
    count = 0
    for delivery in due_deliveries:
        process_webhook_delivery.delay(delivery.id)
        count += 1
        
    return f"Triggered retry for {count} webhooks"
