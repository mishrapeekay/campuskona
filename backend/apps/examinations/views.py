"""
Views and ViewSets for Examinations Management
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Max, Min, Count, Q, Sum
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
from .serializers import (
    GradeScaleSerializer,
    GradeSerializer,
    ExamTypeSerializer,
    ExaminationSerializer,
    ExaminationListSerializer,
    ExamScheduleSerializer,
    StudentMarkSerializer,
    BulkMarkEntrySerializer,
    ExamResultSerializer,
    DetailedExamResultSerializer,
    ReportCardSerializer,
    ReportCardTemplateSerializer,
    GenerateReportCardSerializer,
    BulkGenerateReportCardSerializer,
    ExamStatisticsSerializer,
    SubjectStatisticsSerializer,
    ExamHallSerializer,
    ExamScheduleConfigSerializer,
    ExamScheduleRunSerializer,
    ExamScheduleRunDetailSerializer,
    ApplyExamScheduleSerializer,
)
from apps.authentication.permissions import HasFeature


class GradeScaleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing grade scales
    """
    queryset = GradeScale.objects.all()
    serializer_class = GradeScaleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active grade scales"""
        scales = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(scales, many=True)
        return Response(serializer.data)


class GradeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing grades
    """
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['grade_scale']
    ordering_fields = ['order', 'min_percentage']
    ordering = ['grade_scale', 'order']


class ExamTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exam types
    """
    queryset = ExamType.objects.all()
    serializer_class = ExamTypeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['exam_type', 'is_active']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'weightage']
    ordering = ['name']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active exam types"""
        types = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(types, many=True)
        return Response(serializer.data)


class ExaminationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing examinations
    """
    queryset = Examination.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'exam_type', 'academic_year', 'is_published']
    search_fields = ['name', 'description']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['-start_date']

    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'list':
            return ExaminationListSerializer
        return ExaminationSerializer

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'exam_type',
            'academic_year',
            'grade_scale'
        )

    @action(detail=True, methods=['post'])
    def publish_results(self, request, pk=None):
        """Publish examination results"""
        examination = self.get_object()
        
        if examination.status != 'COMPLETED':
            return Response(
                {'error': 'Only completed examinations can have results published'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        examination.is_published = True
        examination.save()
        
        return Response({
            'message': 'Results published successfully',
            'examination': ExaminationSerializer(examination).data
        })

    @action(detail=True, methods=['post'])
    def unpublish_results(self, request, pk=None):
        """Unpublish examination results"""
        examination = self.get_object()
        examination.is_published = False
        examination.save()
        
        return Response({
            'message': 'Results unpublished',
            'examination': ExaminationSerializer(examination).data
        })

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get examination statistics"""
        examination = self.get_object()
        
        results = ExamResult.objects.filter(examination=examination)
        
        total_students = results.count()
        students_passed = results.filter(is_passed=True).count()
        students_failed = results.filter(is_passed=False).count()
        
        stats = results.aggregate(
            avg_percentage=Avg('percentage'),
            highest_percentage=Max('percentage'),
            lowest_percentage=Min('percentage')
        )
        
        pass_percentage = (students_passed / total_students * 100) if total_students > 0 else 0
        
        return Response({
            'examination_id': examination.id,
            'examination_name': examination.name,
            'total_students': total_students,
            'students_appeared': total_students,
            'students_passed': students_passed,
            'students_failed': students_failed,
            'pass_percentage': round(pass_percentage, 2),
            'average_percentage': round(stats['avg_percentage'] or 0, 2),
            'highest_percentage': round(stats['highest_percentage'] or 0, 2),
            'lowest_percentage': round(stats['lowest_percentage'] or 0, 2)
        })


class ExamScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exam schedules
    """
    queryset = ExamSchedule.objects.all()
    serializer_class = ExamScheduleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['examination', 'class_obj', 'section', 'subject', 'exam_date']
    ordering_fields = ['exam_date', 'start_time']
    ordering = ['exam_date', 'start_time']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'examination',
            'class_obj',
            'section',
            'subject'
        )

    @action(detail=False, methods=['get'])
    def by_class(self, request):
        """
        Get exam schedule for a specific class
        
        Query params:
        - examination_id: Examination ID
        - class_id: Class ID
        - section_id: Section ID
        """
        examination_id = request.query_params.get('examination_id')
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')
        
        if not all([examination_id, class_id, section_id]):
            return Response(
                {'error': 'examination_id, class_id, and section_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        schedules = self.queryset.filter(
            examination_id=examination_id,
            class_obj_id=class_id,
            section_id=section_id
        ).order_by('exam_date', 'start_time')
        
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)


class StudentMarkViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing student marks
    """
    queryset = StudentMark.objects.all()
    serializer_class = StudentMarkSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['exam_schedule', 'student', 'status', 'is_passed']
    ordering_fields = ['marks_obtained', 'percentage']
    ordering = ['exam_schedule', 'student']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'exam_schedule__examination',
            'exam_schedule__subject',
            'student',
            'entered_by'
        )

    def perform_create(self, serializer):
        """Set entered_by to current user"""
        serializer.save(entered_by=self.request.user)

    @action(detail=False, methods=['post'])
    def bulk_entry(self, request):
        """
        Bulk mark entry for a class
        
        Expected payload:
        {
            "exam_schedule_id": 1,
            "marks_data": [
                {
                    "student_id": 1,
                    "marks_obtained": 85,
                    "status": "PRESENT",
                    "remarks": ""
                },
                ...
            ]
        }
        """
        serializer = BulkMarkEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        exam_schedule_id = serializer.validated_data['exam_schedule_id']
        marks_data = serializer.validated_data['marks_data']
        
        exam_schedule = get_object_or_404(ExamSchedule, id=exam_schedule_id)
        
        created_count = 0
        updated_count = 0
        errors = []
        
        for entry in marks_data:
            try:
                mark, created = StudentMark.objects.update_or_create(
                    exam_schedule=exam_schedule,
                    student_id=entry['student_id'],
                    defaults={
                        'marks_obtained': entry.get('marks_obtained'),
                        'status': entry.get('status', 'PRESENT'),
                        'remarks': entry.get('remarks', ''),
                        'entered_by': request.user
                    }
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1
            except Exception as e:
                errors.append({
                    'student_id': entry['student_id'],
                    'error': str(e)
                })
        
        return Response({
            'message': 'Bulk mark entry completed',
            'created': created_count,
            'updated': updated_count,
            'errors': errors
        }, status=status.HTTP_201_CREATED if created_count > 0 else status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def by_student(self, request):
        """Get all marks for a student in an examination"""
        student_id = request.query_params.get('student_id')
        examination_id = request.query_params.get('examination_id')
        
        if not all([student_id, examination_id]):
            return Response(
                {'error': 'student_id and examination_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        marks = self.queryset.filter(
            student_id=student_id,
            exam_schedule__examination_id=examination_id
        )
        
        serializer = self.get_serializer(marks, many=True)
        return Response(serializer.data)


class ExamResultViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exam results
    """
    queryset = ExamResult.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['examination', 'student', 'class_obj', 'section', 'is_passed']
    ordering_fields = ['percentage', 'rank']
    ordering = ['-percentage']

    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'retrieve':
            return DetailedExamResultSerializer
        return ExamResultSerializer

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'examination',
            'student',
            'class_obj',
            'section'
        )

    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        """Recalculate result"""
        result = self.get_object()
        result.calculate_result()
        
        return Response({
            'message': 'Result recalculated successfully',
            'result': ExamResultSerializer(result).data
        })

    @action(detail=False, methods=['post'])
    def calculate_ranks(self, request):
        """
        Calculate ranks for an examination
        
        Query params:
        - examination_id: Examination ID
        - class_id: Class ID (optional)
        - section_id: Section ID (optional)
        """
        examination_id = request.query_params.get('examination_id')
        
        if not examination_id:
            return Response(
                {'error': 'examination_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        filters = {'examination_id': examination_id}
        
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')
        
        if class_id:
            filters['class_obj_id'] = class_id
        if section_id:
            filters['section_id'] = section_id
        
        results = ExamResult.objects.filter(**filters).order_by('-percentage')
        
        count = 0
        for rank, result in enumerate(results, 1):
            result.rank = rank
            result.save()
            count += 1
        
        return Response({
            'message': f'Ranks calculated for {count} student(s)',
            'count': count
        })

    @action(detail=False, methods=['get'])
    def class_results(self, request):
        """Get all results for a class"""
        examination_id = request.query_params.get('examination_id')
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')
        
        if not all([examination_id, class_id, section_id]):
            return Response(
                {'error': 'examination_id, class_id, and section_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = self.queryset.filter(
            examination_id=examination_id,
            class_obj_id=class_id,
            section_id=section_id
        ).order_by('rank')
        
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_results(self, request):
        """Get exam results for the logged-in student or parent's children"""
        user = request.user
        if user.user_type == 'STUDENT':
            student = getattr(user, 'student_profile', None)
            if not student:
                 # Fallback: Direct lookup if reverse relation fails
                 try:
                     from apps.students.models import Student
                     student = Student.objects.get(user_id=user.id)
                 except (ImportError, Student.DoesNotExist):
                     return Response({'error': 'Student profile not found'}, status=404)
            results = self.queryset.filter(student=student)
        elif user.user_type == 'PARENT':
            from apps.students.models import StudentParent
            student_ids = StudentParent.objects.filter(parent=user).values_list('student_id', flat=True)
            results = self.queryset.filter(student_id__in=student_ids)
        else:
            return Response({'error': 'Not authorized'}, status=403)
            
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)


class ReportCardTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing report card templates.
    Feature-gated: report_card_engine (PREMIUM).
    """
    queryset = ReportCardTemplate.objects.all()
    serializer_class = ReportCardTemplateSerializer
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'report_card_engine'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['academic_year', 'layout', 'is_active', 'is_default']
    search_fields = ['name']
    ordering = ['-is_default', 'name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ReportCardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing report cards.
    The generate/generate_bulk/download_pdf actions require report_card_engine feature.
    """
    queryset = ReportCard.objects.all()
    serializer_class = ReportCardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_cumulative', 'academic_year']
    ordering_fields = ['generated_at']
    ordering = ['-generated_at']

    def get_queryset(self):
        qs = self.queryset.select_related(
            'exam_result__examination',
            'exam_result__student',
            'student',
            'academic_year',
            'template',
            'generated_by',
        )
        user = self.request.user
        if user.user_type == 'STUDENT':
            student = getattr(user, 'student_profile', None)
            if student:
                qs = qs.filter(
                    Q(exam_result__student=student) | Q(student=student)
                )
        elif user.user_type == 'PARENT':
            from apps.students.models import StudentParent
            student_ids = StudentParent.objects.filter(
                parent=user
            ).values_list('student_id', flat=True)
            qs = qs.filter(
                Q(exam_result__student_id__in=student_ids) | Q(student_id__in=student_ids)
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate report card (single-exam or cumulative).

        Payload:
        {
            "exam_result_id": 1,        // for single-exam
            // OR
            "is_cumulative": true,
            "student_id": 1,
            "academic_year_id": 1,

            "template_id": 1,           // optional
            "teacher_remarks": "...",    // optional
            "principal_remarks": "...",  // optional
            "generate_pdf": true         // default true
        }
        """
        serializer = GenerateReportCardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        template = None
        if data.get('template_id'):
            template = get_object_or_404(ReportCardTemplate, id=data['template_id'])

        from .services.report_card_generator import ReportCardGenerator
        from .services.report_card_pdf import generate_report_card_pdf

        if data.get('is_cumulative'):
            from apps.students.models import Student
            from apps.academics.models import AcademicYear

            student = get_object_or_404(Student, id=data['student_id'])
            academic_year = get_object_or_404(AcademicYear, id=data['academic_year_id'])

            # Determine which exams to include
            examinations = Examination.objects.filter(
                academic_year=academic_year, status='COMPLETED'
            )
            if template and template.include_exam_types.exists():
                examinations = examinations.filter(
                    exam_type__in=template.include_exam_types.all()
                )

            generator = ReportCardGenerator(student, academic_year, template)
            report_data = generator.generate_cumulative(examinations)

            if not report_data:
                return Response(
                    {'error': 'No completed exam results found for this student.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            report_card, created = ReportCard.objects.update_or_create(
                student=student,
                academic_year=academic_year,
                is_cumulative=True,
                defaults={
                    'report_data': report_data,
                    'template': template,
                    'generated_by': request.user,
                    'teacher_remarks': data.get('teacher_remarks', ''),
                    'principal_remarks': data.get('principal_remarks', ''),
                }
            )
        else:
            exam_result = get_object_or_404(ExamResult, id=data['exam_result_id'])
            academic_year = exam_result.examination.academic_year
            student = exam_result.student

            generator = ReportCardGenerator(student, academic_year, template)
            report_data = generator.generate_single_exam(exam_result)

            report_card, created = ReportCard.objects.update_or_create(
                exam_result=exam_result,
                defaults={
                    'student': student,
                    'academic_year': academic_year,
                    'report_data': report_data,
                    'template': template,
                    'generated_by': request.user,
                    'teacher_remarks': data.get('teacher_remarks', ''),
                    'principal_remarks': data.get('principal_remarks', ''),
                }
            )

        # Generate PDF
        if data.get('generate_pdf', True):
            try:
                generate_report_card_pdf(report_card)
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning("PDF generation failed: %s", e)

        return Response({
            'message': 'Report card generated successfully',
            'report_card': ReportCardSerializer(report_card).data,
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def generate_bulk(self, request):
        """
        Generate report cards for all students in a class/section.

        Payload:
        {
            "examination_id": 1,
            "class_id": 1,
            "section_id": 1,
            "template_id": 1,      // optional
            "generate_pdf": true    // default true
        }
        """
        serializer = BulkGenerateReportCardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        examination = get_object_or_404(Examination, id=data['examination_id'])

        template = None
        if data.get('template_id'):
            template = get_object_or_404(ReportCardTemplate, id=data['template_id'])

        results = ExamResult.objects.filter(
            examination=examination,
            class_obj_id=data['class_id'],
            section_id=data['section_id'],
        ).select_related('student')

        if not results.exists():
            return Response(
                {'error': 'No exam results found for this class/section.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        from .services.report_card_generator import ReportCardGenerator
        from .services.report_card_pdf import generate_report_card_pdf

        generated = 0
        errors = []

        for result in results:
            try:
                generator = ReportCardGenerator(
                    result.student, examination.academic_year, template
                )
                report_data = generator.generate_single_exam(result)

                report_card, _ = ReportCard.objects.update_or_create(
                    exam_result=result,
                    defaults={
                        'student': result.student,
                        'academic_year': examination.academic_year,
                        'report_data': report_data,
                        'template': template,
                        'generated_by': request.user,
                    }
                )

                if data.get('generate_pdf', True):
                    try:
                        generate_report_card_pdf(report_card)
                    except Exception:
                        pass

                generated += 1
            except Exception as e:
                errors.append({
                    'student_id': result.student_id,
                    'error': str(e),
                })

        return Response({
            'message': f'Generated {generated} report card(s)',
            'generated': generated,
            'errors': errors,
        })

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        """Download report card PDF. Regenerates if missing."""
        report_card = self.get_object()

        if not report_card.pdf_file:
            from .services.report_card_pdf import generate_report_card_pdf
            success = generate_report_card_pdf(report_card)
            if not success:
                return Response(
                    {'error': 'PDF generation failed. Ensure reportlab is installed.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            report_card.refresh_from_db()

        from django.http import FileResponse
        return FileResponse(
            report_card.pdf_file.open('rb'),
            content_type='application/pdf',
            as_attachment=True,
            filename=report_card.pdf_file.name.split('/')[-1],
        )

    @action(detail=False, methods=['get'])
    def my_report_cards(self, request):
        """Get report cards for logged-in student or parent's children."""
        user = request.user
        if user.user_type == 'STUDENT':
            student = getattr(user, 'student_profile', None)
            if not student:
                try:
                    from apps.students.models import Student
                    student = Student.objects.get(user_id=user.id)
                except Exception:
                    return Response({'error': 'Student profile not found'}, status=404)
            cards = self.queryset.filter(
                Q(exam_result__student=student) | Q(student=student)
            )
        elif user.user_type == 'PARENT':
            from apps.students.models import StudentParent
            student_ids = StudentParent.objects.filter(
                parent=user
            ).values_list('student_id', flat=True)
            cards = self.queryset.filter(
                Q(exam_result__student_id__in=student_ids) | Q(student_id__in=student_ids)
            )
        else:
            return Response({'error': 'Not authorized'}, status=403)

        serializer = self.get_serializer(cards, many=True)
        return Response(serializer.data)


# ============================================================================
# AI EXAM SCHEDULER VIEWSETS
# ============================================================================

class ExamHallViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing exam halls.
    Feature-gated: ai_exam_scheduler (ENTERPRISE).
    """
    queryset = ExamHall.objects.all()
    serializer_class = ExamHallSerializer
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'ai_exam_scheduler'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_available', 'building', 'has_cctv', 'has_ac']
    search_fields = ['name', 'code', 'building']
    ordering = ['building', 'floor', 'name']

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get only available exam halls."""
        halls = self.queryset.filter(is_available=True)
        serializer = self.get_serializer(halls, many=True)
        return Response(serializer.data)


class ExamScheduleConfigViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AI exam schedule generation configs.
    Feature-gated: ai_exam_scheduler (ENTERPRISE).
    """
    queryset = ExamScheduleConfig.objects.all()
    serializer_class = ExamScheduleConfigSerializer
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'ai_exam_scheduler'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['examination', 'algorithm', 'is_active']
    search_fields = ['name']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def generate(self, request, pk=None):
        """
        Trigger AI exam schedule generation for this config.
        Creates a run and dispatches a Celery task.
        """
        config = self.get_object()

        # Check for already running generation
        active_run = ExamScheduleRun.objects.filter(
            config=config,
            status__in=['PENDING', 'VALIDATING', 'GENERATING', 'OPTIMIZING']
        ).first()

        if active_run:
            return Response({
                'error': 'A generation is already in progress for this config.',
                'run_id': str(active_run.id),
                'status': active_run.status,
            }, status=status.HTTP_409_CONFLICT)

        # Create a new run
        run = ExamScheduleRun.objects.create(
            config=config,
            triggered_by=request.user,
            status='PENDING',
        )

        # Dispatch Celery task
        from .tasks import generate_exam_schedule_task
        generate_exam_schedule_task.delay(str(run.id))

        return Response({
            'message': 'Exam schedule generation started.',
            'run_id': str(run.id),
        }, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['get'])
    def runs(self, request, pk=None):
        """List all generation runs for this config."""
        config = self.get_object()
        runs = ExamScheduleRun.objects.filter(config=config).order_by('-created_at')
        serializer = ExamScheduleRunSerializer(runs, many=True)
        return Response(serializer.data)


class ExamScheduleRunViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing exam schedule generation runs.
    Feature-gated: ai_exam_scheduler (ENTERPRISE).
    """
    queryset = ExamScheduleRun.objects.all()
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'ai_exam_scheduler'
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['config', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ExamScheduleRunDetailSerializer
        return ExamScheduleRunSerializer

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get current generation progress."""
        run = self.get_object()
        return Response({
            'run_id': str(run.id),
            'status': run.status,
            'progress_percent': run.progress_percent,
            'progress_message': run.progress_message,
            'fitness_score': run.fitness_score,
            'error_message': run.error_message,
        })

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """
        Apply a completed generated schedule to the examination.
        Creates ExamSchedule entries from the generated data.
        """
        run = self.get_object()

        if run.status != 'COMPLETED':
            return Response(
                {'error': 'Only completed runs can be applied.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if run.status == 'APPLIED':
            return Response(
                {'error': 'This schedule has already been applied.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        generated = run.generated_schedule
        if not generated or 'exams' not in generated:
            return Response(
                {'error': 'No generated schedule data found.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        config = run.config
        examination = config.examination

        # Snapshot existing schedule for rollback
        existing = ExamSchedule.objects.filter(
            examination=examination
        ).values(
            'id', 'class_obj_id', 'section_id', 'subject_id',
            'exam_date', 'start_time', 'end_time',
            'duration_minutes', 'max_marks', 'min_passing_marks',
            'room_number',
        )
        run.rollback_snapshot = {'schedules': list(existing)}

        # Create ExamSchedule entries
        created_count = 0
        errors_list = []
        hall_names = {}
        for hall in ExamHall.objects.filter(id__in=[
            h for e in generated['exams'] for h in e.get('hall_ids', [])
        ]):
            hall_names[str(hall.id)] = hall.code

        for exam_data in generated['exams']:
            # Get session times from config
            if exam_data['session'] == 'MORNING':
                start_time = config.morning_start
                end_time = config.morning_end
            else:
                start_time = config.afternoon_start or config.morning_start
                end_time = config.afternoon_end or config.morning_end

            room_str = ', '.join(
                hall_names.get(h, h) for h in exam_data.get('hall_ids', [])
            )

            # Create one ExamSchedule per section
            for section_id in exam_data.get('section_ids', []):
                try:
                    ExamSchedule.objects.update_or_create(
                        examination=examination,
                        class_obj_id=exam_data['class_id'],
                        section_id=section_id,
                        subject_id=exam_data['subject_id'],
                        defaults={
                            'exam_date': exam_data['date'],
                            'start_time': start_time,
                            'end_time': end_time,
                            'duration_minutes': exam_data.get('duration_minutes', 180),
                            'max_marks': exam_data.get('max_marks', 100),
                            'min_passing_marks': exam_data.get('min_passing_marks', 33),
                            'room_number': room_str,
                        }
                    )
                    created_count += 1
                except Exception as e:
                    errors_list.append({
                        'class_id': exam_data['class_id'],
                        'subject_id': exam_data['subject_id'],
                        'section_id': section_id,
                        'error': str(e),
                    })

        run.status = 'APPLIED'
        run.save(update_fields=['status', 'rollback_snapshot'])

        return Response({
            'message': f'Schedule applied. {created_count} exam schedule(s) created/updated.',
            'created': created_count,
            'errors': errors_list,
        })

    @action(detail=True, methods=['post'])
    def rollback(self, request, pk=None):
        """Rollback an applied schedule to the previous state."""
        run = self.get_object()

        if run.status != 'APPLIED':
            return Response(
                {'error': 'Only applied runs can be rolled back.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        snapshot = run.rollback_snapshot
        if not snapshot or 'schedules' not in snapshot:
            return Response(
                {'error': 'No rollback data available.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        examination = run.config.examination

        # Delete current schedules for this examination
        ExamSchedule.objects.filter(examination=examination).delete()

        # Restore from snapshot
        restored = 0
        for sched in snapshot['schedules']:
            sched_copy = {k: v for k, v in sched.items() if k != 'id'}
            sched_copy['examination'] = examination
            ExamSchedule.objects.create(**sched_copy)
            restored += 1

        run.status = 'ROLLED_BACK'
        run.save(update_fields=['status'])

        return Response({
            'message': f'Rolled back. {restored} schedule(s) restored.',
            'restored': restored,
        })
