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
