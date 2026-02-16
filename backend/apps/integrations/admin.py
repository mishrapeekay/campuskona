from django.contrib import admin
from .models import Integration, IntegrationCredential, WebhookEvent, WebhookSubscription, WebhookDelivery

@admin.register(Integration)
class IntegrationAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'is_active', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('type', 'is_active')

@admin.register(IntegrationCredential)
class IntegrationCredentialAdmin(admin.ModelAdmin):
    list_display = ('integration', 'client_id', 'is_active')
    search_fields = ('client_id', 'integration__name')
    readonly_fields = ('api_key', 'client_secret', 'access_token', 'refresh_token') # Hide plaintext secrets

@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'description')
    search_fields = ('event_type',)

@admin.register(WebhookSubscription)
class WebhookSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('event', 'target_url', 'is_active', 'failure_count')
    list_filter = ('is_active', 'event')
    search_fields = ('target_url',)

@admin.register(WebhookDelivery)
class WebhookDeliveryAdmin(admin.ModelAdmin):
    list_display = ('subscription', 'status', 'response_status', 'created_at', 'attempt_count')
    list_filter = ('status', 'created_at')
    readonly_fields = ('payload', 'response_body', 'status', 'attempt_count', 'next_retry_at')
