from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from apps.authentication.permissions import IsPrincipal
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Q

from apps.academics.models import (
    AcademicYear,
    Board,
    Subject,
    Class,
    Section,
    ClassSubject,
    StudentEnrollment,
    StudentSubject,
    SyllabusUnit,
    LessonPlan,
    LessonPlanItem
)
from apps.academics.serializers import (
    AcademicYearSerializer,
    BoardSerializer,
    SubjectSerializer,
    ClassSerializer,
    SectionSerializer,
    SectionListSerializer,
    ClassSubjectSerializer,
    StudentEnrollmentSerializer,
    StudentSubjectSerializer,
    SyllabusUnitSerializer,
    LessonPlanSerializer,
    SyllabusCompletionSerializer
)
from apps.core.models import AuditLog


class AcademicYearViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Academic Year CRUD operations
    """
    serializer_class = AcademicYearSerializer
    permission_classes = [IsAuthenticated] # Read-only for most, write handled by specific check or IsPrincipal
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_current']
    ordering_fields = ['start_date', 'name']
    ordering = ['-start_date']

    def get_queryset(self):
        return AcademicYear.objects.filter(is_deleted=False)

    def perform_create(self, serializer):
        """Create academic year with audit log"""
        academic_year = serializer.save()

        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='AcademicYear',
            object_id=str(academic_year.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    @action(detail=True, methods=['post'])
    def set_current(self, request, pk=None):
        """
        Set this academic year as current
        """
        academic_year = self.get_object()
        academic_year.is_current = True
        academic_year.save()

        AuditLog.objects.create(
            user=request.user,
            action='UPDATE',
            model_name='AcademicYear',
            object_id=str(academic_year.id),
            changes={'is_current': True},
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({
            'message': 'Academic year set as current',
            'academic_year': AcademicYearSerializer(academic_year).data
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get academics statistics for dashboard
        """
        total_years = AcademicYear.objects.filter(is_deleted=False).count()
        total_boards = Board.objects.filter(is_deleted=False).count()
        total_classes = Class.objects.filter(is_deleted=False).count()
        total_sections = Section.objects.filter(is_deleted=False).count()
        total_subjects = Subject.objects.filter(is_deleted=False).count()
        
        # Active counts
        active_classes = Class.objects.filter(is_deleted=False, is_active=True).count()
        active_sections = Section.objects.filter(is_deleted=False, is_active=True).count()
        active_subjects = Subject.objects.filter(is_deleted=False, is_active=True).count()
        
        # Current academic year
        current_year = AcademicYear.objects.filter(is_current=True, is_deleted=False).first()
        
        return Response({
            'total_years': total_years,
            'total_boards': total_boards,
            'total_classes': total_classes,
            'total_sections': total_sections,
            'total_subjects': total_subjects,
            'active_classes': active_classes,
            'active_sections': active_sections,
            'active_subjects': active_subjects,
            'current_year': AcademicYearSerializer(current_year).data if current_year else None,
        })


class BoardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Board CRUD operations
    """
    serializer_class = BoardSerializer
    permission_classes = [IsAuthenticated] # Read-only for most, write handled by specific check or IsPrincipal
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['board_type', 'is_active']
    search_fields = ['board_name', 'board_code']
    ordering_fields = ['board_name']
    ordering = ['board_name']

    def get_queryset(self):
        return Board.objects.filter(is_deleted=False)

    def perform_create(self, serializer):
        """Create board with audit log"""
        board = serializer.save()

        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='Board',
            object_id=str(board.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class SubjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Subject CRUD operations
    """
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated] # Read-only for most, write handled by specific check or IsPrincipal
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['board', 'subject_type', 'class_group', 'stream', 'is_active', 'has_practical', 'is_optional']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code']
    ordering = ['name']

    def get_queryset(self):
        qs = Subject.objects.filter(is_deleted=False).select_related('board')
        # Filter by class group when a specific class is requested
        class_id = self.request.query_params.get('class_id')
        if class_id:
            try:
                cls_obj = Class.objects.get(id=class_id, is_deleted=False)
                if cls_obj.class_group:
                    qs = qs.filter(class_group=cls_obj.class_group)
            except Class.DoesNotExist:
                pass
        return qs

    def perform_create(self, serializer):
        """Create subject with audit log"""
        subject = serializer.save()

        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='Subject',
            object_id=str(subject.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class ClassViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Class CRUD operations
    """
    serializer_class = ClassSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['board', 'is_active']
    search_fields = ['name', 'display_name']
    ordering_fields = ['class_order', 'name']
    ordering = ['class_order']

    def get_queryset(self):
        return Class.objects.filter(is_deleted=False).select_related('board')

    def perform_create(self, serializer):
        """Create class with audit log"""
        class_instance = serializer.save()

        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='Class',
            object_id=str(class_instance.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    @action(detail=True, methods=['get'])
    def sections(self, request, pk=None):
        """
        Get all sections for this class
        """
        class_instance = self.get_object()
        sections = Section.objects.filter(
            class_instance=class_instance,
            is_deleted=False,
            is_active=True
        ).order_by('name')
        
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data)


class SectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Section CRUD operations
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['class_instance', 'academic_year', 'is_active', 'class_teacher']
    search_fields = ['name', 'room_number']
    ordering_fields = ['class_instance__class_order', 'name']
    ordering = ['class_instance__class_order', 'name']

    def get_queryset(self):
        return Section.objects.filter(is_deleted=False).select_related(
            'class_instance',
            'academic_year',
            'class_teacher'
        )

    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'list':
            return SectionListSerializer
        return SectionSerializer

    def perform_create(self, serializer):
        """Create section with audit log"""
        section = serializer.save()

        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='Section',
            object_id=str(section.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """
        Get all students in this section
        """
        section = self.get_object()
        enrollments = StudentEnrollment.objects.filter(
            section=section,
            is_active=True,
            is_deleted=False
        ).select_related('student')

        serializer = StudentEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)


class ClassSubjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Class-Subject mapping
    """
    serializer_class = ClassSubjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['class_instance', 'subject', 'teacher', 'academic_year', 'is_compulsory']
    ordering_fields = ['class_instance__class_order', 'display_order']
    ordering = ['class_instance__class_order', 'display_order']

    def get_queryset(self):
        return ClassSubject.objects.filter(is_deleted=False).select_related(
            'class_instance',
            'subject',
            'teacher',
            'academic_year'
        )

    def perform_create(self, serializer):
        """Create class subject with audit log"""
        class_subject = serializer.save()

        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='ClassSubject',
            object_id=str(class_subject.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class StudentEnrollmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Student Enrollment
    """
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['student', 'section', 'academic_year', 'enrollment_status', 'is_active']
    ordering_fields = ['enrollment_date', 'roll_number']
    ordering = ['-enrollment_date']

    def get_queryset(self):
        """Filter based on user type"""
        queryset = StudentEnrollment.objects.filter(is_deleted=False).select_related(
            'student',
            'section',
            'academic_year'
        )

        user = self.request.user
        if user.user_type == 'STUDENT':
            # Students can only see their own enrollments
            if hasattr(user, 'student_profile'):
                 queryset = queryset.filter(student__user=user)
            else:
                 # Fallback
                 try:
                     from apps.students.models import Student
                     s = Student.objects.get(user_id=user.id)
                     queryset = queryset.filter(student=s)
                 except (ImportError, Student.DoesNotExist):
                     queryset = queryset.none()
        elif user.user_type == 'PARENT':
            # Parents can see their children's enrollments
            queryset = queryset.filter(student__parent_links__parent=user)

        return queryset

    def perform_create(self, serializer):
        """Create enrollment with audit log"""
        enrollment = serializer.save()

        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='StudentEnrollment',
            object_id=str(enrollment.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        """
        Promote student to next class
        """
        enrollment = self.get_object()

        if enrollment.enrollment_status != 'ENROLLED':
            return Response({
                'error': 'Only enrolled students can be promoted'
            }, status=status.HTTP_400_BAD_REQUEST)

        target_section_id = request.data.get('target_section_id')
        if not target_section_id:
            return Response({
                'error': 'target_section_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_section = Section.objects.get(id=target_section_id)
        except Section.DoesNotExist:
            return Response({
                'error': 'Target section not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Update current enrollment
        enrollment.enrollment_status = 'PROMOTED'
        enrollment.is_active = False
        enrollment.promoted_to_section = target_section
        enrollment.save()

        # Create new enrollment
        from datetime import date
        new_enrollment = StudentEnrollment.objects.create(
            student=enrollment.student,
            section=target_section,
            academic_year=target_section.academic_year,
            enrollment_date=date.today(),
            enrollment_status='ENROLLED',
            is_active=True
        )

        AuditLog.objects.create(
            user=request.user,
            action='UPDATE',
            model_name='StudentEnrollment',
            object_id=str(enrollment.id),
            changes={
                'action': 'PROMOTED',
                'from_section': str(enrollment.section.id),
                'to_section': str(target_section.id)
            },
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return Response({
            'message': 'Student promoted successfully',
            'enrollment': StudentEnrollmentSerializer(new_enrollment).data
        })


class StudentSubjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Student Subject selection
    """
    serializer_class = StudentSubjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['enrollment', 'subject']

    def get_queryset(self):
        """Filter based on user type"""
        queryset = StudentSubject.objects.filter(is_deleted=False).select_related(
            'enrollment',
            'subject'
        )

        user = self.request.user
        if user.user_type == 'STUDENT':
            queryset = queryset.filter(enrollment__student__user=user)
        elif user.user_type == 'PARENT':
            queryset = queryset.filter(enrollment__student__parent_links__parent=user)

        return queryset

    def perform_create(self, serializer):
        """Create student subject with audit log"""
        student_subject = serializer.save()

        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='StudentSubject',
            object_id=str(student_subject.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class SyllabusUnitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Syllabus Unit CRUD operations
    """
    serializer_class = SyllabusUnitSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['subject', 'class_instance']
    search_fields = ['title', 'description']
    ordering_fields = ['unit_number']
    ordering = ['unit_number']

    def get_queryset(self):
        return SyllabusUnit.objects.filter(is_deleted=False).select_related('subject', 'class_instance')

    def perform_create(self, serializer):
        unit = serializer.save()
        
        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='SyllabusUnit',
            object_id=str(unit.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    @action(detail=False, methods=['get'])
    def coverage(self, request):
        """
        Get syllabus coverage percentage.
        Query params:
        - subject_id (required)
        - class_id (optional - if checking curriculum stats)
        - section_id (required for completion tracking)
        """
        subject_id = request.query_params.get('subject_id')
        section_id = request.query_params.get('section_id')
        
        # If user just wants to see syllabus for a subject/class
        class_id = request.query_params.get('class_id')

        if not subject_id:
             return Response(
                {'error': 'subject_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            subject = Subject.objects.get(id=subject_id)
        except Subject.DoesNotExist:
             return Response(
                {'error': 'Subject not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Determine target class
        target_class = None
        target_section = None
        
        if section_id:
            try:
                target_section = Section.objects.get(id=section_id)
                target_class = target_section.class_instance
            except Section.DoesNotExist:
                 return Response({'error': 'Section not found'}, status=404)
        elif class_id:
            try:
                target_class = Class.objects.get(id=class_id)
            except Class.DoesNotExist:
                return Response({'error': 'Class not found'}, status=404)
        else:
             return Response({'error': 'Either section_id or class_id is required'}, status=400)


        # Total units and hours
        syllabus_qs = SyllabusUnit.objects.filter(
            class_instance=target_class,
            subject=subject,
            is_deleted=False
        )
        
        total_aggregate = syllabus_qs.aggregate(
            total_count=Count('id'),
            total_hours=Sum('expected_hours')
        )
        
        total_units = total_aggregate['total_count'] or 0
        total_hours = total_aggregate['total_hours'] or 0

        completed_units_count = 0
        completed_hours = 0
        
        if target_section:
            # Calculate completed units based on lesson plans
            # Logic: A unit is completed if any lesson plan item for it is *marked COMPLETED*
            completed_unit_ids = LessonPlanItem.objects.filter(
                lesson_plan__section=target_section,
                lesson_plan__subject=subject,
                syllabus_unit__isnull=False,
                status='COMPLETED', 
                is_deleted=False
            ).values_list('syllabus_unit', flat=True).distinct()
            
            completed_units_qs = SyllabusUnit.objects.filter(id__in=completed_unit_ids)
            
            completed_aggregate = completed_units_qs.aggregate(
                count=Count('id'),
                hours=Sum('expected_hours')
            )
            
            completed_units_count = completed_aggregate['count'] or 0
            completed_hours = completed_aggregate['hours'] or 0

        coverage_percentage = 0.0
        
        # Prefer hour-based calculation if data is available
        if total_hours > 0:
            coverage_percentage = (completed_hours / total_hours) * 100
        elif total_units > 0:
            coverage_percentage = (completed_units_count / total_units) * 100

        data = {
            'subject_id': subject.id,
            'subject_name': subject.name,
            'class_id': target_class.id,
            'class_name': target_class.display_name,
            'total_units': total_units,
            'total_hours': total_hours,
            'completed_units': completed_units_count,
            'completed_hours': completed_hours,
            'coverage_percentage': round(coverage_percentage, 2)
        }
        
        if target_section:
            data['section_id'] = target_section.id
            data['section_name'] = target_section.name

        return Response(data)


class LessonPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Lesson Plan CRUD operations
    """
    serializer_class = LessonPlanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['teacher', 'section', 'subject', 'start_date', 'status', 'academic_year']
    ordering_fields = ['start_date', 'status']
    ordering = ['-start_date']

    def get_queryset(self):
        return LessonPlan.objects.filter(is_deleted=False).select_related(
            'teacher', 'section', 'subject', 'academic_year'
        ).prefetch_related('items')

    def perform_create(self, serializer):
        plan = serializer.save()
        
        AuditLog.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name='LessonPlan',
            object_id=str(plan.id),
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

class LessonPlanSuggestionView(APIView):
    """
    AI-powered lesson plan suggestions.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from apps.academics.services.ai_assistant import AIAssistantService
        
        subject = request.data.get('subject')
        class_name = request.data.get('class_name')
        unit_title = request.data.get('unit_title')
        unit_desc = request.data.get('unit_description', '')
        
        if not subject or not unit_title:
             return Response({"error": "subject and unit_title are required"}, status=400)
             
        suggestion = AIAssistantService.suggest_lesson_plan(subject, class_name, unit_title, unit_desc)
        return Response(suggestion)
