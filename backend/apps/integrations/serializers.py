from rest_framework import serializers
from .models import Integration, IntegrationCredential, WebhookEvent, WebhookSubscription, WebhookDelivery

class IntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Integration
        fields = ['id', 'name', 'slug', 'type', 'description', 'website_url', 'developer_email', 'config_schema', 'is_active', 'icon_url', 'version']

class IntegrationCredentialSerializer(serializers.ModelSerializer):
    # Mask secrets in output
    client_secret = serializers.CharField(write_only=True, required=False)
    api_key = serializers.CharField(write_only=True, required=False)
    access_token = serializers.CharField(write_only=True, required=False)
    refresh_token = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = IntegrationCredential
        fields = ['id', 'integration', 'client_id', 'client_secret', 'api_key', 'access_token', 'refresh_token', 'token_expiry', 'config', 'is_active', 'allowed_ips', 'rate_limit_requests']

class WebhookEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookEvent
        fields = ['id', 'event_type', 'description', 'payload_schema']

class WebhookSubscriptionSerializer(serializers.ModelSerializer):
    secret_key = serializers.CharField(write_only=True) # Mask secret

    class Meta:
        model = WebhookSubscription
        fields = ['id', 'integration', 'event', 'target_url', 'secret_key', 'is_active', 'headers', 'failure_count', 'last_failure_at']

class WebhookDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = WebhookDelivery
        fields = ['id', 'subscription', 'payload', 'status', 'response_status', 'response_body', 'attempt_count', 'next_retry_at', 'created_at']
