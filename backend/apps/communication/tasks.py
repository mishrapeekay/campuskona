"""
Celery tasks for Communication app.

Handles async email sending, scheduled notifications, and bulk operations.

Usage:
    from apps.communication.tasks import send_email_task

    # Queue an email
    send_email_task.delay('user@example.com', 'Subject', 'Message')
"""

from celery import shared_task
from django.contrib.auth import get_user_model
from typing import List, Dict
import logging

from apps.communication.email_service import EmailService
from apps.communication.models import Notification, Notice

User = get_user_model()
logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_email_task(self, to_email: str, subject: str, message: str, html_message: str = None):
    """
    Send email asynchronously.

    Args:
        to_email: Recipient email
        subject: Email subject
        message: Plain text message
        html_message: HTML message (optional)

    Returns:
        bool: Success status

    Example:
        send_email_task.delay('user@example.com', 'Test', 'Hello')
    """
    try:
        return EmailService.send_email(to_email, subject, message, html_message)
    except Exception as exc:
        logger.error(f"Failed to send email: {str(exc)}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task
def send_bulk_email_task(recipients: List[str], subject: str, message: str, html_message: str = None):
    """
    Send bulk email asynchronously.

    Args:
        recipients: List of email addresses
        subject: Email subject
        message: Plain text message
        html_message: HTML message (optional)

    Returns:
        int: Number of emails sent
    """
    try:
        return EmailService.send_bulk_email(recipients, subject, message, html_message)
    except Exception as exc:
        logger.error(f"Failed to send bulk emails: {str(exc)}")
        return 0


@shared_task
def send_welcome_emails(user_ids: List[int]):
    """
    Send welcome emails to multiple users.

    Args:
        user_ids: List of user IDs

    Returns:
        int: Number of emails sent
    """
    success_count = 0

    for user_id in user_ids:
        try:
            user = User.objects.get(id=user_id)
            if EmailService.send_welcome_email(user):
                success_count += 1
        except User.DoesNotExist:
            logger.warning(f"User {user_id} not found")
        except Exception as e:
            logger.error(f"Failed to send welcome email to user {user_id}: {str(e)}")

    logger.info(f"Sent {success_count} welcome emails out of {len(user_ids)}")
    return success_count


@shared_task
def send_fee_reminders_task():
    """
    Send fee payment reminders to students with pending payments.

    This task should be scheduled to run daily or weekly.

    Returns:
        int: Number of reminders sent
    """
    from apps.students.models import Student
    from apps.finance.models import FeePayment

    try:
        # Get students with pending fees
        # This is a placeholder - adjust based on your actual models
        students_with_pending_fees = Student.objects.filter(
            # fee_payments__status='PENDING'  # Adjust this query
        ).distinct()

        success_count = 0

        for student in students_with_pending_fees:
            try:
                # Get pending fee details
                fee_details = {
                    'fees': [],  # Populate with actual fee data
                    'total_amount': 0
                }

                if EmailService.send_fee_payment_reminder(student, fee_details):
                    success_count += 1

            except Exception as e:
                logger.error(f"Failed to send fee reminder to {student.id}: {str(e)}")

        logger.info(f"Sent {success_count} fee reminders")
        return success_count

    except Exception as e:
        logger.error(f"Failed to send fee reminders: {str(e)}")
        return 0


@shared_task
def send_exam_reminders_task(days_before: int = 3):
    """
    Send exam reminders to students.

    Args:
        days_before: Number of days before exam to send reminder

    Returns:
        int: Number of reminders sent
    """
    from apps.examinations.models import Exam
    from apps.students.models import Student
    from django.utils import timezone
    from datetime import timedelta

    try:
        # Get exams happening in next N days
        start_date = timezone.now().date()
        end_date = start_date + timedelta(days=days_before)

        upcoming_exams = Exam.objects.filter(
            exam_date__gte=start_date,
            exam_date__lte=end_date
        ).select_related('subject', 'class_section')

        success_count = 0

        for exam in upcoming_exams:
            try:
                # Get students for this exam's class
                students = Student.objects.filter(
                    # current_class=exam.class_section  # Adjust based on your model
                )

                for student in students:
                    exam_details = {
                        'exam_name': f"{exam.subject.name} Exam",
                        'exam_date': exam.exam_date,
                        'exam_time': exam.start_time,
                        'duration': exam.duration,
                    }

                    if EmailService.send_exam_reminder(student, exam_details):
                        success_count += 1

            except Exception as e:
                logger.error(f"Failed to send exam reminders for {exam.id}: {str(e)}")

        logger.info(f"Sent {success_count} exam reminders")
        return success_count

    except Exception as e:
        logger.error(f"Failed to send exam reminders: {str(e)}")
        return 0


@shared_task
def send_attendance_alerts_task(threshold: float = 75.0):
    """
    Send attendance alerts to students with low attendance.

    Args:
        threshold: Attendance percentage threshold (default 75%)

    Returns:
        int: Number of alerts sent
    """
    from apps.students.models import Student
    from apps.attendance.models import Attendance

    try:
        # Get students with low attendance
        # This is a placeholder - implement based on your attendance model
        students_low_attendance = []  # Query students with attendance < threshold

        success_count = 0

        for student in students_low_attendance:
            try:
                attendance_details = {
                    'attendance_percentage': student.attendance_percentage,  # Calculate this
                    'threshold': threshold,
                    'days_absent': student.days_absent,
                    'total_days': student.total_days,
                }

                if EmailService.send_attendance_alert(student, attendance_details):
                    success_count += 1

            except Exception as e:
                logger.error(f"Failed to send attendance alert to {student.id}: {str(e)}")

        logger.info(f"Sent {success_count} attendance alerts")
        return success_count

    except Exception as e:
        logger.error(f"Failed to send attendance alerts: {str(e)}")
        return 0


@shared_task
def send_notice_notifications_task(notice_id: int):
    """
    Send email notifications for a published notice.

    Args:
        notice_id: Notice ID

    Returns:
        int: Number of notifications sent
    """
    try:
        notice = Notice.objects.get(id=notice_id)

        # Get recipients based on target audience
        recipients = []

        if notice.target_audience == 'ALL':
            recipients = User.objects.filter(is_active=True).values_list('email', flat=True)

        elif notice.target_audience == 'STUDENTS':
            recipients = User.objects.filter(
                user_type='STUDENT',
                is_active=True
            ).values_list('email', flat=True)

        elif notice.target_audience == 'TEACHERS':
            recipients = User.objects.filter(
                user_type='TEACHER',
                is_active=True
            ).values_list('email', flat=True)

        elif notice.target_audience == 'PARENTS':
            recipients = User.objects.filter(
                user_type='PARENT',
                is_active=True
            ).values_list('email', flat=True)

        elif notice.target_audience == 'CLASS' and notice.specific_classes.exists():
            # Get students from specific classes
            from apps.students.models import Student

            students = Student.objects.filter(
                # current_class__in=notice.specific_classes.all()
            )
            recipients = students.values_list('email', flat=True)

        # Filter out empty emails
        recipients = [email for email in recipients if email]

        if recipients:
            sent_count = EmailService.send_notice_notification(notice, list(recipients))
            logger.info(f"Sent {sent_count} notice notifications for notice {notice_id}")
            return sent_count

        return 0

    except Notice.DoesNotExist:
        logger.error(f"Notice {notice_id} not found")
        return 0
    except Exception as e:
        logger.error(f"Failed to send notice notifications: {str(e)}")
        return 0


@shared_task
def send_birthday_wishes_task():
    """
    Send birthday wishes to users with birthdays today.

    This task should be scheduled to run daily (e.g., at 9:00 AM).

    Returns:
        int: Number of birthday wishes sent
    """
    from django.utils import timezone

    try:
        today = timezone.now().date()

        # Get users with birthday today
        users_with_birthdays = User.objects.filter(
            date_of_birth__month=today.month,
            date_of_birth__day=today.day,
            is_active=True
        )

        success_count = 0

        for user in users_with_birthdays:
            try:
                if EmailService.send_birthday_wishes(user):
                    success_count += 1

                    # Also create an in-app notification
                    Notification.objects.create(
                        recipient=user,
                        title="Happy Birthday! 🎉",
                        message=f"Wishing you a wonderful birthday, {user.first_name}!"
                    )

            except Exception as e:
                logger.error(f"Failed to send birthday wishes to {user.id}: {str(e)}")

        logger.info(f"Sent {success_count} birthday wishes")
        return success_count

    except Exception as e:
        logger.error(f"Failed to send birthday wishes: {str(e)}")
        return 0


@shared_task
def cleanup_old_notifications_task(days: int = 90):
    """
    Delete old read notifications (older than N days).

    Args:
        days: Number of days to keep notifications

    Returns:
        int: Number of notifications deleted
    """
    from django.utils import timezone
    from datetime import timedelta

    try:
        cutoff_date = timezone.now() - timedelta(days=days)

        deleted_count, _ = Notification.objects.filter(
            is_read=True,
            created_at__lt=cutoff_date
        ).delete()

        logger.info(f"Deleted {deleted_count} old notifications")
        return deleted_count

    except Exception as e:
        logger.error(f"Failed to cleanup notifications: {str(e)}")
        return 0
