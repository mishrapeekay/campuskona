from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.academics.models import StudentEnrollment


@receiver(post_save, sender=StudentEnrollment)
def student_enrollment_post_save(sender, instance, created, **kwargs):
    """
    Signal handler for student enrollment creation/update
    """
    if created:
        # Send enrollment confirmation to student/parent
        # TODO: Implement notification via Celery task
        pass
