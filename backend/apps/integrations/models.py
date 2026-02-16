import uuid
from django.db import models
from django.utils import timezone
from apps.core.models import BaseModel, SoftDeleteModel, TenantManager
# Assuming this import works based on usage in apps.students
from apps.core.encryption import EncryptedCharField

class Integration(SoftDeleteModel):
    """
    Registry of available integrations (e.g. Moodle, QuickBooks, Custom Webhook).
    """
    objects = TenantManager()

    INTEGRATION_TYPES = [
        ('LMS', 'Learning Management System'),
        ('ERP', 'Enterprise Resource Planning'),
        ('PAYMENT', 'Payment Gateway'),
        ('GOVT', 'Government System'),
        ('MARKETPLACE', 'Marketplace App'),
        ('OTHER', 'Other'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    type = models.CharField(max_length=20, choices=INTEGRATION_TYPES)
    description = models.TextField(blank=True)
    website_url = models.URLField(blank=True)
    developer_email = models.EmailField(blank=True)
    
    # Configuration schema (JSON Schema)
    config_schema = models.JSONField(default=dict, blank=True, help_text="Schema for configuration fields")

    is_active = models.BooleanField(default=True)
    
    # Marketplace metadata
    icon_url = models.URLField(blank=True)
    version = models.CharField(max_length=20, default='1.0.0')

    class Meta:
        db_table = 'integrations'
        ordering = ['name']

    def __str__(self):
        return self.name

class IntegrationCredential(SoftDeleteModel):
    """
    Tenant's credentials for a specific integration.
    Used for both outbound (accessing 3rd party) and inbound (authenticating 3rd party) API access.
    """
    objects = TenantManager()

    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='credentials')
    
    # API identification
    client_id = models.CharField(max_length=255, blank=True, help_text="Public Client ID or API Key ID")
    
    # Secrets (Encrypted)
    client_secret = EncryptedCharField(max_length=512, blank=True, null=True, help_text="Encrypted Client Secret")
    api_key = EncryptedCharField(max_length=512, blank=True, null=True, help_text="Encrypted API Key (if different from secret)")
    
    # OAuth Tokens (for outbound access)
    access_token = EncryptedCharField(max_length=1024, blank=True, null=True)
    refresh_token = EncryptedCharField(max_length=1024, blank=True, null=True)
    token_expiry = models.DateTimeField(null=True, blank=True)
    
    # Additional Tenant Config
    config = models.JSONField(default=dict, blank=True, help_text="Tenant-specific configuration values")
    
    is_active = models.BooleanField(default=True)
    
    # Security: IP Allowlists
    allowed_ips = models.JSONField(default=list, blank=True, help_text="List of allowed IP addresses for inbound requests")
    
    # Rate Limiting
    rate_limit_requests = models.PositiveIntegerField(default=1000, help_text="Max requests per hour for this integration")
    
    class Meta:
        db_table = 'integration_credentials'
        # unique_together = ['integration', 'client_id'] 

    def __str__(self):
        return f"{self.integration.name} Credential ({self.id})"

class WebhookEvent(BaseModel):
    """
    Registry of system events that can be subscribed to.
    """
    objects = TenantManager()

    event_type = models.CharField(max_length=100, unique=True, help_text="e.g. student.created")
    description = models.TextField(blank=True)
    payload_schema = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'webhook_events'

    def __str__(self):
        return self.event_type

class WebhookSubscription(SoftDeleteModel):
    """
    Tenant subscription to events for an integration.
    """
    objects = TenantManager()

    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='subscriptions', null=True, blank=True)
    event = models.ForeignKey(WebhookEvent, on_delete=models.CASCADE, related_name='subscriptions')
    target_url = models.URLField()
    secret_key = EncryptedCharField(max_length=255, help_text="HMAC secret key for signing payloads")
    is_active = models.BooleanField(default=True)
    headers = models.JSONField(default=dict, blank=True, help_text="Custom headers to send")
    
    # Failure handling
    failure_count = models.PositiveIntegerField(default=0)
    last_failure_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'webhook_subscriptions'

    def __str__(self):
        return f"{self.event.event_type} -> {self.target_url}"

class WebhookDelivery(BaseModel):
    """
    Log of webhook delivery attempts.
    """
    objects = TenantManager()

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ]

    subscription = models.ForeignKey(WebhookSubscription, on_delete=models.CASCADE, related_name='deliveries')
    payload = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    response_status = models.PositiveIntegerField(null=True, blank=True)
    response_body = models.TextField(blank=True)
    
    attempt_count = models.PositiveIntegerField(default=0)
    next_retry_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'webhook_deliveries'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subscription} - {self.status}"
