from rest_framework import serializers
from .models import Notice, Event, Notification
from apps.academics.serializers import ClassSerializer

class NoticeSerializer(serializers.ModelSerializer):
    posted_by_name = serializers.CharField(source='posted_by.get_full_name', read_only=True)
    specific_classes_details = ClassSerializer(source='specific_classes', many=True, read_only=True)

    class Meta:
        model = Notice
        fields = '__all__'
        read_only_fields = ['posted_by', 'created_at', 'updated_at']

class EventSerializer(serializers.ModelSerializer):
    participant_classes_details = ClassSerializer(source='participants', many=True, read_only=True)

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['recipient', 'created_at']
