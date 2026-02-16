"""
Django signals for tenant lifecycle events.

Handles:
- Welcome email when a new School is created
- Expiry warning email 7 days before subscription ends (triggered by Celery beat)
"""

import logging
from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


@receiver(post_save, sender='tenants.School')
def on_school_created(sender, instance, created, **kwargs):
    """
    Fire welcome email to the school admin when a new tenant is provisioned.

    We defer to Celery so the HTTP request that created the school returns quickly.
    We avoid importing at module level to prevent circular imports during app startup.
    """
    if not created:
        return

    # Skip public schema — it's an infrastructure artifact, not a real school
    if instance.schema_name == 'public':
        return

    try:
        from apps.communication.tasks import send_email_task

        admin_email = instance.email
        school_name = instance.name
        subdomain = getattr(instance, 'subdomain', '')
        login_url = f"https://{subdomain}.schoolmgmt.in/login" if subdomain else "https://app.schoolmgmt.in/login"

        subject = f"Welcome to School Management System — {school_name}"

        plain_message = (
            f"Hello,\n\n"
            f"Your school '{school_name}' has been successfully set up on School Management System.\n\n"
            f"Login URL: {login_url}\n\n"
            f"Your subscription is active. You can start adding students, staff, and academic data.\n\n"
            f"If you need help, contact support at support@schoolmgmt.in\n\n"
            f"— The School Management Team"
        )

        html_message = f"""
        <html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;">
          <h2 style="color:#2563eb;">Welcome to School Management System</h2>
          <p>Hello,</p>
          <p>Your school <strong>{school_name}</strong> has been successfully set up.</p>
          <table style="border-collapse:collapse;width:100%;margin:16px 0;">
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold;">Login URL</td>
                <td style="padding:8px;"><a href="{login_url}">{login_url}</a></td></tr>
            <tr><td style="padding:8px;background:#f3f4f6;font-weight:bold;">Subscription</td>
                <td style="padding:8px;">Active until {instance.subscription_end_date}</td></tr>
          </table>
          <p>Start by adding your academic year, classes, and staff members.</p>
          <p style="margin-top:24px;color:#6b7280;font-size:12px;">
            Need help? Email <a href="mailto:support@schoolmgmt.in">support@schoolmgmt.in</a>
          </p>
        </body></html>
        """

        send_email_task.delay(admin_email, subject, plain_message, html_message)
        logger.info(f"Welcome email queued for new school: {school_name} ({admin_email})")

    except Exception:
        # Never let email failure break tenant creation
        logger.exception(f"Failed to queue welcome email for school {instance.id}")
