"""
Django Signals for Today View Cache Invalidation
Automatically invalidates cache when relevant data changes
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.assignments.models import Assignment, AssignmentSubmission
from apps.finance.models import Payment, StudentFee
from apps.students.models import StudentNote
from apps.timetable.models import TimetableSubstitution
from apps.attendance.models import StudentAttendance
from apps.examinations.models import ExamSchedule
from apps.mobile_bff.caching.today_view_cache import TodayViewCache


@receiver(post_save, sender=Assignment)
def invalidate_cache_on_assignment_save(sender, instance, created, **kwargs):
    """
    Invalidate cache when assignment is created or updated
    Affects all students in the section
    """
    if instance.status == 'PUBLISHED':
        section_id = str(instance.section_id)
        # Invalidate for due date
        if instance.due_date:
            date = instance.due_date.date().isoformat()
            TodayViewCache.invalidate_by_section(section_id, date)
        # Also invalidate for today (in case it's already listed)
        TodayViewCache.invalidate_by_section(section_id)


@receiver(post_delete, sender=Assignment)
def invalidate_cache_on_assignment_delete(sender, instance, **kwargs):
    """Invalidate cache when assignment is deleted"""
    section_id = str(instance.section_id)
    if instance.due_date:
        date = instance.due_date.date().isoformat()
        TodayViewCache.invalidate_by_section(section_id, date)
    TodayViewCache.invalidate_by_section(section_id)


@receiver(post_save, sender=AssignmentSubmission)
def invalidate_cache_on_submission(sender, instance, **kwargs):
    """
    Invalidate cache when student submits assignment
    Only affects the specific student
    """
    student_id = str(instance.student_id)
    TodayViewCache.invalidate(student_id)
    
    # Also invalidate parent cache
    from apps.students.models import StudentParent
    parents = StudentParent.objects.filter(student_id=student_id).values_list('parent_id', flat=True)
    for parent_id in parents:
        TodayViewCache.invalidate_parent(str(parent_id))


@receiver(post_save, sender=Payment)
def invalidate_cache_on_payment(sender, instance, created, **kwargs):
    """
    Invalidate cache when fee payment is made
    """
    if instance.status in ['COMPLETED', 'VERIFIED']:
        student_id = str(instance.student_id)
        TodayViewCache.invalidate(student_id)
        
        # Invalidate parent cache
        from apps.students.models import StudentParent
        parents = StudentParent.objects.filter(student_id=student_id).values_list('parent_id', flat=True)
        for parent_id in parents:
            TodayViewCache.invalidate_parent(str(parent_id))


@receiver(post_save, sender=StudentFee)
def invalidate_cache_on_fee_update(sender, instance, **kwargs):
    """
    Invalidate cache when student fee is updated
    """
    student_id = str(instance.student_id)
    TodayViewCache.invalidate(student_id)
    
    # Invalidate parent cache
    from apps.students.models import StudentParent
    parents = StudentParent.objects.filter(student_id=student_id).values_list('parent_id', flat=True)
    for parent_id in parents:
        TodayViewCache.invalidate_parent(str(parent_id))


@receiver(post_save, sender=StudentNote)
def invalidate_cache_on_note(sender, instance, created, **kwargs):
    """
    Invalidate cache when teacher adds a note
    """
    if not instance.is_private:  # Only non-private notes appear in today view
        student_id = str(instance.student_id)
        TodayViewCache.invalidate(student_id)
        
        # Invalidate parent cache
        from apps.students.models import StudentParent
        parents = StudentParent.objects.filter(student_id=student_id).values_list('parent_id', flat=True)
        for parent_id in parents:
            TodayViewCache.invalidate_parent(str(parent_id))


@receiver(post_delete, sender=StudentNote)
def invalidate_cache_on_note_delete(sender, instance, **kwargs):
    """Invalidate cache when note is deleted"""
    student_id = str(instance.student_id)
    TodayViewCache.invalidate(student_id)
    
    from apps.students.models import StudentParent
    parents = StudentParent.objects.filter(student_id=student_id).values_list('parent_id', flat=True)
    for parent_id in parents:
        TodayViewCache.invalidate_parent(str(parent_id))


@receiver(post_save, sender=TimetableSubstitution)
def invalidate_cache_on_substitution(sender, instance, **kwargs):
    """
    Invalidate cache when timetable substitution is created/updated
    """
    if instance.status == 'APPROVED' and instance.original_entry:
        section_id = str(instance.original_entry.section_id)
        date = instance.date.isoformat()
        TodayViewCache.invalidate_by_section(section_id, date)


@receiver(post_delete, sender=TimetableSubstitution)
def invalidate_cache_on_substitution_delete(sender, instance, **kwargs):
    """Invalidate cache when substitution is deleted"""
    if instance.original_entry:
        section_id = str(instance.original_entry.section_id)
        date = instance.date.isoformat()
        TodayViewCache.invalidate_by_section(section_id, date)


@receiver(post_save, sender=StudentAttendance)
def invalidate_cache_on_attendance(sender, instance, **kwargs):
    """
    Invalidate cache when attendance is marked
    """
    student_id = str(instance.student_id)
    date = instance.date.isoformat()
    TodayViewCache.invalidate(student_id, date)
    
    # Invalidate parent cache
    from apps.students.models import StudentParent
    parents = StudentParent.objects.filter(student_id=student_id).values_list('parent_id', flat=True)
    for parent_id in parents:
        TodayViewCache.invalidate_parent(str(parent_id), date)


@receiver(post_save, sender=ExamSchedule)
def invalidate_cache_on_exam_schedule(sender, instance, **kwargs):
    """Invalidate cache when exam is scheduled or updated"""
    section_id = str(instance.section_id)
    date = instance.exam_date.isoformat()
    TodayViewCache.invalidate_by_section(section_id, date)
    # Also invalidate for today if it's an upcoming exam notice
    TodayViewCache.invalidate_by_section(section_id)


@receiver(post_delete, sender=ExamSchedule)
def invalidate_cache_on_exam_delete(sender, instance, **kwargs):
    """Invalidate cache when exam is cancelled/deleted"""
    section_id = str(instance.section_id)
    date = instance.exam_date.isoformat()
    TodayViewCache.invalidate_by_section(section_id, date)
    TodayViewCache.invalidate_by_section(section_id)


# Bulk operations handlers
def invalidate_cache_for_section_bulk(section_id, date=None):
    """
    Helper function for bulk invalidation
    Can be called from views after bulk operations
    """
    return TodayViewCache.invalidate_by_section(section_id, date)


def invalidate_cache_for_students_bulk(student_ids, date=None):
    """
    Helper function for bulk student invalidation
    """
    return TodayViewCache.invalidate_multiple_students(student_ids, date)
