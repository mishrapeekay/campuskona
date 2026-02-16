from rest_framework import serializers

class TeacherHomeTimetableSerializer(serializers.Serializer):
    id = serializers.IntegerField() # Or UUID depending on model, TeacherTimetable has ID
    period = serializers.CharField(source='time_slot.name')
    class_name = serializers.SerializerMethodField()
    subject = serializers.CharField(source='subject.name')
    start_time = serializers.TimeField(source='time_slot.start_time')
    end_time = serializers.TimeField(source='time_slot.end_time')
    room_number = serializers.CharField()
    status = serializers.CharField(default="Scheduled") # Could be "Ongoing", "Completed", "Next"

    def get_class_name(self, obj):
        # Handle both dict and object access
        if isinstance(obj, dict):
            return f"{obj.get('section__class_instance__name', '')} - {obj.get('section__name', '')}"
        return f"{obj.section.class_instance.name} - {obj.section.name}"

class PendingActionSerializer(serializers.Serializer):
    type = serializers.CharField() # 'ATTENDANCE', 'ASSIGNMENT', 'PARENT_MESSAGE', 'LEAVE_REQUEST'
    count = serializers.IntegerField()
    items = serializers.ListField(child=serializers.DictField(), required=False) # Detailed items if needed (e.g. which class)
    label = serializers.CharField()

class UrgentAlertSerializer(serializers.Serializer):
    type = serializers.CharField() # 'SUBSTITUTION', 'LEAVE_CLASH'
    message = serializers.CharField()
    severity = serializers.CharField(default="HIGH")
    action_url = serializers.CharField(required=False)

class TeacherHomeSerializer(serializers.Serializer):
    greeting = serializers.CharField()
    date = serializers.DateField()
    timetable = TeacherHomeTimetableSerializer(many=True)
    pending_actions = PendingActionSerializer(many=True)
    urgent_alerts = UrgentAlertSerializer(many=True)
