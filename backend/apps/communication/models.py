import uuid
from django.db import models
from django.conf import settings
from apps.core.models import BaseModel, TenantManager

class Notice(BaseModel):
    objects = TenantManager()
    AUDIENCE_CHOICES = [
        ('ALL', 'All Users'),
        ('STUDENTS', 'Students Only'),
        ('TEACHERS', 'Teachers Only'),
        ('PARENTS', 'Parents Only'),
        ('CLASS', 'Specific Class'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]

    title = models.CharField(max_length=200)
    content = models.TextField()
    attachment = models.FileField(upload_to='notices/', null=True, blank=True)
    
    target_audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES)
    specific_classes = models.ManyToManyField('academics.Class', blank=True, related_name='notices')
    
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    posted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    is_published = models.BooleanField(default=True)
    display_until = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_target_audience_display()})"

class Event(BaseModel):
    objects = TenantManager()
    TYPE_CHOICES = [
        ('ACADEMIC', 'Academic'),
        ('HOLIDAY', 'Holiday'),
        ('EXAM', 'Examination'),
        ('MEETING', 'Meeting'),
        ('SPORTS', 'Sports'),
        ('CULTURAL', 'Cultural'),
        ('OTHER', 'Other'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    event_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='OTHER')
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    organizer = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    
    participants = models.ManyToManyField('academics.Class', blank=True, related_name='events')
    is_public = models.BooleanField(default=True, help_text="Visible to all?")

    def __str__(self):
        return f"{self.title} ({self.start_date.date()})"

class Notification(BaseModel):
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    
    link = models.CharField(max_length=255, blank=True, null=True, help_text="Frontend link to redirect")
    
    def __str__(self):
        return f"To {self.recipient}: {self.title}"


# ─────────────────────────────────────────────────────────────
# Workstream B: SMS / WhatsApp logs
# Workstream F: FCM token registration
# ─────────────────────────────────────────────────────────────

class SMSLog(models.Model):
    """Log of SMS messages sent via MSG91."""
    STATUS_CHOICES = [('sent', 'Sent'), ('failed', 'Failed'), ('pending', 'Pending')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_phone = models.CharField(max_length=20)
    message = models.TextField()
    template_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    response_data = models.JSONField(default=dict, blank=True)
    student_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'SMS Log'
        verbose_name_plural = 'SMS Logs'

    def __str__(self):
        return f"SMS to {self.recipient_phone} [{self.status}] at {self.created_at}"


class WhatsAppLog(models.Model):
    """Log of WhatsApp messages sent via MSG91."""
    STATUS_CHOICES = [
        ('sent', 'Sent'), ('failed', 'Failed'),
        ('pending', 'Pending'), ('delivered', 'Delivered'),
    ]
    MESSAGE_TYPE_CHOICES = [
        ('attendance_alert', 'Attendance Alert'),
        ('fee_reminder', 'Fee Reminder'),
        ('welcome', 'Welcome'),
        ('consent_request', 'Consent Request'),
        ('general', 'General'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient_phone = models.CharField(max_length=20)
    message_type = models.CharField(max_length=50, choices=MESSAGE_TYPE_CHOICES, default='general')
    template_name = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    response_data = models.JSONField(default=dict, blank=True)
    student_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'WhatsApp Log'
        verbose_name_plural = 'WhatsApp Logs'

    def __str__(self):
        return f"WhatsApp to {self.recipient_phone} [{self.status}] at {self.created_at}"


class FCMToken(models.Model):
    """Firebase Cloud Messaging tokens for push notifications (Workstream F)."""
    DEVICE_TYPE_CHOICES = [
        ('android', 'Android'), ('ios', 'iOS'), ('web', 'Web'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='fcm_tokens',
    )
    token = models.TextField()
    device_type = models.CharField(max_length=10, choices=DEVICE_TYPE_CHOICES, default='android')
    device_id = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['user', 'device_id']]
        ordering = ['-updated_at']
        verbose_name = 'FCM Token'
        verbose_name_plural = 'FCM Tokens'

    def __str__(self):
        return f"FCM {self.device_type} token for {self.user} (active={self.is_active})"
