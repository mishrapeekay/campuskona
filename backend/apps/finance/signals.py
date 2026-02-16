from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from .models import StudentFee, Payment
from apps.fee_ledger.services import FeeLedgerService

@receiver(post_save, sender=StudentFee)
def record_fee_demand_in_ledger(sender, instance, created, **kwargs):
    """
    When a student fee is created, record it as a DEBIT in the transparent ledger.
    """
    if created:
        transaction.on_commit(lambda: FeeLedgerService.record_fee_due(
            student=instance.student,
            amount=instance.amount,
            reference_id=f"FEE_INV_{instance.id}",
            description=f"Fee Demand for {instance.fee_structure.fee_category.name}",
            # If taxes are implemented in StudentFee later, they can be pulled from here
        ))

@receiver(post_save, sender=Payment)
def record_payment_in_ledger(sender, instance, created, **kwargs):
    """
    When a payment is marked as COMPLETED, record it as a CREDIT in the transparent ledger.
    """
    # Track status changes if needed, but for now we look at NEW completed payments
    # or existing payments that just became COMPLETED.
    if instance.status == 'COMPLETED':
        # We use a simple check to avoid duplicate ledger entries if status is updated multiple times
        from apps.fee_ledger.models import FeeLedgerEntry
        exists = FeeLedgerEntry.objects.filter(
            reference_id=instance.receipt_number,
            entry_type='PAYMENT'
        ).exists()
        
        if not exists:
            transaction.on_commit(lambda: FeeLedgerService.record_payment(
                student=instance.student,
                amount=instance.amount,
                reference_id=instance.receipt_number,
                description=f"Payment received via {instance.payment_method}. Transaction ID: {instance.transaction_id}",
                tds_deducted=0 # Pull from payment model if implemented
            ))
