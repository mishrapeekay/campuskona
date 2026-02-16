"""
Celery tasks for tenant subscription lifecycle management.

Scheduled tasks (configured in CELERY_BEAT_SCHEDULE):
- check_expiring_subscriptions  — daily, sends 7-day + 1-day warning emails
- deactivate_expired_tenants    — daily, marks overdue schools inactive after grace period
- retry_failed_subscription_payments — daily, retries dunning sequence

Usage (manual trigger for testing):
    from apps.tenants.tasks import check_expiring_subscriptions
    check_expiring_subscriptions.delay()
"""

import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

# Grace period after expiry before the school is deactivated
DEACTIVATION_GRACE_DAYS = 7


@shared_task(bind=True, max_retries=3)
def check_expiring_subscriptions(self):
    """
    Send expiry warning emails to schools whose subscriptions expire in 7 days or 1 day.

    Runs daily via Celery beat.
    """
    from apps.tenants.models import School
    from apps.communication.tasks import send_email_task

    today = timezone.now().date()
    warning_windows = [7, 1]  # Days before expiry to warn

    total_warned = 0

    for days_ahead in warning_windows:
        target_date = today + timedelta(days=days_ahead)
        schools = School.objects.filter(
            subscription_end_date=target_date,
            is_active=True,
            schema_name__ne='public' if hasattr(School, 'schema_name') else None,
        ).exclude(schema_name='public').select_related('subscription')

        for school in schools:
            try:
                subject = (
                    f"Action Required: Your subscription expires in {days_ahead} day{'s' if days_ahead != 1 else ''}"
                )
                renewal_url = f"https://app.schoolmgmt.in/billing/renew"

                plain_message = (
                    f"Hello {school.name} Team,\n\n"
                    f"Your School Management System subscription expires on {school.subscription_end_date}.\n\n"
                    f"To avoid service interruption, please renew at:\n{renewal_url}\n\n"
                    f"After expiry, you will have a {DEACTIVATION_GRACE_DAYS}-day grace period before "
                    f"your account is suspended.\n\n"
                    f"— School Management Support"
                )

                html_message = f"""
                <html><body style="font-family:sans-serif;color:#333;max-width:600px;margin:0 auto;">
                  <h2 style="color:#dc2626;">Subscription Expiry Notice</h2>
                  <p>Hello <strong>{school.name}</strong> Team,</p>
                  <p>Your subscription expires on <strong>{school.subscription_end_date}</strong>
                     ({days_ahead} day{'s' if days_ahead != 1 else ''} from now).</p>
                  <p style="margin:24px 0;">
                    <a href="{renewal_url}"
                       style="background:#2563eb;color:white;padding:12px 24px;
                              text-decoration:none;border-radius:6px;font-weight:bold;">
                      Renew Subscription
                    </a>
                  </p>
                  <p style="color:#6b7280;font-size:13px;">
                    After expiry you have a {DEACTIVATION_GRACE_DAYS}-day grace period before your account is suspended.
                    All data is retained during this period.
                  </p>
                </body></html>
                """

                send_email_task.delay(school.email, subject, plain_message, html_message)
                total_warned += 1
                logger.info(f"Expiry warning ({days_ahead}d) queued for {school.name}")

            except Exception:
                logger.exception(f"Failed to send expiry warning for school {school.id}")

    logger.info(f"check_expiring_subscriptions: warned {total_warned} schools")
    return total_warned


@shared_task(bind=True, max_retries=3)
def deactivate_expired_tenants(self):
    """
    Deactivate schools whose subscriptions expired more than DEACTIVATION_GRACE_DAYS ago.

    Sets school.is_active = False, which causes SubscriptionEnforcementMiddleware
    to block all API requests with HTTP 402.

    Runs daily via Celery beat.
    """
    from apps.tenants.models import School
    from apps.communication.tasks import send_email_task

    cutoff_date = timezone.now().date() - timedelta(days=DEACTIVATION_GRACE_DAYS)

    expired_schools = School.objects.filter(
        subscription_end_date__lt=cutoff_date,
        is_active=True,
    ).exclude(schema_name='public')

    deactivated_count = 0
    for school in expired_schools:
        try:
            school.is_active = False
            school.save(update_fields=['is_active'])
            deactivated_count += 1

            # Send suspension notice
            subject = f"Account Suspended — {school.name}"
            plain_message = (
                f"Hello {school.name} Team,\n\n"
                f"Your School Management System account has been suspended because your "
                f"subscription expired on {school.subscription_end_date} and was not renewed.\n\n"
                f"Your data is safe and retained. To reactivate, renew your subscription at:\n"
                f"https://app.schoolmgmt.in/billing/renew\n\n"
                f"— School Management Support"
            )
            send_email_task.delay(school.email, subject, plain_message)
            logger.info(f"School deactivated (subscription expired): {school.name}")

        except Exception:
            logger.exception(f"Failed to deactivate school {school.id}")

    logger.info(f"deactivate_expired_tenants: deactivated {deactivated_count} schools")
    return deactivated_count


@shared_task(bind=True, max_retries=3)
def reactivate_school_after_payment(self, school_id: int):
    """
    Reactivate a previously suspended school after successful payment.
    Called from the payment webhook handler.
    """
    from apps.tenants.models import School

    try:
        school = School.objects.get(id=school_id)
        if not school.is_active:
            school.is_active = True
            school.save(update_fields=['is_active'])
            logger.info(f"School reactivated after payment: {school.name}")

        # Invalidate subscription enforcement cache if any
        from django.core.cache import cache
        cache.delete(f"sub_enforcement:{school_id}")

    except School.DoesNotExist:
        logger.error(f"reactivate_school_after_payment: school {school_id} not found")
    except Exception:
        logger.exception(f"Failed to reactivate school {school_id}")
