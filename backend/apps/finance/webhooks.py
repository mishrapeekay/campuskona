import json
import logging
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .services import RazorpayService
from .models import Payment, StudentFee, PaymentAllocation
from django.db import transaction
from django.utils import timezone

logger = logging.getLogger(__name__)

@csrf_exempt
def razorpay_webhook(request):
    """
    Handle Razorpay webhooks for student fees.
    """
    if request.method != 'POST':
        return HttpResponse(status=405)

    payload = request.body.decode('utf-8')
    signature = request.headers.get('X-Razorpay-Signature')
    
    # Verify webhook signature if secret is configured
    webhook_secret = getattr(settings, 'RAZORPAY_WEBHOOK_SECRET', None)
    if webhook_secret and signature:
        service = RazorpayService()
        try:
            service.client.utility.verify_webhook_signature(payload, signature, webhook_secret)
        except Exception as e:
            logger.error(f"Razorpay webhook signature verification failed: {str(e)}")
            return HttpResponse(status=400)

    try:
        data = json.loads(payload)
        event = data.get('event')
        
        if event == 'payment.captured':
            handle_payment_captured(data['payload']['payment']['entity'])
        elif event == 'payment.failed':
            handle_payment_failed(data['payload']['payment']['entity'])
            
        return HttpResponse(status=200)
    except Exception as e:
        logger.error(f"Error processing Razorpay webhook: {str(e)}")
        return HttpResponse(status=500)

def handle_payment_captured(payment_entity):
    """
    Handle payment.captured event.
    """
    payment_id = payment_entity['id']
    order_id = payment_entity['order_id']
    amount = payment_entity['amount'] / 100  # Convert to standard currency units
    
    notes = payment_entity.get('notes', {})
    fee_type = notes.get('type')
    
    if fee_type == 'student_fee':
        fee_ids = notes.get('fee_ids', '').split(',')
        fee_ids = [int(fid) for fid in fee_ids if fid.strip()]
        
        with transaction.atomic():
            # Idempotency check
            if Payment.objects.filter(transaction_id=payment_id).exists():
                return

            fees = StudentFee.objects.filter(id__in=fee_ids)
            if not fees.exists():
                logger.error(f"Fees not found for Razorpay payment {payment_id}")
                return
                
            student = fees.first().student
            
            # Generate receipt number
            last_payment = Payment.objects.order_by('-id').first()
            receipt_number = f"RCP{(last_payment.id + 1) if last_payment else 1:06d}"
            
            payment = Payment.objects.create(
                student=student,
                receipt_number=receipt_number,
                amount=amount,
                payment_method='ONLINE',
                transaction_id=payment_id,
                status='COMPLETED',
                remarks=f"Razorpay Webhook: {order_id}"
            )
            
            remaining_amount = amount
            for fee in fees:
                if remaining_amount <= 0:
                    break
                alloc_amount = min(fee.balance_amount, remaining_amount)
                if alloc_amount > 0:
                    PaymentAllocation.objects.create(
                        payment=payment,
                        student_fee=fee,
                        allocated_amount=alloc_amount
                    )
                    remaining_amount -= alloc_amount

def handle_payment_failed(payment_entity):
    """
    Handle payment.failed event.
    """
    payment_id = payment_entity['id']
    order_id = payment_entity['order_id']
    logger.warning(f"Razorpay payment failed: {payment_id} for order {order_id}")
    # Optional: Log to a PaymentFailure model or notify user
