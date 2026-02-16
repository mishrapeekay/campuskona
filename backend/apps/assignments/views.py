from rest_framework import viewsets, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404

from apps.assignments.models import Assignment, AssignmentSubmission
from apps.assignments.serializers import (
    AssignmentSerializer, 
    AssignmentSubmissionSerializer,
    AssignmentSubmissionGradeSerializer
)
from apps.core.models import AuditLog
from apps.staff.models import StaffMember
from apps.students.models import Student

class IsTeacherOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type in ['TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN']

class AssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Assignment CRUD operations
    """
    serializer_class = AssignmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subject', 'section', 'teacher', 'status', 'academic_year']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at']
    ordering = ['-due_date']

    def get_queryset(self):
        user = self.request.user
        queryset = Assignment.objects.filter(is_deleted=False)

        if user.user_type == 'TEACHER':
            return queryset.filter(teacher__user=user)
        elif user.user_type == 'STUDENT':
            # Students see assignments published for their section
            try:
                student = Student.objects.get(user=user)
                # We need to get the student's current sections
                section_ids = student.class_enrollments.filter(is_active=True).values_list('section_id', flat=True)
                return queryset.filter(section_id__in=section_ids, status='PUBLISHED')
            except Student.DoesNotExist:
                return queryset.none()
        elif user.user_type == 'PARENT':
            # Parents see assignments for their children's sections
            return queryset.filter(section__enrollments__student__parent_links__parent=user, status='PUBLISHED').distinct()
        
        return queryset

    def perform_create(self, serializer):
        assignment = serializer.save()
        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='Assignment',
            object_id=str(assignment.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

class AssignmentSubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Assignment Submissions
    """
    serializer_class = AssignmentSubmissionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['assignment', 'student', 'status']
    ordering_fields = ['submission_date', 'graded_at']
    ordering = ['-submission_date']

    def get_queryset(self):
        user = self.request.user
        queryset = AssignmentSubmission.objects.filter(is_deleted=False)

        if user.user_type == 'STUDENT':
            return queryset.filter(student__user=user)
        elif user.user_type == 'TEACHER':
            # Teachers see submissions for assignments they created
            return queryset.filter(assignment__teacher__user=user)
        elif user.user_type == 'PARENT':
            # Parents see submissions by their children
            return queryset.filter(student__parent_links__parent=user)
        
        return queryset

    def perform_create(self, serializer):
        # Automatically set the student if the user is a student
        if self.request.user.user_type == 'STUDENT':
            try:
                student = Student.objects.get(user=self.request.user)
                submission = serializer.save(student=student)
            except Student.DoesNotExist:
                return Response({'error': 'Student profile not found'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            submission = serializer.save()

        # Update status if late
        if submission.submission_date > submission.assignment.due_date:
            submission.status = 'LATE'
            submission.save()

        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='AssignmentSubmission',
            object_id=str(submission.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    @action(detail=True, methods=['post'], permission_classes=[IsTeacherOrAdmin])
    def grade(self, request, pk=None):
        """
        Action for teachers to grade a submission
        """
        submission = self.get_object()
        serializer = AssignmentSubmissionGradeSerializer(submission, data=request.data, partial=True)
        
        if serializer.is_valid():
            try:
                teacher = StaffMember.objects.get(user=request.user)
            except StaffMember.DoesNotExist:
                return Response({'error': 'Teacher profile not found'}, status=status.HTTP_400_BAD_REQUEST)

            submission = serializer.save(
                graded_by=teacher,
                graded_at=timezone.now(),
                status='GRADED'
            )
            
            AuditLog.objects.create(
                user=request.user,
                action='UPDATE',
                model_name='AssignmentSubmission',
                object_id=str(submission.id),
                changes={'action': 'GRADE', 'marks': str(submission.marks_obtained)},
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response(AssignmentSubmissionSerializer(submission).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
