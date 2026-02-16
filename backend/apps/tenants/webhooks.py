import json
import logging
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from apps.finance.services import RazorpayService
from .services import process_subscription_payment

logger = logging.getLogger(__name__)

@csrf_exempt
def subscription_webhook(request):
    """
    Handle Razorpay webhooks for school subscriptions.
    Note: Subscriptions for schools happen in the public schema context.
    """
    if request.method != 'POST':
        return HttpResponse(status=405)

    payload = request.body.decode('utf-8')
    signature = request.headers.get('X-Razorpay-Signature')
    
    webhook_secret = getattr(settings, 'RAZORPAY_SUBSCRIPTION_WEBHOOK_SECRET', None)
    if webhook_secret and signature:
        service = RazorpayService()
        try:
            service.client.utility.verify_webhook_signature(payload, signature, webhook_secret)
        except Exception as e:
            logger.error(f"Razorpay subscription webhook signature verification failed: {str(e)}")
            return HttpResponse(status=400)

    try:
        data = json.loads(payload)
        event = data.get('event')
        
        if event == 'payment.captured':
            payment_entity = data['payload']['payment']['entity']
            notes = payment_entity.get('notes', {})
            
            if notes.get('type') == 'school_subscription':
                school_id = notes.get('school_id')
                amount = payment_entity['amount'] / 100
                transaction_id = payment_entity['id']
                period_months = int(notes.get('period_months', 1))
                
                process_subscription_payment(
                    school_id=school_id,
                    amount=amount,
                    transaction_id=transaction_id,
                    period_months=period_months
                )
            
        return HttpResponse(status=200)
    except Exception as e:
        logger.error(f"Error processing Razorpay subscription webhook: {str(e)}")
        return HttpResponse(status=500)
