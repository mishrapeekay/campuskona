from rest_framework import serializers
from apps.attendance.models import StudentAttendance, ClassAttendanceLog, AttendancePeriod
from apps.academics.models import Section, StudentEnrollment
from apps.students.models import Student
from django.utils import timezone

class AttendanceRecordSerializer(serializers.Serializer):
    """
    Individual student attendance record in the sync payload
    """
    student_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=StudentAttendance.ATTENDANCE_STATUS)
    remarks = serializers.CharField(required=False, allow_blank=True)

class OfflineAttendanceSyncSerializer(serializers.Serializer):
    """
    Serializer for a single attendance session sync (one class, one date)
    """
    sync_id = serializers.UUIDField()
    section_id = serializers.IntegerField()
    date = serializers.DateField()
    period_id = serializers.IntegerField(required=False, allow_null=True)
    client_timestamp = serializers.DateTimeField()
    records = AttendanceRecordSerializer(many=True) # Only absentees/exceptions
    
    def validate(self, data):
        """
        Validate section and date
        """
        try:
            section = Section.objects.get(id=data['section_id'])
            data['section'] = section
        except Section.DoesNotExist:
            raise serializers.ValidationError(f"Section {data['section_id']} not found")

        if data.get('period_id'):
            try:
                period = AttendancePeriod.objects.get(id=data['period_id'])
                data['period'] = period
            except AttendancePeriod.DoesNotExist:
                raise serializers.ValidationError(f"Period {data['period_id']} not found")
        else:
            data['period'] = None

        # Check for future dates
        if data['date'] > timezone.now().date():
            raise serializers.ValidationError("Cannot mark attendance for future dates")
            
        return data

class BatchAttendanceSyncSerializer(serializers.Serializer):
    """
    Root serializer for batch sync
    """
    pushes = OfflineAttendanceSyncSerializer(many=True)
