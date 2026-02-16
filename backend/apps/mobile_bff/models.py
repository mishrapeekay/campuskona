from django.db import models
from apps.core.models import BaseModel

class SyncLog(BaseModel):
    """
    Log of sync sessions for debugging and auditing.
    """
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('PARTIAL', 'Partial Success'),
        ('ERROR', 'Error'),
    ]

    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='sync_logs'
    )
    # created_at from BaseModel provides the timestamp
    operation = models.CharField(max_length=10, choices=[('PUSH', 'Push'), ('PULL', 'Pull')])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Metadata: conflicts, retry instructions, etc.
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'mobile_sync_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.operation} - {self.status}"


class SyncConflict(BaseModel):
    """
    Store conflicts for manual or later resolution.
    """
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='sync_conflicts'
    )
    entity_name = models.CharField(max_length=100)
    entity_id = models.CharField(max_length=100, blank=True)
    
    client_version = models.JSONField(help_text="Data sent by client")
    server_version = models.JSONField(help_text="Current server data")
    
    resolved = models.BooleanField(default=False)
    resolution_strategy = models.CharField(max_length=50, blank=True)
    
    class Meta:
        db_table = 'mobile_sync_conflicts'
        ordering = ['-created_at']

    def __str__(self):
        return f"Conflict: {self.entity_name} ({self.user})"
