from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from apps.students.models import Student, StudentDocument
from apps.core.models import AuditLog


@receiver(post_save, sender=Student)
def student_post_save(sender, instance, created, **kwargs):
    """
    Signal handler for student creation/update
    """
    if created:
        # Send welcome email to student
        # TODO: Implement email sending via Celery task
        pass


@receiver(pre_delete, sender=StudentDocument)
def student_document_pre_delete(sender, instance, **kwargs):
    """
    Delete document file when StudentDocument is deleted
    """
    if instance.document_file:
        instance.document_file.delete(save=False)
