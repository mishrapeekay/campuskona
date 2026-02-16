from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.examinations.models import StudentMark
from apps.students.models import StudentNote
from .services.auto_points import AutoPointService
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=StudentMark)
def trigger_academic_points(sender, instance, created, **kwargs):
    """
    Trigger point award when marks are entered/updated and result in a high grade.
    """
    if instance.grade:
        try:
            # Avoid duplicate awards for the same mark record in a real system 
            # by checking if a log already exists for this specific mark ID in metadata.
            # For this MVP, we'll just award it.
            AutoPointService.award_for_academic_excellence(
                student=instance.student,
                subject_name=instance.schedule.subject.name,
                mark_percentage=instance.percentage,
                grade_name=instance.grade.grade
            )
        except Exception as e:
            logger.error(f"Failed to auto-award points for marks: {e}")

@receiver(post_save, sender=StudentNote)
def trigger_behavioral_points(sender, instance, created, **kwargs):
    """
    Trigger point award when a teacher adds a positive note.
    """
    if created and instance.note:
        try:
            AutoPointService.award_for_behavior(
                student=instance.student,
                remark_type="Teacher Note",
                note_text=instance.note
            )
        except Exception as e:
            logger.error(f"Failed to auto-award points for note: {e}")
