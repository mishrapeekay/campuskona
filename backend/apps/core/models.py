"""
Core models and utilities for the School Management System.
"""

import logging
import uuid
from django.db import models, connection
from django.utils import timezone
from psycopg2 import sql as psycopg2_sql
from apps.core.db_router import get_current_tenant

logger = logging.getLogger(__name__)

class BaseModel(models.Model):
    """
    Abstract base model with common fields for all models.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class SoftDeleteModel(BaseModel):
    """
    Abstract base model with soft delete functionality.
    """
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        """Soft delete - mark as deleted instead of removing from database."""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def hard_delete(self, *args, **kwargs):
        """Permanently delete from database."""
        super().delete(*args, **kwargs)

    def restore(self):
        """Restore a soft-deleted record."""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


# ============================================================================
# AUDIT LOG MODEL
# ============================================================================

class AuditLog(BaseModel):
    """
    Audit log for tracking changes to models.
    """
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    school = models.ForeignKey(
        'tenants.School',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='audit_logs',
        help_text='Tenant (school) this audit log entry belongs to'
    )
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs'
    )
    integration_credential_id = models.UUIDField(
        null=True,
        blank=True,
        help_text='ID of the integration credential that performed this action'
    )
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=100)
    object_repr = models.CharField(max_length=200)
    changes = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['model_name', 'object_id']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['school', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.action} - {self.model_name} ({self.timestamp})"


# ============================================================================
# TENANT-AWARE MODELS AND MANAGERS
# ============================================================================

class TenantManager(models.Manager):
    """
    Manager that automatically switches to tenant schema for queries.
    """
    
    def get_queryset(self):
        """
        Get queryset with automatic schema switching.
        """
        tenant = get_current_tenant()

        if tenant and connection.vendor == 'postgresql':
            # Switch to tenant schema
            schema_name = tenant.schema_name if hasattr(tenant, 'schema_name') else tenant
            with connection.cursor() as cursor:
                cursor.execute(
                    psycopg2_sql.SQL('SET search_path TO {}, "public"').format(
                        psycopg2_sql.Identifier(schema_name)
                    )
                )
                logger.debug("Switched to schema: %s for query", schema_name)

        return super().get_queryset()


class TenantModel(models.Model):
    """
    Abstract base model for tenant-specific models.
    
    Usage:
        class Student(TenantModel):
            name = models.CharField(max_length=100)
            ...
    """
    
    objects = TenantManager()
    
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        """
        Save with automatic schema switching.
        """
        tenant = get_current_tenant()

        if tenant and connection.vendor == 'postgresql':
            # Switch to tenant schema
            schema_name = tenant.schema_name if hasattr(tenant, 'schema_name') else tenant
            with connection.cursor() as cursor:
                cursor.execute(
                    psycopg2_sql.SQL('SET search_path TO {}, "public"').format(
                        psycopg2_sql.Identifier(schema_name)
                    )
                )
                logger.debug("Switched to schema: %s for save", schema_name)

        return super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """
        Delete with automatic schema switching.
        """
        tenant = get_current_tenant()

        if tenant and connection.vendor == 'postgresql':
            # Switch to tenant schema
            schema_name = tenant.schema_name if hasattr(tenant, 'schema_name') else tenant
            with connection.cursor() as cursor:
                cursor.execute(
                    psycopg2_sql.SQL('SET search_path TO {}, "public"').format(
                        psycopg2_sql.Identifier(schema_name)
                    )
                )
                logger.debug("Switched to schema: %s for delete", schema_name)

        return super().delete(*args, **kwargs)
