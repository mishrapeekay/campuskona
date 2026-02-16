from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from apps.staff.models import StaffMember, StaffDocument


@receiver(post_save, sender=StaffMember)
def staff_member_post_save(sender, instance, created, **kwargs):
    """
    Signal handler for staff member creation/update
    """
    if created:
        # Send welcome email to staff member
        # TODO: Implement email sending via Celery task
        pass


@receiver(pre_delete, sender=StaffDocument)
def staff_document_pre_delete(sender, instance, **kwargs):
    """
    Delete document file when StaffDocument is deleted
    """
    if instance.document_file:
        instance.document_file.delete(save=False)
