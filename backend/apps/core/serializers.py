"""
Serializers for core app.
"""

from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    """
    Audit log serializer.
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    tenant_name = serializers.CharField(source='school.name', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'school', 'tenant_name', 'user', 'user_name', 'user_email',
            'action', 'model_name', 'object_id', 'object_repr',
            'changes', 'ip_address', 'user_agent', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']
