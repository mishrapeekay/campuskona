"""
Serializers for Timetable Management
"""

from rest_framework import serializers
from django.utils import timezone
from datetime import datetime
from .models import (
    TimeSlot,
    ClassTimetable,
    TeacherTimetable,
    TimetableSubstitution,
    RoomAllocation,
    TimetableTemplate,
    SubjectPeriodRequirement,
    TeacherAvailability,
    TimetableGenerationConfig,
    TimetableGenerationRun,
)


class TimeSlotSerializer(serializers.ModelSerializer):
    """Serializer for time slots"""
    slot_type_display = serializers.CharField(source='get_slot_type_display', read_only=True)
    
    class Meta:
        model = TimeSlot
        fields = [
            'id', 'name', 'slot_type', 'slot_type_display', 'start_time',
            'end_time', 'duration_minutes', 'order', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['duration_minutes', 'created_at', 'updated_at']


class ClassTimetableSerializer(serializers.ModelSerializer):
    """Full serializer for class timetable"""
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True, allow_null=True)
    teacher_name = serializers.SerializerMethodField()
    time_slot_details = TimeSlotSerializer(source='time_slot', read_only=True)
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = ClassTimetable
        fields = [
            'id', 'academic_year', 'class_obj', 'class_name', 'section',
            'section_name', 'day_of_week', 'day_display', 'time_slot',
            'time_slot_details', 'subject', 'subject_name', 'teacher',
            'teacher_name', 'room_number', 'is_active', 'remarks',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_teacher_name(self, obj):
        """Get teacher full name"""
        return obj.teacher.get_full_name() if obj.teacher else None


class ClassTimetableListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing"""
    class_section = serializers.SerializerMethodField()
    subject_name = serializers.CharField(source='subject.name', read_only=True, allow_null=True)
    teacher_name = serializers.SerializerMethodField()
    time_slot_name = serializers.CharField(source='time_slot.name', read_only=True)
    
    class Meta:
        model = ClassTimetable
        fields = [
            'id', 'class_section', 'day_of_week', 'time_slot_name',
            'subject_name', 'teacher_name', 'room_number', 'is_active'
        ]
    
    def get_class_section(self, obj):
        """Get class and section"""
        return f"{obj.class_obj.name} - {obj.section.name}"
    
    def get_teacher_name(self, obj):
        """Get teacher name"""
        return obj.teacher.get_full_name() if obj.teacher else None


class TeacherTimetableSerializer(serializers.ModelSerializer):
    """Serializer for teacher timetable"""
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    time_slot_details = TimeSlotSerializer(source='time_slot', read_only=True)
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = TeacherTimetable
        fields = [
            'id', 'academic_year', 'teacher', 'teacher_name', 'day_of_week',
            'day_display', 'time_slot', 'time_slot_details', 'class_obj',
            'class_name', 'section', 'section_name', 'subject', 'subject_name',
            'room_number', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TimetableSubstitutionSerializer(serializers.ModelSerializer):
    """Serializer for timetable substitutions"""
    original_teacher_name = serializers.CharField(source='original_teacher.get_full_name', read_only=True)
    substitute_teacher_name = serializers.CharField(source='substitute_teacher.get_full_name', read_only=True)
    class_info = serializers.SerializerMethodField()
    time_slot_info = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    requested_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TimetableSubstitution
        fields = [
            'id', 'academic_year', 'original_entry', 'date', 'original_teacher',
            'original_teacher_name', 'substitute_teacher', 'substitute_teacher_name',
            'class_info', 'time_slot_info', 'reason', 'status', 'status_display',
            'requested_by', 'requested_by_name', 'approved_by', 'approved_by_name',
            'approved_at', 'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'requested_by', 'approved_by', 'approved_at',
            'created_at', 'updated_at'
        ]
    
    def get_class_info(self, obj):
        """Get class information"""
        entry = obj.original_entry
        return {
            'class': entry.class_obj.name,
            'section': entry.section.name,
            'subject': entry.subject.name if entry.subject else None
        }
    
    def get_time_slot_info(self, obj):
        """Get time slot information"""
        entry = obj.original_entry
        return {
            'name': entry.time_slot.name,
            'start_time': entry.time_slot.start_time.strftime('%H:%M'),
            'end_time': entry.time_slot.end_time.strftime('%H:%M')
        }
    
    def get_requested_by_name(self, obj):
        """Get requester name"""
        return obj.requested_by.get_full_name() if obj.requested_by else None
    
    def get_approved_by_name(self, obj):
        """Get approver name"""
        return obj.approved_by.get_full_name() if obj.approved_by else None


class SubstitutionApprovalSerializer(serializers.Serializer):
    """Serializer for approving/rejecting substitutions"""
    action = serializers.ChoiceField(choices=['approve', 'reject'], required=True)
    remarks = serializers.CharField(required=False, allow_blank=True)


class RoomAllocationSerializer(serializers.ModelSerializer):
    """Serializer for room allocations"""
    room_type_display = serializers.CharField(source='get_room_type_display', read_only=True)
    
    class Meta:
        model = RoomAllocation
        fields = [
            'id', 'room_number', 'room_name', 'room_type', 'room_type_display',
            'floor', 'building', 'capacity', 'facilities', 'is_available',
            'remarks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TimetableTemplateSerializer(serializers.ModelSerializer):
    """Serializer for timetable templates"""
    created_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TimetableTemplate
        fields = [
            'id', 'name', 'description', 'template_data', 'is_active',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_created_by_name(self, obj):
        """Get creator name"""
        return obj.created_by.get_full_name() if obj.created_by else None


class WeeklyTimetableSerializer(serializers.Serializer):
    """Serializer for weekly timetable view"""
    class_id = serializers.IntegerField()
    section_id = serializers.IntegerField()
    class_name = serializers.CharField()
    section_name = serializers.CharField()
    timetable = serializers.DictField()


class TeacherWeeklyTimetableSerializer(serializers.Serializer):
    """Serializer for teacher's weekly timetable"""
    teacher_id = serializers.IntegerField()
    teacher_name = serializers.CharField()
    timetable = serializers.DictField()


class TimetableConflictSerializer(serializers.Serializer):
    """Serializer for timetable conflicts"""
    conflict_type = serializers.CharField()
    message = serializers.CharField()
    details = serializers.DictField()


class BulkTimetableSerializer(serializers.Serializer):
    """Serializer for bulk timetable creation"""
    academic_year_id = serializers.IntegerField(required=True)
    class_id = serializers.IntegerField(required=True)
    section_id = serializers.IntegerField(required=True)
    timetable_data = serializers.ListField(
        child=serializers.DictField(),
        required=True
    )
    
    def validate_timetable_data(self, value):
        """Validate timetable data structure"""
        required_fields = ['day_of_week', 'time_slot_id']
        for entry in value:
            for field in required_fields:
                if field not in entry:
                    raise serializers.ValidationError(
                        f"Each entry must have {field}"
                    )
        return value


# ============================================================================
# AI TIMETABLE GENERATION SERIALIZERS
# ============================================================================

class SubjectPeriodRequirementSerializer(serializers.ModelSerializer):
    """Serializer for subject period requirements."""
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.SerializerMethodField()
    room_type_display = serializers.CharField(
        source='get_preferred_room_type_display', read_only=True
    )

    class Meta:
        model = SubjectPeriodRequirement
        fields = [
            'id', 'academic_year', 'class_obj', 'class_name',
            'subject', 'subject_name', 'teacher', 'teacher_name',
            'periods_per_week', 'requires_lab', 'preferred_room_type',
            'room_type_display', 'consecutive_periods', 'preferred_time_slots',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_teacher_name(self, obj):
        return obj.teacher.get_full_name() if obj.teacher else None


class SubjectPeriodRequirementBulkSerializer(serializers.Serializer):
    """Serializer for bulk creating subject period requirements."""
    academic_year = serializers.UUIDField()
    class_obj = serializers.UUIDField()
    requirements = serializers.ListField(
        child=serializers.DictField(),
        help_text='List of {subject, periods_per_week, teacher?, requires_lab?, ...}'
    )

    def validate_academic_year(self, value):
        from apps.academics.models import AcademicYear
        try:
            return AcademicYear.objects.get(pk=value)
        except AcademicYear.DoesNotExist:
            raise serializers.ValidationError("Academic year not found.")

    def validate_class_obj(self, value):
        from apps.academics.models import Class
        try:
            return Class.objects.get(pk=value)
        except Class.DoesNotExist:
            raise serializers.ValidationError("Class not found.")


class TeacherAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for teacher availability."""
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    day_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TeacherAvailability
        fields = [
            'id', 'academic_year', 'teacher', 'teacher_name',
            'day_of_week', 'day_display', 'is_available',
            'available_from', 'available_until',
            'max_periods_per_day', 'max_consecutive_periods',
            'preferred_time_slots', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TeacherAvailabilityBulkSerializer(serializers.Serializer):
    """Serializer for setting a teacher's full week availability."""
    academic_year = serializers.UUIDField()
    teacher = serializers.UUIDField()
    availability = serializers.ListField(
        child=serializers.DictField(),
        help_text='List of per-day availability configs'
    )

    def validate_academic_year(self, value):
        from apps.academics.models import AcademicYear
        try:
            return AcademicYear.objects.get(pk=value)
        except AcademicYear.DoesNotExist:
            raise serializers.ValidationError("Academic year not found.")

    def validate_teacher(self, value):
        from apps.staff.models import StaffMember
        try:
            return StaffMember.objects.get(pk=value)
        except StaffMember.DoesNotExist:
            raise serializers.ValidationError("Teacher not found.")


class TimetableGenerationConfigSerializer(serializers.ModelSerializer):
    """Serializer for generation configuration."""
    algorithm_display = serializers.CharField(
        source='get_algorithm_display', read_only=True
    )
    created_by_name = serializers.SerializerMethodField()
    class_names = serializers.SerializerMethodField()

    class Meta:
        model = TimetableGenerationConfig
        fields = [
            'id', 'name', 'academic_year', 'classes', 'sections',
            'class_names', 'working_days',
            'algorithm', 'algorithm_display',
            'max_iterations', 'population_size',
            'weight_workload_balance', 'weight_subject_spread',
            'weight_teacher_preference', 'weight_room_optimization',
            'weight_no_consecutive_heavy',
            'custom_rules', 'created_by', 'created_by_name',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None

    def get_class_names(self, obj):
        return list(obj.classes.values_list('name', flat=True))


class TimetableGenerationConfigListSerializer(serializers.ModelSerializer):
    """Lightweight list serializer for configs."""
    algorithm_display = serializers.CharField(
        source='get_algorithm_display', read_only=True
    )
    run_count = serializers.SerializerMethodField()
    last_run_status = serializers.SerializerMethodField()

    class Meta:
        model = TimetableGenerationConfig
        fields = [
            'id', 'name', 'academic_year', 'algorithm',
            'algorithm_display', 'is_active', 'run_count',
            'last_run_status', 'created_at',
        ]

    def get_run_count(self, obj):
        return obj.runs.count()

    def get_last_run_status(self, obj):
        last_run = obj.runs.order_by('-created_at').first()
        return last_run.status if last_run else None


class TimetableGenerationRunSerializer(serializers.ModelSerializer):
    """Full serializer for generation runs."""
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    config_name = serializers.CharField(source='config.name', read_only=True)
    triggered_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TimetableGenerationRun
        fields = [
            'id', 'config', 'config_name', 'status', 'status_display',
            'progress_percent', 'progress_message',
            'generated_timetable', 'fitness_score',
            'conflicts_found', 'warnings',
            'started_at', 'completed_at', 'duration_seconds',
            'celery_task_id', 'error_message',
            'triggered_by', 'triggered_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'status', 'progress_percent', 'progress_message',
            'generated_timetable', 'fitness_score', 'conflicts_found',
            'warnings', 'started_at', 'completed_at', 'duration_seconds',
            'celery_task_id', 'error_message', 'triggered_by',
            'created_at', 'updated_at',
        ]

    def get_triggered_by_name(self, obj):
        return obj.triggered_by.get_full_name() if obj.triggered_by else None


class TimetableGenerationRunListSerializer(serializers.ModelSerializer):
    """Lightweight list serializer for runs."""
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )
    config_name = serializers.CharField(source='config.name', read_only=True)

    class Meta:
        model = TimetableGenerationRun
        fields = [
            'id', 'config', 'config_name', 'status', 'status_display',
            'progress_percent', 'fitness_score', 'conflicts_found',
            'started_at', 'completed_at', 'duration_seconds',
            'created_at',
        ]


class TimetableGenerationRunProgressSerializer(serializers.ModelSerializer):
    """Minimal serializer for progress polling."""
    status_display = serializers.CharField(
        source='get_status_display', read_only=True
    )

    class Meta:
        model = TimetableGenerationRun
        fields = [
            'id', 'status', 'status_display',
            'progress_percent', 'progress_message',
            'fitness_score', 'error_message',
        ]


class GenerationRunTriggerSerializer(serializers.Serializer):
    """Serializer for triggering a new generation run."""
    config_id = serializers.UUIDField(help_text='ID of the generation config to use')
