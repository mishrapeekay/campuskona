import uuid
from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.utils.translation import gettext_lazy as _
from apps.core.models import TenantModel, SoftDeleteModel, BaseModel
from apps.authentication.models import User, Role

class WorkflowConfiguration(TenantModel, SoftDeleteModel):
    """
    Defines a workflow process for a specific type of request.
    Example: "Teacher Leave Approval", "Student Fee Concession"
    """
    WORKFLOW_TYPES = [
        ('LEAVE', 'Leave Application'),
        ('FEE_CONCESSION', 'Fee Concession'),
        ('TRANSFER_CERT', 'Transfer Certificate'),
        ('GENERIC', 'Generic Request'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    workflow_type = models.CharField(max_length=50, choices=WORKFLOW_TYPES, default='GENERIC')
    is_active = models.BooleanField(default=True)
    
    # Restrict workflow to specific content types (models)
    content_types = models.ManyToManyField(
        ContentType, 
        blank=True,
        help_text="Models this workflow applies to"
    )

    class Meta:
        db_table = 'workflow_configurations'
        verbose_name = _('Workflow Configuration')
        verbose_name_plural = _('Workflow Configurations')

    def __str__(self):
        return f"{self.name} ({self.get_workflow_type_display()})"


class WorkflowStep(TenantModel, SoftDeleteModel):
    """
    A single step in a workflow process.
    """
    ACTION_ON_REJECTION_CHOICES = [
        ('TERMINATE', 'Terminate Workflow'),
        ('BACK_TO_START', 'Restart Workflow'),
        ('BACK_TO_PREVIOUS', 'Go Back One Step'),
    ]

    workflow_config = models.ForeignKey(
        WorkflowConfiguration,
        on_delete=models.CASCADE,
        related_name='steps'
    )
    name = models.CharField(max_length=100, help_text="e.g. 'HM Approval'")
    step_order = models.PositiveIntegerField(help_text="Sequence number (1, 2, 3...)")
    
    # Approver definition: Role-based or User-based
    approver_role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='workflow_steps',
        help_text="Role required to approve this step"
    )
    approver_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_workflow_steps',
        help_text="Specific user required to approve (overrides role)"
    )
    
    is_final_step = models.BooleanField(default=False, help_text="If approved, workflow is completed")
    can_reject = models.BooleanField(default=True, help_text="Can the approver reject?")
    on_rejection = models.CharField(
        max_length=20, 
        choices=ACTION_ON_REJECTION_CHOICES, 
        default='TERMINATE'
    )

    class Meta:
        db_table = 'workflow_steps'
        ordering = ['step_order']
        unique_together = ['workflow_config', 'step_order']

    def __str__(self):
        return f"{self.step_order}. {self.name} ({self.workflow_config.name})"


class WorkflowRequest(TenantModel, SoftDeleteModel):
    """
    An instance of a workflow process for a specific object.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    ]

    workflow_config = models.ForeignKey(
        WorkflowConfiguration,
        on_delete=models.PROTECT,
        related_name='requests'
    )
    
    # Generic relation to the object being approved (Leave, FeeConcession, etc.)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.UUIDField() # Assuming UUIDs for all models
    content_object = GenericForeignKey('content_type', 'object_id')
    
    current_step = models.ForeignKey(
        WorkflowStep,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='active_requests'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    requester = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='workflow_requests'
    )
    
    class Meta:
        db_table = 'workflow_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.workflow_config.name} - {self.status}"
        
    def initiate(self):
        """Start the workflow by setting the first step."""
        first_step = self.workflow_config.steps.order_by('step_order').first()
        if first_step:
            self.current_step = first_step
            self.status = 'IN_PROGRESS'
            self.save()
            return True
        return False
        
    def get_next_step(self):
        """Get the next step after the current one."""
        if not self.current_step:
            return None
        return self.workflow_config.steps.filter(
            step_order__gt=self.current_step.step_order
        ).order_by('step_order').first()


class WorkflowActionLog(TenantModel, BaseModel):
    """
    History of actions taken on a workflow request.
    """
    ACTION_CHOICES = [
        ('INITIATE', 'Initiated'),
        ('APPROVE', 'Approved'),
        ('REJECT', 'Rejected'),
        ('REQUEST_CHANGE', 'Request Change'),
        ('CANCEL', 'Cancelled'),
    ]

    workflow_request = models.ForeignKey(
        WorkflowRequest,
        on_delete=models.CASCADE,
        related_name='action_logs'
    )
    step = models.ForeignKey(
        WorkflowStep,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    actor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='workflow_actions'
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    remarks = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'workflow_action_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.actor} {self.action} - {self.workflow_request}"
