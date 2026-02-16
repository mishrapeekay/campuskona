from rest_framework import serializers
from apps.assignments.models import Assignment, AssignmentSubmission
from apps.academics.serializers import SubjectSerializer, SectionListSerializer
from apps.students.serializers import StudentListSerializer
from apps.staff.serializers import StaffMemberListSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Assignment model
    """
    subject_details = SubjectSerializer(source='subject', read_only=True)
    section_details = SectionListSerializer(source='section', read_only=True)
    teacher_details = StaffMemberListSerializer(source='teacher', read_only=True)
    
    submission_count = serializers.SerializerMethodField()
    is_late = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = '__all__'
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at'
        ]

    def get_submission_count(self, obj):
        return obj.submissions.filter(is_deleted=False).count()

    def get_is_late(self, obj):
        from django.utils import timezone
        return timezone.now() > obj.due_date

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializer for AssignmentSubmission model
    """
    student_details = StudentListSerializer(source='student', read_only=True)
    assignment_details = AssignmentSerializer(source='assignment', read_only=True)
    graded_by_details = StaffMemberListSerializer(source='graded_by', read_only=True)
    
    is_late_submission = serializers.SerializerMethodField()

    class Meta:
        model = AssignmentSubmission
        fields = '__all__'
        read_only_fields = [
            'id', 'submission_date', 'created_at', 'updated_at', 
            'is_deleted', 'deleted_at', 'graded_at', 'graded_by'
        ]

    def get_is_late_submission(self, obj):
        return obj.submission_date > obj.assignment.due_date

class AssignmentSubmissionGradeSerializer(serializers.ModelSerializer):
    """
    Serializer for grading a submission
    """
    class Meta:
        model = AssignmentSubmission
        fields = ['marks_obtained', 'teacher_feedback', 'status']

    def validate_marks_obtained(self, value):
        assignment = self.instance.assignment
        if value > assignment.max_marks:
            raise serializers.ValidationError(
                f"Marks obtained ({value}) cannot exceed maximum marks ({assignment.max_marks})"
            )
        return value
