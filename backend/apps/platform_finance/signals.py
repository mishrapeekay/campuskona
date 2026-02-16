"""
Platform Finance Signals
========================
Signal handlers for automatic ledger entries
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.tenants.models import Subscription
from apps.partners.models import Commission, Payout
from .tasks import sync_subscription_to_ledger, sync_commission_to_ledger


@receiver(post_save, sender=Subscription)
def subscription_created_handler(sender, instance, created, **kwargs):
    """
    When a subscription is created or renewed, record it in the financial ledger
    """
    if created or instance.status == 'ACTIVE':
        # Trigger async task to record in ledger
        sync_subscription_to_ledger.delay(str(instance.id))


@receiver(post_save, sender=Commission)
def commission_paid_handler(sender, instance, created, **kwargs):
    """
    When a commission is marked as paid, record it in the financial ledger
    """
    if instance.status == 'PAID' and not created:
        # Trigger async task to record in ledger
        sync_commission_to_ledger.delay(str(instance.id))


@receiver(post_save, sender=Payout)
def payout_completed_handler(sender, instance, created, **kwargs):
    """
    When a payout is completed, record all commissions in the financial ledger
    """
    if instance.status == 'COMPLETED' and not created:
        # Record each commission in the payout
        for commission in instance.commissions.all():
            sync_commission_to_ledger.delay(str(commission.id))
