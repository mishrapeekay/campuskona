"""
Serializers for Attendance Management
"""

from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    AttendancePeriod,
    StudentAttendance,
    StaffAttendance,
    StudentLeave,
    StaffLeave,
    Holiday,
    AttendanceSummary
)


class AttendancePeriodSerializer(serializers.ModelSerializer):
    """Serializer for attendance periods/time slots"""
    
    class Meta:
        model = AttendancePeriod
        fields = [
            'id', 'name', 'start_time', 'end_time', 'period_type',
            'order', 'duration', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['duration', 'created_at', 'updated_at']


class StudentAttendanceSerializer(serializers.ModelSerializer):
    """Full serializer for student attendance"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    class_name = serializers.CharField(source='student.current_class.name', read_only=True)
    section_name = serializers.CharField(source='student.current_section.name', read_only=True)
    period_name = serializers.CharField(source='period.name', read_only=True, allow_null=True)
    marked_by_name = serializers.CharField(source='marked_by.get_full_name', read_only=True, allow_null=True)
    is_present = serializers.BooleanField(read_only=True)
    duration_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentAttendance
        fields = [
            'id', 'student', 'student_name', 'student_admission_number',
            'class_name', 'section_name', 'academic_year', 'date', 'status',
            'period', 'period_name', 'check_in_time', 'check_out_time',
            'biometric_verified', 'biometric_device_id', 'marked_by',
            'marked_by_name', 'marked_at', 'remarks', 'is_present',
            'duration_hours', 'created_at', 'updated_at'
        ]
        read_only_fields = ['marked_at', 'created_at', 'updated_at']
    
    def get_duration_hours(self, obj):
        """Get attendance duration in hours"""
        return obj.duration


class StudentAttendanceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing student attendance"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    class_section = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = StudentAttendance
        fields = [
            'id', 'student', 'student_name', 'class_section', 'date',
            'status', 'status_display', 'period', 'check_in_time',
            'biometric_verified'
        ]
    
    def get_class_section(self, obj):
        """Get class and section name from student enrollment"""
        try:
            from apps.academics.models import StudentEnrollment
            enrollment = StudentEnrollment.objects.filter(
                student=obj.student,
                is_active=True
            ).select_related('section', 'section__class_instance').first()
            
            if enrollment and enrollment.section:
                class_name = enrollment.section.class_instance.name if enrollment.section.class_instance else ''
                section_name = enrollment.section.name
                return f"{class_name} - {section_name}" if class_name else section_name
        except Exception:
            pass
        return None


class BulkAttendanceSerializer(serializers.Serializer):
    """Serializer for bulk attendance marking"""
    class_id = serializers.UUIDField(required=True)
    section_id = serializers.UUIDField(required=True)
    date = serializers.DateField(required=True)
    period_id = serializers.IntegerField(required=False, allow_null=True)
    attendance_data = serializers.ListField(
        child=serializers.DictField(),
        required=True
    )
    
    def validate_date(self, value):
        """Validate attendance date"""
        if value > timezone.now().date():
            raise serializers.ValidationError("Cannot mark attendance for future dates")
        return value
    
    def validate_attendance_data(self, value):
        """Validate attendance data structure"""
        for record in value:
            if 'student_id' not in record:
                raise serializers.ValidationError("Each record must have student_id")
            if 'status' not in record:
                raise serializers.ValidationError("Each record must have status")
            if record['status'] not in dict(StudentAttendance.ATTENDANCE_STATUS).keys():
                raise serializers.ValidationError(f"Invalid status: {record['status']}")
        return value


class StaffAttendanceSerializer(serializers.ModelSerializer):
    """Full serializer for staff attendance"""
    staff_name = serializers.CharField(source='staff_member.get_full_name', read_only=True)
    employee_id = serializers.CharField(source='staff_member.employee_id', read_only=True)
    department_name = serializers.CharField(source='staff_member.department.name', read_only=True, allow_null=True)
    marked_by_name = serializers.CharField(source='marked_by.get_full_name', read_only=True, allow_null=True)
    is_present = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = StaffAttendance
        fields = [
            'id', 'staff_member', 'staff_name', 'employee_id', 'department_name',
            'date', 'status', 'check_in_time', 'check_out_time', 'working_hours',
            'biometric_verified', 'biometric_device_id', 'marked_by',
            'marked_by_name', 'marked_at', 'remarks', 'overtime_hours',
            'is_present', 'created_at', 'updated_at'
        ]
        read_only_fields = ['working_hours', 'marked_at', 'created_at', 'updated_at']


class StaffAttendanceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing staff attendance"""
    staff_name = serializers.CharField(source='staff_member.get_full_name', read_only=True)
    department = serializers.CharField(source='staff_member.department.name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = StaffAttendance
        fields = [
            'id', 'staff_member', 'staff_name', 'department', 'date',
            'status', 'status_display', 'check_in_time', 'check_out_time',
            'working_hours', 'biometric_verified'
        ]


class StudentLeaveSerializer(serializers.ModelSerializer):
    """Serializer for student leave requests"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    class_name = serializers.CharField(source='student.current_class.name', read_only=True, allow_null=True)
    requested_by_name = serializers.CharField(source='requested_by.get_full_name', read_only=True, allow_null=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, allow_null=True)
    leave_type_display = serializers.CharField(source='get_leave_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = StudentLeave
        fields = [
            'id', 'student', 'student_name', 'student_admission_number', 'class_name',
            'leave_type', 'leave_type_display', 'start_date', 'end_date', 'total_days',
            'reason', 'status', 'status_display', 'requested_by', 'requested_by_name',
            'requested_at', 'approved_by', 'approved_by_name', 'approved_at',
            'approval_remarks', 'supporting_document', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'total_days', 'requested_at', 'approved_at',
            'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """Validate leave dates"""
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after or equal to start date'
                })
        return data


class StudentLeaveApprovalSerializer(serializers.Serializer):
    """Serializer for approving/rejecting student leave"""
    action = serializers.ChoiceField(choices=['approve', 'reject'], required=True)
    remarks = serializers.CharField(required=False, allow_blank=True)


class StaffLeaveSerializer(serializers.ModelSerializer):
    """Serializer for staff leave requests"""
    staff_name = serializers.CharField(source='staff_member.get_full_name', read_only=True)
    employee_id = serializers.CharField(source='staff_member.employee_id', read_only=True)
    department_name = serializers.CharField(source='staff_member.department.name', read_only=True, allow_null=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, allow_null=True)
    leave_type_display = serializers.CharField(source='get_leave_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = StaffLeave
        fields = [
            'id', 'staff_member', 'staff_name', 'employee_id', 'department_name',
            'leave_type', 'leave_type_display', 'start_date', 'end_date',
            'total_days', 'is_half_day', 'reason', 'status', 'status_display',
            'requested_at', 'approved_by', 'approved_by_name', 'approved_at',
            'approval_remarks', 'supporting_document', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'total_days', 'requested_at', 'approved_at',
            'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """Validate leave dates"""
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after or equal to start date'
                })
        return data


class StaffLeaveApprovalSerializer(serializers.Serializer):
    """Serializer for approving/rejecting staff leave"""
    action = serializers.ChoiceField(choices=['approve', 'reject'], required=True)
    remarks = serializers.CharField(required=False, allow_blank=True)


class HolidaySerializer(serializers.ModelSerializer):
    """Serializer for holidays"""
    holiday_type_display = serializers.CharField(source='get_holiday_type_display', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    
    class Meta:
        model = Holiday
        fields = [
            'id', 'name', 'date', 'holiday_type', 'holiday_type_display',
            'description', 'academic_year', 'academic_year_name',
            'is_optional', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class AttendanceSummarySerializer(serializers.ModelSerializer):
    """Serializer for attendance summary"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    class_name = serializers.CharField(source='student.current_class.name', read_only=True, allow_null=True)
    month_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceSummary
        fields = [
            'id', 'student', 'student_name', 'student_admission_number',
            'class_name', 'academic_year', 'month', 'month_name',
            'total_days', 'present_days', 'absent_days', 'late_days',
            'leave_days', 'attendance_percentage', 'last_updated'
        ]
        read_only_fields = [
            'total_days', 'present_days', 'absent_days', 'late_days',
            'leave_days', 'attendance_percentage', 'last_updated'
        ]
    
    def get_month_name(self, obj):
        """Get month name"""
        return obj.month.strftime('%B %Y')


class AttendanceReportSerializer(serializers.Serializer):
    """Serializer for attendance report generation"""
    report_type = serializers.ChoiceField(
        choices=['daily', 'monthly', 'student', 'class', 'defaulters'],
        required=True
    )
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    class_id = serializers.IntegerField(required=False)
    section_id = serializers.IntegerField(required=False)
    student_id = serializers.IntegerField(required=False)
    academic_year_id = serializers.IntegerField(required=True)
    format = serializers.ChoiceField(
        choices=['json', 'pdf', 'excel'],
        default='json'
    )
    
    def validate(self, data):
        """Validate report parameters"""
        report_type = data.get('report_type')
        
        if report_type in ['daily', 'monthly']:
            if not data.get('start_date'):
                raise serializers.ValidationError({
                    'start_date': 'Start date is required for this report type'
                })
        
        if report_type == 'student':
            if not data.get('student_id'):
                raise serializers.ValidationError({
                    'student_id': 'Student ID is required for student report'
                })
        
        if report_type == 'class':
            if not data.get('class_id'):
                raise serializers.ValidationError({
                    'class_id': 'Class ID is required for class report'
                })
        
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({
                    'end_date': 'End date must be after start date'
                })
        
        return data


class ClassAttendanceSerializer(serializers.Serializer):
    """Serializer for class-wise attendance summary"""
    class_id = serializers.IntegerField()
    class_name = serializers.CharField()
    section_id = serializers.IntegerField()
    section_name = serializers.CharField()
    date = serializers.DateField()
    total_students = serializers.IntegerField()
    present = serializers.IntegerField()
    absent = serializers.IntegerField()
    late = serializers.IntegerField()
    leave = serializers.IntegerField()
    attendance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)


class StudentAttendanceStatsSerializer(serializers.Serializer):
    """Serializer for student attendance statistics"""
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    admission_number = serializers.CharField()
    class_name = serializers.CharField()
    total_days = serializers.IntegerField()
    present_days = serializers.IntegerField()
    absent_days = serializers.IntegerField()
    late_days = serializers.IntegerField()
    leave_days = serializers.IntegerField()
    attendance_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    is_defaulter = serializers.BooleanField()
