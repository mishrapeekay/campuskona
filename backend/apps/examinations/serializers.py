"""
Serializers for Examinations Management
"""

from rest_framework import serializers
from django.utils import timezone
from .models import (
    GradeScale,
    Grade,
    ExamType,
    Examination,
    ExamSchedule,
    StudentMark,
    ExamResult,
    ReportCard,
    ReportCardTemplate,
    ExamHall,
    ExamScheduleConfig,
    ExamScheduleRun,
)


class GradeSerializer(serializers.ModelSerializer):
    """Serializer for grades"""
    class Meta:
        model = Grade
        fields = [
            'id', 'grade_scale', 'grade', 'min_percentage', 'max_percentage',
            'grade_point', 'description', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class GradeScaleSerializer(serializers.ModelSerializer):
    """Serializer for grade scales"""
    grades = GradeSerializer(many=True, read_only=True)
    
    class Meta:
        model = GradeScale
        fields = [
            'id', 'name', 'description', 'is_active', 'grades',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ExamTypeSerializer(serializers.ModelSerializer):
    """Serializer for exam types"""
    exam_type_display = serializers.CharField(source='get_exam_type_display', read_only=True)
    
    class Meta:
        model = ExamType
        fields = [
            'id', 'name', 'code', 'exam_type', 'exam_type_display',
            'description', 'weightage', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ExaminationSerializer(serializers.ModelSerializer):
    """Full serializer for examinations"""
    exam_type_name = serializers.CharField(source='exam_type.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    grade_scale_name = serializers.CharField(source='grade_scale.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Examination
        fields = [
            'id', 'name', 'exam_type', 'exam_type_name', 'academic_year',
            'academic_year_name', 'grade_scale', 'grade_scale_name',
            'start_date', 'end_date', 'result_date', 'status', 'status_display',
            'description', 'instructions', 'is_published',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ExaminationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing"""
    exam_type_name = serializers.CharField(source='exam_type.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Examination
        fields = [
            'id', 'name', 'exam_type_name', 'academic_year_name',
            'start_date', 'end_date', 'status', 'status_display', 'is_published'
        ]


class ExamScheduleSerializer(serializers.ModelSerializer):
    """Serializer for exam schedules"""
    examination_name = serializers.CharField(source='examination.name', read_only=True)
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = ExamSchedule
        fields = [
            'id', 'examination', 'examination_name', 'class_obj', 'class_name',
            'section', 'section_name', 'subject', 'subject_name',
            'exam_date', 'start_time', 'end_time', 'duration_minutes',
            'max_marks', 'min_passing_marks', 'room_number', 'instructions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class StudentMarkSerializer(serializers.ModelSerializer):
    """Serializer for student marks"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    subject_name = serializers.CharField(source='exam_schedule.subject.name', read_only=True)
    max_marks = serializers.DecimalField(source='exam_schedule.max_marks', read_only=True, max_digits=6, decimal_places=2)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    entered_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = StudentMark
        fields = [
            'id', 'exam_schedule', 'student', 'student_name', 'student_admission_number',
            'subject_name', 'marks_obtained', 'max_marks', 'status', 'status_display',
            'is_passed', 'grade', 'grade_point', 'percentage', 'remarks',
            'entered_by', 'entered_by_name', 'entered_at', 'updated_at'
        ]
        read_only_fields = [
            'is_passed', 'grade', 'grade_point', 'percentage',
            'entered_by', 'entered_at', 'updated_at'
        ]
    
    def get_entered_by_name(self, obj):
        """Get name of user who entered marks"""
        return obj.entered_by.get_full_name() if obj.entered_by else None


class BulkMarkEntrySerializer(serializers.Serializer):
    """Serializer for bulk mark entry"""
    exam_schedule_id = serializers.IntegerField(required=True)
    marks_data = serializers.ListField(
        child=serializers.DictField(),
        required=True
    )
    
    def validate_marks_data(self, value):
        """Validate marks data structure"""
        required_fields = ['student_id', 'marks_obtained', 'status']
        for entry in value:
            for field in required_fields:
                if field not in entry:
                    raise serializers.ValidationError(
                        f"Each entry must have {field}"
                    )
        return value


class ExamResultSerializer(serializers.ModelSerializer):
    """Serializer for exam results"""
    examination_name = serializers.CharField(source='examination.name', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_admission_number = serializers.CharField(source='student.admission_number', read_only=True)
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    
    class Meta:
        model = ExamResult
        fields = [
            'id', 'examination', 'examination_name', 'student', 'student_name',
            'student_admission_number', 'class_obj', 'class_name', 'section',
            'section_name', 'total_marks_obtained', 'total_max_marks',
            'percentage', 'cgpa', 'overall_grade', 'rank', 'is_passed',
            'subjects_passed', 'subjects_failed', 'remarks',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class DetailedExamResultSerializer(serializers.ModelSerializer):
    """Detailed result with subject-wise marks"""
    examination_name = serializers.CharField(source='examination.name', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    class_name = serializers.CharField(source='class_obj.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    subject_marks = serializers.SerializerMethodField()
    
    class Meta:
        model = ExamResult
        fields = [
            'id', 'examination_name', 'student_name', 'class_name', 'section_name',
            'total_marks_obtained', 'total_max_marks', 'percentage', 'cgpa',
            'overall_grade', 'rank', 'is_passed', 'subjects_passed',
            'subjects_failed', 'subject_marks', 'remarks'
        ]
    
    def get_subject_marks(self, obj):
        """Get subject-wise marks"""
        marks = StudentMark.objects.filter(
            exam_schedule__examination=obj.examination,
            student=obj.student
        ).select_related('exam_schedule__subject')
        
        return [{
            'subject': mark.exam_schedule.subject.name,
            'marks_obtained': mark.marks_obtained,
            'max_marks': mark.exam_schedule.max_marks,
            'percentage': mark.percentage,
            'grade': mark.grade,
            'is_passed': mark.is_passed,
            'status': mark.status
        } for mark in marks]


class ReportCardTemplateSerializer(serializers.ModelSerializer):
    """Serializer for report card templates"""
    layout_display = serializers.CharField(source='get_layout_display', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = ReportCardTemplate
        fields = [
            'id', 'name', 'layout', 'layout_display', 'academic_year',
            'academic_year_name', 'header_text', 'footer_text', 'watermark_text',
            'show_rank', 'show_percentage', 'show_grade', 'show_cgpa',
            'show_attendance', 'show_teacher_remarks', 'show_principal_signature',
            'show_parent_signature_line', 'show_grade_scale',
            'include_exam_types', 'custom_fields',
            'is_default', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ReportCardSerializer(serializers.ModelSerializer):
    """Serializer for report cards"""
    student_name = serializers.SerializerMethodField()
    examination_name = serializers.SerializerMethodField()
    generated_by_name = serializers.SerializerMethodField()
    template_name = serializers.CharField(source='template.name', read_only=True, default=None)

    class Meta:
        model = ReportCard
        fields = [
            'id', 'exam_result', 'student', 'academic_year', 'template',
            'template_name', 'is_cumulative',
            'student_name', 'examination_name',
            'generated_at', 'generated_by', 'generated_by_name',
            'report_data', 'pdf_file',
            'teacher_remarks', 'principal_remarks',
        ]
        read_only_fields = ['generated_at', 'generated_by', 'report_data', 'pdf_file']

    def get_student_name(self, obj):
        if obj.exam_result:
            return obj.exam_result.student.get_full_name()
        if obj.student:
            return obj.student.get_full_name()
        return None

    def get_examination_name(self, obj):
        if obj.is_cumulative:
            return f"Cumulative - {obj.academic_year.name}" if obj.academic_year else 'Cumulative'
        if obj.exam_result:
            return obj.exam_result.examination.name
        return None

    def get_generated_by_name(self, obj):
        return obj.generated_by.get_full_name() if obj.generated_by else None


class GenerateReportCardSerializer(serializers.Serializer):
    """Serializer for report card generation request"""
    exam_result_id = serializers.IntegerField(required=False, help_text='For single-exam report')
    student_id = serializers.IntegerField(required=False, help_text='For cumulative report')
    academic_year_id = serializers.IntegerField(required=False)
    template_id = serializers.IntegerField(required=False)
    is_cumulative = serializers.BooleanField(default=False)
    teacher_remarks = serializers.CharField(required=False, allow_blank=True, default='')
    principal_remarks = serializers.CharField(required=False, allow_blank=True, default='')
    generate_pdf = serializers.BooleanField(default=True)

    def validate(self, data):
        if data.get('is_cumulative'):
            if not data.get('student_id') or not data.get('academic_year_id'):
                raise serializers.ValidationError(
                    'student_id and academic_year_id are required for cumulative report cards.'
                )
        else:
            if not data.get('exam_result_id'):
                raise serializers.ValidationError(
                    'exam_result_id is required for single-exam report cards.'
                )
        return data


class BulkGenerateReportCardSerializer(serializers.Serializer):
    """Serializer for bulk report card generation"""
    examination_id = serializers.IntegerField(required=True)
    class_id = serializers.IntegerField(required=True)
    section_id = serializers.IntegerField(required=True)
    template_id = serializers.IntegerField(required=False)
    generate_pdf = serializers.BooleanField(default=True)


# ============================================================================
# AI EXAM SCHEDULER SERIALIZERS
# ============================================================================

class ExamHallSerializer(serializers.ModelSerializer):
    """Serializer for exam halls"""
    class Meta:
        model = ExamHall
        fields = [
            'id', 'name', 'code', 'building', 'floor',
            'seating_capacity', 'has_cctv', 'has_ac',
            'is_accessible', 'is_available', 'remarks',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ExamScheduleConfigSerializer(serializers.ModelSerializer):
    """Serializer for exam schedule generation config"""
    examination_name = serializers.CharField(source='examination.name', read_only=True)
    algorithm_display = serializers.CharField(source='get_algorithm_display', read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ExamScheduleConfig
        fields = [
            'id', 'name', 'examination', 'examination_name',
            'classes', 'sections', 'exam_halls',
            'start_date', 'end_date', 'exam_days',
            'morning_start', 'morning_end',
            'afternoon_start', 'afternoon_end',
            'min_gap_between_exams', 'max_exams_per_day',
            'avoid_back_to_back_heavy', 'heavy_subjects',
            'algorithm', 'algorithm_display',
            'max_iterations', 'population_size',
            'weight_gap_balance', 'weight_heavy_subject_spread',
            'weight_hall_utilization', 'weight_invigilator_balance',
            'is_active', 'created_by', 'created_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None


class ExamScheduleRunSerializer(serializers.ModelSerializer):
    """Serializer for exam schedule generation runs"""
    config_name = serializers.CharField(source='config.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    triggered_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ExamScheduleRun
        fields = [
            'id', 'config', 'config_name',
            'status', 'status_display',
            'progress_percent', 'progress_message',
            'generated_schedule', 'fitness_score',
            'conflicts_found', 'warnings',
            'started_at', 'completed_at', 'duration_seconds',
            'celery_task_id', 'error_message',
            'triggered_by', 'triggered_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'status', 'progress_percent', 'progress_message',
            'generated_schedule', 'fitness_score', 'conflicts_found',
            'warnings', 'started_at', 'completed_at', 'duration_seconds',
            'celery_task_id', 'error_message', 'triggered_by',
            'created_at', 'updated_at',
        ]

    def get_triggered_by_name(self, obj):
        return obj.triggered_by.get_full_name() if obj.triggered_by else None


class ExamScheduleRunDetailSerializer(ExamScheduleRunSerializer):
    """Detailed run serializer including generated schedule."""
    pass  # Same fields, but used for retrieve to include full generated_schedule


class ApplyExamScheduleSerializer(serializers.Serializer):
    """Serializer for applying a generated exam schedule."""
    run_id = serializers.UUIDField(required=True)
    create_missing_schedules = serializers.BooleanField(
        default=True,
        help_text='Create ExamSchedule entries for the generated schedule'
    )


class ExamStatisticsSerializer(serializers.Serializer):
    """Serializer for exam statistics"""
    examination_id = serializers.IntegerField()
    examination_name = serializers.CharField()
    total_students = serializers.IntegerField()
    students_appeared = serializers.IntegerField()
    students_passed = serializers.IntegerField()
    students_failed = serializers.IntegerField()
    pass_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    highest_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    lowest_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)


class SubjectStatisticsSerializer(serializers.Serializer):
    """Serializer for subject-wise statistics"""
    subject_id = serializers.IntegerField()
    subject_name = serializers.CharField()
    total_students = serializers.IntegerField()
    students_appeared = serializers.IntegerField()
    students_passed = serializers.IntegerField()
    students_failed = serializers.IntegerField()
    pass_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_marks = serializers.DecimalField(max_digits=6, decimal_places=2)
    highest_marks = serializers.DecimalField(max_digits=6, decimal_places=2)
    lowest_marks = serializers.DecimalField(max_digits=6, decimal_places=2)
