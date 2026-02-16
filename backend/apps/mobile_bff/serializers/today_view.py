"""
Serializers for Today View API
"""

from rest_framework import serializers


class TimeSlotSerializer(serializers.Serializer):
    """Time slot information"""
    start_time = serializers.CharField()
    end_time = serializers.CharField()
    duration_minutes = serializers.IntegerField()
    slot_type = serializers.CharField()
    name = serializers.CharField()


class SubjectSerializer(serializers.Serializer):
    """Subject information"""
    id = serializers.CharField(allow_null=True)
    name = serializers.CharField()
    code = serializers.CharField(allow_null=True)


class TeacherSerializer(serializers.Serializer):
    """Teacher information"""
    id = serializers.CharField(allow_null=True)
    name = serializers.CharField(allow_null=True)


class TimetablePeriodSerializer(serializers.Serializer):
    """Single timetable period"""
    period_number = serializers.IntegerField()
    time_slot = TimeSlotSerializer()
    subject = SubjectSerializer(allow_null=True)
    teacher = TeacherSerializer(allow_null=True)
    room_number = serializers.CharField(allow_blank=True)
    is_substitution = serializers.BooleanField()
    substitution_reason = serializers.CharField(allow_null=True, allow_blank=True)


class TimetableDataSerializer(serializers.Serializer):
    """Timetable or holiday information"""
    is_holiday = serializers.BooleanField()
    holiday_name = serializers.CharField(required=False, allow_blank=True)
    periods = TimetablePeriodSerializer(many=True)
    total_periods = serializers.IntegerField(required=False)


class HomeworkSerializer(serializers.Serializer):
    """Homework/Assignment information"""
    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    subject = SubjectSerializer()
    teacher = TeacherSerializer()
    due_date = serializers.CharField()
    due_date_display = serializers.CharField()
    max_marks = serializers.FloatField()
    submission_status = serializers.CharField()
    is_due_today = serializers.BooleanField()
    is_overdue = serializers.BooleanField()
    has_attachment = serializers.BooleanField()
    priority = serializers.CharField()


class FeeItemSerializer(serializers.Serializer):
    """Individual fee item"""
    id = serializers.CharField()
    category = serializers.CharField()
    amount = serializers.FloatField()
    paid_amount = serializers.FloatField()
    balance = serializers.FloatField()
    due_date = serializers.CharField(allow_null=True)
    due_date_display = serializers.CharField(allow_null=True)
    status = serializers.CharField()
    is_overdue = serializers.BooleanField()
    is_due_today = serializers.BooleanField()
    late_fee = serializers.FloatField()


class FeesDueSerializer(serializers.Serializer):
    """Fees due summary"""
    total_due = serializers.FloatField()
    overdue_amount = serializers.FloatField()
    due_today_amount = serializers.FloatField()
    upcoming_fees = FeeItemSerializer(many=True)
    has_overdue = serializers.BooleanField()
    has_due_today = serializers.BooleanField()


class RemarkAuthorSerializer(serializers.Serializer):
    """Remark author information"""
    id = serializers.CharField(allow_null=True)
    name = serializers.CharField()


class TeacherRemarkSerializer(serializers.Serializer):
    """Teacher remark/note"""
    id = serializers.CharField()
    type = serializers.CharField()
    title = serializers.CharField()
    content = serializers.CharField()
    created_at = serializers.CharField()
    created_at_display = serializers.CharField()
    created_by = RemarkAuthorSerializer()
    is_important = serializers.BooleanField()
    is_new = serializers.BooleanField()


class AttendanceStatusSerializer(serializers.Serializer):
    """Attendance status"""
    marked = serializers.BooleanField()
    status = serializers.CharField(allow_null=True)
    marked_at = serializers.CharField(allow_null=True)
    marked_by = TeacherSerializer(allow_null=True)
    remarks = serializers.CharField(allow_blank=True)


class StudentInfoSerializer(serializers.Serializer):
    """Basic student information"""
    id = serializers.CharField()
    name = serializers.CharField()
    admission_number = serializers.CharField()
    class_name = serializers.CharField(source='class', allow_null=True)
    section = serializers.CharField(allow_null=True)
    roll_number = serializers.IntegerField(allow_null=True)


class TodayViewResponseSerializer(serializers.Serializer):
    """Complete Today View response"""
    date = serializers.DateField()
    day_of_week = serializers.CharField()
    student = StudentInfoSerializer()
    timetable = TimetableDataSerializer()
    homework = HomeworkSerializer(many=True)
    fees_due = FeesDueSerializer()
    teacher_remarks = TeacherRemarkSerializer(many=True)
    attendance = AttendanceStatusSerializer()
    generated_at = serializers.DateTimeField()
    
    # Cache metadata (optional)
    _cache_hit = serializers.BooleanField(required=False)
    _cache_ttl = serializers.IntegerField(required=False)
    _cached_at = serializers.CharField(required=False)


class ChildTodayViewSerializer(serializers.Serializer):
    """Today view for a single child (used in parent view)"""
    date = serializers.DateField()
    day_of_week = serializers.CharField()
    student = StudentInfoSerializer()
    timetable = TimetableDataSerializer()
    homework = HomeworkSerializer(many=True)
    fees_due = FeesDueSerializer()
    teacher_remarks = TeacherRemarkSerializer(many=True)
    attendance = AttendanceStatusSerializer()
    generated_at = serializers.DateTimeField()


class ParentTodayViewResponseSerializer(serializers.Serializer):
    """Parent's today view with multiple children"""
    date = serializers.DateField()
    children = ChildTodayViewSerializer(many=True)
    children_count = serializers.IntegerField()
    generated_at = serializers.DateTimeField()
    
    # Cache metadata (optional)
    _cache_hit = serializers.BooleanField(required=False)
    _cache_ttl = serializers.IntegerField(required=False)
    _cached_at = serializers.CharField(required=False)
