import razorpay
from django.conf import settings
from .models import Payment, StudentFee, PaymentAllocation
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class RazorpayService:
    def __init__(self):
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    def create_order(self, amount, currency='INR', receipt=None, notes=None):
        """
        Create a Razorpay order.
        Amount should be in Paisa (e.g., 100 INR = 10000 Paisa)
        """
        data = {
            'amount': int(amount * 100),
            'currency': currency,
            'receipt': receipt,
            'notes': notes or {}
        }
        try:
            order = self.client.order.create(data=data)
            return order
        except Exception as e:
            logger.error(f"Error creating Razorpay order: {str(e)}")
            raise

    def verify_payment(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        """
        Verify Razorpay payment signature.
        """
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            self.client.utility.verify_payment_signature(params_dict)
            return True
        except Exception as e:
            logger.error(f"Razorpay signature verification failed: {str(e)}")
            return False

    def capture_payment(self, payment_id, amount):
        """
        Capture a payment if not auto-captured.
        """
        try:
            self.client.payment.capture(payment_id, int(amount * 100))
            return True
        except Exception as e:
            logger.error(f"Error capturing Razorpay payment: {str(e)}")
            return False
