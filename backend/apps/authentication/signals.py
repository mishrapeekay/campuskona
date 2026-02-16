"""
Signals for authentication app.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.core.models import AuditLog
from apps.core.utils import get_client_ip
from .models import User, UserRole


@receiver(post_save, sender=User)
def log_user_creation(sender, instance, created, **kwargs):
    """
    Log user creation in audit log.
    """
    if created:
        AuditLog.objects.create(
            user=instance,
            action='CREATE',
            model_name='User',
            object_id=instance.id,
            object_repr=str(instance),
            changes={
                'email': instance.email,
                'user_type': instance.user_type,
                'is_active': instance.is_active,
            }
        )


@receiver(post_save, sender=UserRole)
def log_role_assignment(sender, instance, created, **kwargs):
    """
    Log role assignment in audit log.
    """
    if created:
        AuditLog.objects.create(
            user=instance.assigned_by,
            action='CREATE',
            model_name='UserRole',
            object_id=instance.id,
            object_repr=str(instance),
            changes={
                'user': str(instance.user),
                'role': str(instance.role),
                'assigned_by': str(instance.assigned_by) if instance.assigned_by else None,
            }
        )
