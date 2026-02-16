from django.db.models.signals import post_save
from django.dispatch import receiver
from .services import WebhookService
import logging

logger = logging.getLogger(__name__)

def safe_trigger(event_type, payload):
    try:
        WebhookService.trigger_event(event_type, payload)
    except Exception as e:
        logger.error(f"Failed to trigger webhook {event_type}: {e}")

@receiver(post_save, sender='students.Student')
def student_created_handler(sender, instance, created, **kwargs):
    if created:
        payload = {
            'event': 'student.created',
            'student_id': str(instance.id),
            'admission_number': instance.admission_number,
            'name': instance.get_full_name(),
            'timestamp': str(instance.created_at)
        }
        safe_trigger('student.created', payload)

@receiver(post_save, sender='finance.Payment')
def fee_paid_handler(sender, instance, created, **kwargs):
    if instance.status == 'COMPLETED':
        # Check if status just changed? 
        # For simplicity, trigger if status is COMPLETED. 
        # Real-world: Check previous status or use a separate signal for status change.
        payload = {
            'event': 'fee.paid',
            'payment_id': str(instance.id),
            'student_id': str(instance.student_id),
            'amount': str(instance.amount),
            'receipt_number': instance.receipt_number,
            'timestamp': str(instance.payment_date)
        }
        safe_trigger('fee.paid', payload)

@receiver(post_save, sender='attendance.StudentAttendance')
def attendance_marked_handler(sender, instance, created, **kwargs):
    if created:
        payload = {
            'event': 'attendance.marked',
            'student_id': str(instance.student_id),
            'date': str(instance.date),
            'status': instance.status,
            'timestamp': str(instance.marked_at)
        }
        safe_trigger('attendance.marked', payload)

@receiver(post_save, sender='examinations.ExamResult')
def result_published_handler(sender, instance, created, **kwargs):
    # Trigger when examination is published?
    # Or when ExamResult is saved?
    # ExamResult is usually calculated.
    # We might want to trigger when the EXAMINATION is published.
    pass

@receiver(post_save, sender='examinations.Examination')
def exam_published_handler(sender, instance, created, **kwargs):
    if instance.is_published: # Assuming we track 'is_published' transition
        # This is a bulk event. Might be too heavy to send per student here.
        # Ideally, we send one event "exam.published"
        payload = {
            'event': 'exam.published',
            'exam_id': str(instance.id),
            'name': instance.name,
            'result_date': str(instance.result_date)
        }
        safe_trigger('exam.result.published', payload)
