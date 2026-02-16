"""
Email Service for School Management System.

Handles all email sending operations including:
- Transactional emails (password reset, welcome, etc.)
- Bulk notifications (announcements, reminders)
- Scheduled emails (fee reminders, exam notifications)

Usage:
    from apps.communication.email_service import EmailService

    # Send single email
    EmailService.send_welcome_email(user)

    # Send bulk email
    EmailService.send_bulk_notification(users, subject, message)
"""

from django.core.mail import send_mail, send_mass_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
from typing import List, Dict, Any
from apps.core.i18n.utils import LanguageResolver
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """
    Centralized email service for the School Management System.
    """

    # Default sender email
    DEFAULT_FROM_EMAIL = settings.DEFAULT_FROM_EMAIL

    # Email templates directory
    TEMPLATE_DIR = 'emails/'

    @classmethod
    def send_email(
        cls,
        to_email: str,
        subject: str,
        message: str,
        html_message: str = None,
        from_email: str = None,
        fail_silently: bool = False
    ) -> bool:
        """
        Send a single email.

        Args:
            to_email: Recipient email address
            subject: Email subject
            message: Plain text message
            html_message: HTML message (optional)
            from_email: Sender email (uses DEFAULT_FROM_EMAIL if not provided)
            fail_silently: If True, don't raise exceptions

        Returns:
            bool: True if email sent successfully

        Example:
            EmailService.send_email(
                'user@example.com',
                'Welcome',
                'Welcome to our school!'
            )
        """
        try:
            from_email = from_email or cls.DEFAULT_FROM_EMAIL

            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=[to_email],
                html_message=html_message,
                fail_silently=fail_silently
            )

            logger.info(f"Email sent successfully to {to_email}: {subject}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            if not fail_silently:
                raise
            return False

    @classmethod
    def send_template_email(
        cls,
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        from_email: str = None,
        language: str = 'en'
    ) -> bool:
        """
        Send email using Django template.

        Args:
            to_email: Recipient email
            subject: Email subject
            template_name: Template file name (in emails/ directory)
            context: Template context dict
            from_email: Sender email
            language: Language code for localization (default: 'en')

        Returns:
            bool: Success status

        Example:
            EmailService.send_template_email(
                'user@example.com',
                'Welcome',
                'welcome.html',
                {'user': user, 'school_name': 'ABC School'},
                language='hi'
            )
        """
        try:
            from django.utils import translation
            
            # Render HTML template with localized context
            with translation.override(language):
                html_content = render_to_string(
                    f'{cls.TEMPLATE_DIR}{template_name}',
                    context
                )

            # Create plain text version
            text_content = strip_tags(html_content)

            # Send email
            return cls.send_email(
                to_email=to_email,
                subject=subject,
                message=text_content,
                html_message=html_content,
                from_email=from_email
            )

        except Exception as e:
            logger.error(f"Failed to send template email: {str(e)}")
            return False

    @classmethod
    def send_bulk_email(
        cls,
        recipients: List[str],
        subject: str,
        message: str,
        html_message: str = None
    ) -> int:
        """
        Send same email to multiple recipients efficiently.

        Args:
            recipients: List of email addresses
            subject: Email subject
            message: Plain text message
            html_message: HTML message (optional)

        Returns:
            int: Number of emails sent successfully

        Example:
            emails = ['user1@example.com', 'user2@example.com']
            EmailService.send_bulk_email(
                emails,
                'Important Notice',
                'This is a notice for all students.'
            )
        """
        if not recipients:
            return 0

        success_count = 0

        try:
            # For HTML emails, we need to use EmailMultiAlternatives
            if html_message:
                from django.core.mail import get_connection

                connection = get_connection()
                connection.open()

                messages = []
                for recipient in recipients:
                    email = EmailMultiAlternatives(
                        subject=subject,
                        body=message,
                        from_email=cls.DEFAULT_FROM_EMAIL,
                        to=[recipient],
                        connection=connection
                    )
                    email.attach_alternative(html_message, "text/html")
                    messages.append(email)

                success_count = connection.send_messages(messages)
                connection.close()

            else:
                # For plain text, use send_mass_mail (more efficient)
                datatuple = [
                    (subject, message, cls.DEFAULT_FROM_EMAIL, [recipient])
                    for recipient in recipients
                ]
                success_count = send_mass_mail(datatuple, fail_silently=True)

            logger.info(f"Sent {success_count} bulk emails out of {len(recipients)}")
            return success_count

        except Exception as e:
            logger.error(f"Failed to send bulk emails: {str(e)}")
            return success_count

    # ====================
    # Predefined Email Types
    # ====================

    @classmethod
    def send_welcome_email(cls, user) -> bool:
        """
        Send welcome email to new user.

        Args:
            user: User instance

        Returns:
            bool: Success status
        """
        subject = "Welcome to Our School Management System"
        context = {
            'user': user,
            'school_name': getattr(settings, 'SCHOOL_NAME', 'Our School'),
            'login_url': f"{settings.FRONTEND_URL}/login"
        }

        # Resolve language
        language = LanguageResolver.resolve_language(user)

        return cls.send_template_email(
            to_email=user.email,
            subject=subject,
            template_name='welcome.html',
            context=context,
            language=language
        )

    @classmethod
    def send_password_reset_email(cls, user, reset_url: str) -> bool:
        """
        Send password reset email.

        Args:
            user: User instance
            reset_url: Password reset URL with token

        Returns:
            bool: Success status
        """
        subject = "Password Reset Request"
        context = {
            'user': user,
            'reset_url': reset_url,
            'school_name': getattr(settings, 'SCHOOL_NAME', 'Our School')
        }

        # Resolve language
        language = LanguageResolver.resolve_language(user)

        return cls.send_template_email(
            to_email=user.email,
            subject=subject,
            template_name='password_reset.html',
            context=context,
            language=language
        )

    @classmethod
    def send_email_verification(cls, user, verification_url: str) -> bool:
        """
        Send email verification email.

        Args:
            user: User instance
            verification_url: Email verification URL with token

        Returns:
            bool: Success status
        """
        subject = "Verify Your Email Address"
        context = {
            'user': user,
            'verification_url': verification_url,
            'school_name': getattr(settings, 'SCHOOL_NAME', 'Our School')
        }

        return cls.send_template_email(
            to_email=user.email,
            subject=subject,
            template_name='email_verification.html',
            context=context
        )

    @classmethod
    def send_fee_payment_reminder(cls, student, fee_details: Dict) -> bool:
        """
        Send fee payment reminder to student/parent.

        Args:
            student: Student instance
            fee_details: Dict with fee information

        Returns:
            bool: Success status
        """
        subject = "Fee Payment Reminder"
        context = {
            'student': student,
            'fee_details': fee_details,
            'school_name': getattr(settings, 'SCHOOL_NAME', 'Our School'),
            'payment_url': f"{settings.FRONTEND_URL}/payments"
        }

        # Send to student
        success_student = cls.send_template_email(
            to_email=student.email,
            subject=subject,
            template_name='fee_reminder.html',
            context=context
        )

        # Also send to parents if available
        success_parents = True
        if hasattr(student, 'parents') and student.parents.exists():
            parent_emails = [p.email for p in student.parents.all() if p.email]
            if parent_emails:
                cls.send_bulk_email(
                    recipients=parent_emails,
                    subject=subject,
                    message=f"Fee payment reminder for {student.get_full_name()}",
                    html_message=render_to_string(
                        f'{cls.TEMPLATE_DIR}fee_reminder.html',
                        context
                    )
                )

        return success_student

    @classmethod
    def send_exam_reminder(cls, student, exam_details: Dict) -> bool:
        """
        Send exam reminder to student.

        Args:
            student: Student instance
            exam_details: Dict with exam information

        Returns:
            bool: Success status
        """
        subject = f"Exam Reminder: {exam_details.get('exam_name', 'Upcoming Exam')}"
        context = {
            'student': student,
            'exam_details': exam_details,
            'school_name': getattr(settings, 'SCHOOL_NAME', 'Our School')
        }

        return cls.send_template_email(
            to_email=student.email,
            subject=subject,
            template_name='exam_reminder.html',
            context=context
        )

    @classmethod
    def send_attendance_alert(cls, student, attendance_details: Dict) -> bool:
        """
        Send low attendance alert to student/parent.

        Args:
            student: Student instance
            attendance_details: Dict with attendance information

        Returns:
            bool: Success status
        """
        subject = "Low Attendance Alert"
        context = {
            'student': student,
            'attendance_details': attendance_details,
            'school_name': getattr(settings, 'SCHOOL_NAME', 'Our School')
        }

        # Send to student and parents
        recipients = [student.email]

        if hasattr(student, 'parents') and student.parents.exists():
            parent_emails = [p.email for p in student.parents.all() if p.email]
            recipients.extend(parent_emails)

        html_content = render_to_string(
            f'{cls.TEMPLATE_DIR}attendance_alert.html',
            context
        )

        return cls.send_bulk_email(
            recipients=recipients,
            subject=subject,
            message=f"Low attendance alert for {student.get_full_name()}",
            html_message=html_content
        ) > 0

    @classmethod
    def send_notice_notification(cls, notice, recipients: List[str]) -> int:
        """
        Send notice/announcement notification.

        Args:
            notice: Notice instance
            recipients: List of email addresses

        Returns:
            int: Number of emails sent
        """
        subject = f"Notice: {notice.title}"
        context = {
            'notice': notice,
            'school_name': getattr(settings, 'SCHOOL_NAME', 'Our School'),
            'notice_url': f"{settings.FRONTEND_URL}/notices/{notice.id}"
        }

        html_content = render_to_string(
            f'{cls.TEMPLATE_DIR}notice_notification.html',
            context
        )

        return cls.send_bulk_email(
            recipients=recipients,
            subject=subject,
            message=f"{notice.title}\n\n{notice.content}",
            html_message=html_content
        )

    @classmethod
    def send_birthday_wishes(cls, user) -> bool:
        """
        Send birthday wishes email.

        Args:
            user: User instance

        Returns:
            bool: Success status
        """
        subject = "Happy Birthday! 🎉"
        context = {
            'user': user,
            'school_name': getattr(settings, 'SCHOOL_NAME', 'Our School')
        }

        return cls.send_template_email(
            to_email=user.email,
            subject=subject,
            template_name='birthday_wishes.html',
            context=context
        )

    @classmethod
    def send_event_reminder(cls, event, recipients: List[str]) -> int:
        """
        Send event reminder notification.

        Args:
            event: Event instance
            recipients: List of email addresses

        Returns:
            int: Number of emails sent
        """
        subject = f"Event Reminder: {event.title}"
        context = {
            'event': event,
            'school_name': getattr(settings, 'SCHOOL_NAME', 'Our School')
        }

        html_content = render_to_string(
            f'{cls.TEMPLATE_DIR}event_reminder.html',
            context
        )

        return cls.send_bulk_email(
            recipients=recipients,
            subject=subject,
            message=f"Event: {event.title}\n\n{event.description}\n\nDate: {event.start_date}",
            html_message=html_content
        )


# Convenience functions for Celery tasks
def send_async_email(to_email, subject, message, html_message=None):
    """
    Send email asynchronously (to be called from Celery task).

    Args:
        to_email: Recipient email
        subject: Email subject
        message: Plain text message
        html_message: HTML message (optional)

    Returns:
        bool: Success status
    """
    return EmailService.send_email(to_email, subject, message, html_message)


def send_async_bulk_email(recipients, subject, message, html_message=None):
    """
    Send bulk email asynchronously (to be called from Celery task).

    Args:
        recipients: List of email addresses
        subject: Email subject
        message: Plain text message
        html_message: HTML message (optional)

    Returns:
        int: Number of emails sent
    """
    return EmailService.send_bulk_email(recipients, subject, message, html_message)
