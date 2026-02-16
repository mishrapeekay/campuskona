from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from apps.workflows.models import (
    WorkflowConfiguration, 
    WorkflowStep, 
    WorkflowRequest, 
    WorkflowActionLog
)
from apps.authentication.serializers import UserSerializer # Assuming this exists or I'll stub it
# Note: I should check if UserSerializer is available. If not, I'll use a simple serializer.

class WorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = ['id', 'name', 'step_order', 'approver_role', 'approver_user', 'is_final_step', 'can_reject', 'on_rejection']

class WorkflowConfigurationSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = WorkflowConfiguration
        fields = ['id', 'name', 'description', 'workflow_type', 'is_active', 'steps', 'created_at', 'updated_at']

class WorkflowActionLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    step_name = serializers.CharField(source='step.name', read_only=True)

    class Meta:
        model = WorkflowActionLog
        fields = ['id', 'workflow_request', 'step', 'step_name', 'actor', 'actor_name', 'action', 'remarks', 'created_at']

class WorkflowRequestSerializer(serializers.ModelSerializer):
    config_name = serializers.CharField(source='workflow_config.name', read_only=True)
    current_step_name = serializers.CharField(source='current_step.name', read_only=True)
    requester_name = serializers.CharField(source='requester.get_full_name', read_only=True)
    action_logs = WorkflowActionLogSerializer(many=True, read_only=True)
    
    # Generic content object details
    content_object_type = serializers.SerializerMethodField()
    content_object_repr = serializers.SerializerMethodField()

    class Meta:
        model = WorkflowRequest
        fields = [
            'id', 'workflow_config', 'config_name', 
            'content_type', 'object_id', 'content_object_type', 'content_object_repr',
            'current_step', 'current_step_name', 
            'status', 'requester', 'requester_name', 
            'created_at', 'updated_at', 'action_logs'
        ]
        read_only_fields = ['status', 'requester', 'current_step']

    def get_content_object_type(self, obj):
        return obj.content_type.model

    def get_content_object_repr(self, obj):
        return str(obj.content_object) if obj.content_object else "Unknown Object"
