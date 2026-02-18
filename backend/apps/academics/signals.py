from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.academics.models import StudentEnrollment, ClassSubject, StudentSubject


@receiver(post_save, sender=StudentEnrollment)
def student_enrollment_post_save(sender, instance, created, **kwargs):
    """
    Signal handler for student enrollment creation/update.
    On new enrollment, auto-assigns all COMPULSORY ClassSubject records
    for the enrolled class to the student via StudentSubject.
    """
    if created and instance.is_active:
        _auto_assign_class_subjects(instance)


def _auto_assign_class_subjects(enrollment):
    """
    Create StudentSubject records for all compulsory subjects
    defined for the class via ClassSubject.
    Safe to call multiple times — uses get_or_create.
    """
    try:
        class_instance = enrollment.section.class_instance
    except Exception:
        return  # section or class not set — skip

    class_subjects = ClassSubject.objects.filter(
        class_instance=class_instance,
        academic_year=enrollment.academic_year,
        is_compulsory=True,
        is_deleted=False,
    ).select_related('subject')

    for cs in class_subjects:
        StudentSubject.objects.get_or_create(
            enrollment=enrollment,
            subject=cs.subject,
        )
