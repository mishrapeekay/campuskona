"""
Views and ViewSets for Timetable Management
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q
from collections import defaultdict

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
from .serializers import (
    TimeSlotSerializer,
    ClassTimetableSerializer,
    ClassTimetableListSerializer,
    TeacherTimetableSerializer,
    TimetableSubstitutionSerializer,
    SubstitutionApprovalSerializer,
    RoomAllocationSerializer,
    TimetableTemplateSerializer,
    BulkTimetableSerializer,
    SubjectPeriodRequirementSerializer,
    SubjectPeriodRequirementBulkSerializer,
    TeacherAvailabilitySerializer,
    TeacherAvailabilityBulkSerializer,
    TimetableGenerationConfigSerializer,
    TimetableGenerationConfigListSerializer,
    TimetableGenerationRunSerializer,
    TimetableGenerationRunListSerializer,
    TimetableGenerationRunProgressSerializer,
    GenerationRunTriggerSerializer,
)
from apps.academics.models import Class, Section, AcademicYear, Subject
from apps.authentication.permissions import HasFeature


class TimeSlotViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing time slots
    """
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['slot_type', 'is_active']
    search_fields = ['name']
    ordering_fields = ['order', 'start_time']
    ordering = ['order']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active time slots"""
        slots = self.queryset.filter(is_active=True)
        serializer = self.get_serializer(slots, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def periods_only(self, request):
        """Get only period-type slots"""
        slots = self.queryset.filter(slot_type='PERIOD', is_active=True)
        serializer = self.get_serializer(slots, many=True)
        return Response(serializer.data)


class ClassTimetableViewSet(viewsets.ModelViewSet):
    """
    ViewSet for class timetable management
    """
    queryset = ClassTimetable.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['academic_year', 'class_obj', 'section', 'day_of_week', 'teacher', 'is_active']
    search_fields = ['subject__name', 'teacher__first_name', 'teacher__last_name', 'room_number']
    ordering_fields = ['day_of_week', 'time_slot__order']
    ordering = ['day_of_week', 'time_slot__order']

    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'list':
            return ClassTimetableListSerializer
        return ClassTimetableSerializer

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'academic_year',
            'class_obj',
            'section',
            'subject',
            'teacher',
            'time_slot'
        )

    @action(detail=False, methods=['get'])
    def weekly_view(self, request):
        """
        Get weekly timetable for a class
        
        Query params:
        - academic_year_id: Academic year ID
        - class_id: Class ID
        - section_id: Section ID
        """
        academic_year_id = request.query_params.get('academic_year_id')
        class_id = request.query_params.get('class_id')
        section_id = request.query_params.get('section_id')
        
        if not all([academic_year_id, class_id, section_id]):
            return Response(
                {'error': 'academic_year_id, class_id, and section_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get timetable entries
        entries = self.queryset.filter(
            academic_year_id=academic_year_id,
            class_obj_id=class_id,
            section_id=section_id,
            is_active=True
        ).select_related('time_slot', 'subject', 'teacher').order_by('time_slot__order')
        
        # Organize by day
        timetable = defaultdict(list)
        for entry in entries:
            timetable[entry.day_of_week].append({
                'id': entry.id,
                'time_slot': {
                    'id': entry.time_slot.id,
                    'name': entry.time_slot.name,
                    'start_time': entry.time_slot.start_time.strftime('%H:%M'),
                    'end_time': entry.time_slot.end_time.strftime('%H:%M'),
                    'type': entry.time_slot.slot_type
                },
                'subject': {
                    'id': entry.subject.id,
                    'name': entry.subject.name
                } if entry.subject else None,
                'teacher': {
                    'id': entry.teacher.id,
                    'name': entry.teacher.get_full_name()
                } if entry.teacher else None,
                'room_number': entry.room_number
            })
        
        # Get class and section info
        class_obj = get_object_or_404(Class, id=class_id)
        section = get_object_or_404(Section, id=section_id)
        
        return Response({
            'class_id': int(class_id),
            'section_id': int(section_id),
            'class_name': class_obj.name,
            'section_name': section.name,
            'timetable': dict(timetable)
        })

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Create multiple timetable entries at once
        
        Expected payload:
        {
            "academic_year_id": 1,
            "class_id": 1,
            "section_id": 1,
            "timetable_data": [
                {
                    "day_of_week": "MONDAY",
                    "time_slot_id": 1,
                    "subject_id": 1,
                    "teacher_id": 1,
                    "room_number": "101"
                },
                ...
            ]
        }
        """
        serializer = BulkTimetableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        academic_year_id = data['academic_year_id']
        class_id = data['class_id']
        section_id = data['section_id']
        timetable_data = data['timetable_data']
        
        # Verify academic year, class, and section exist
        academic_year = get_object_or_404(AcademicYear, id=academic_year_id)
        class_obj = get_object_or_404(Class, id=class_id)
        section = get_object_or_404(Section, id=section_id)
        
        created_count = 0
        errors = []
        warnings = []

        for entry_data in timetable_data:
            try:
                # Soft validation: warn if subject class_group doesn't match class's group
                subject_id = entry_data.get('subject_id')
                if subject_id and class_obj.class_group:
                    subj = Subject.objects.filter(id=subject_id, is_deleted=False).first()
                    if subj and subj.class_group and subj.class_group != class_obj.class_group:
                        warnings.append(
                            f"Subject '{subj.name}' is classified as "
                            f"'{subj.get_class_group_display()}' but assigned to "
                            f"'{class_obj.display_name}' ({class_obj.get_class_group_display() if hasattr(class_obj, 'get_class_group_display') else class_obj.class_group}). "
                            f"Saved anyway — verify this is intentional."
                        )

                entry, created = ClassTimetable.objects.update_or_create(
                    academic_year=academic_year,
                    class_obj=class_obj,
                    section=section,
                    day_of_week=entry_data['day_of_week'],
                    time_slot_id=entry_data['time_slot_id'],
                    defaults={
                        'subject_id': subject_id,
                        'teacher_id': entry_data.get('teacher_id'),
                        'room_number': entry_data.get('room_number', ''),
                        'is_active': True
                    }
                )
                if created:
                    created_count += 1
            except Exception as e:
                errors.append({
                    'entry': entry_data,
                    'error': str(e)
                })

        return Response({
            'message': 'Bulk creation completed',
            'created': created_count,
            'warnings': warnings,
            'errors': errors
        }, status=status.HTTP_201_CREATED if created_count > 0 else status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def check_conflicts(self, request):
        """
        Check for timetable conflicts
        
        Query params:
        - academic_year_id: Academic year ID
        - teacher_id: Teacher ID (optional)
        """
        academic_year_id = request.query_params.get('academic_year_id')
        teacher_id = request.query_params.get('teacher_id')
        
        if not academic_year_id:
            return Response(
                {'error': 'academic_year_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conflicts = []
        
        # Check for teacher conflicts (same teacher, same time, different classes)
        if teacher_id:
            entries = self.queryset.filter(
                academic_year_id=academic_year_id,
                teacher_id=teacher_id,
                is_active=True
            ).values('day_of_week', 'time_slot').annotate(
                count=models.Count('id')
            ).filter(count__gt=1)
            
            for entry in entries:
                conflicts.append({
                    'type': 'teacher_conflict',
                    'day': entry['day_of_week'],
                    'time_slot_id': entry['time_slot'],
                    'count': entry['count']
                })
        
        return Response({
            'conflicts': conflicts,
            'has_conflicts': len(conflicts) > 0
        })


class TeacherTimetableViewSet(viewsets.ModelViewSet):
    """
    ViewSet for teacher timetable
    """
    queryset = TeacherTimetable.objects.all()
    serializer_class = TeacherTimetableSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['academic_year', 'teacher', 'day_of_week', 'is_active']
    ordering_fields = ['day_of_week', 'time_slot__order']
    ordering = ['day_of_week', 'time_slot__order']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'academic_year',
            'teacher',
            'class_obj',
            'section',
            'subject',
            'time_slot'
        )

    @action(detail=False, methods=['get'])
    def my_timetable(self, request):
        """Get timetable for logged-in teacher"""
        user = request.user
        
        # Check if user is a teacher
        if not hasattr(user, 'staff_profile'):
            return Response(
                {'error': 'User is not a staff member'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get current academic year
        academic_year = AcademicYear.objects.filter(is_current=True).first()
        if not academic_year:
            return Response(
                {'error': 'No active academic year found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get teacher's timetable
        entries = self.queryset.filter(
            academic_year=academic_year,
            teacher=user.staff_profile,
            is_active=True
        ).order_by('day_of_week', 'time_slot__order')
        
        serializer = self.get_serializer(entries, many=True)
        return Response(serializer.data)


class TimetableSubstitutionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for timetable substitutions
    """
    queryset = TimetableSubstitution.objects.all()
    serializer_class = TimetableSubstitutionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'date', 'original_teacher', 'substitute_teacher']
    ordering_fields = ['date']
    ordering = ['-date']

    def get_queryset(self):
        """Optimize queryset"""
        return self.queryset.select_related(
            'academic_year',
            'original_entry',
            'original_teacher',
            'substitute_teacher',
            'requested_by',
            'approved_by'
        )

    def perform_create(self, serializer):
        """Set requested_by to current user"""
        serializer.save(requested_by=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a substitution"""
        substitution = self.get_object()
        
        if substitution.status != 'PENDING':
            return Response(
                {'error': 'Only pending substitutions can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = SubstitutionApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        remarks = serializer.validated_data.get('remarks', '')
        substitution.approve(request.user)
        if remarks:
            substitution.remarks = remarks
            substitution.save()
        
        return Response({
            'message': 'Substitution approved successfully',
            'substitution': TimetableSubstitutionSerializer(substitution).data
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a substitution"""
        substitution = self.get_object()
        
        if substitution.status != 'PENDING':
            return Response(
                {'error': 'Only pending substitutions can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = SubstitutionApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        remarks = serializer.validated_data.get('remarks', '')
        substitution.reject(request.user, remarks)
        
        return Response({
            'message': 'Substitution rejected',
            'substitution': TimetableSubstitutionSerializer(substitution).data
        })

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending substitutions"""
        pending = self.queryset.filter(status='PENDING')
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)


class RoomAllocationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for room allocations
    """
    queryset = RoomAllocation.objects.all()
    serializer_class = RoomAllocationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['room_type', 'is_available', 'building']
    search_fields = ['room_number', 'room_name', 'building']
    ordering_fields = ['room_number', 'capacity']
    ordering = ['building', 'floor', 'room_number']

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get only available rooms"""
        rooms = self.queryset.filter(is_available=True)
        serializer = self.get_serializer(rooms, many=True)
        return Response(serializer.data)


class TimetableTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for timetable templates
    """
    queryset = TimetableTemplate.objects.all()
    serializer_class = TimetableTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def apply_template(self, request, pk=None):
        """
        Apply template to a class
        
        Expected payload:
        {
            "academic_year_id": 1,
            "class_id": 1,
            "section_id": 1
        }
        """
        template = self.get_object()
        
        academic_year_id = request.data.get('academic_year_id')
        class_id = request.data.get('class_id')
        section_id = request.data.get('section_id')
        
        if not all([academic_year_id, class_id, section_id]):
            return Response(
                {'error': 'academic_year_id, class_id, and section_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Implement template application logic
        # This would create timetable entries based on the template

        return Response({
            'message': 'Template application not yet implemented',
            'template': template.name
        })


# ============================================================================
# AI TIMETABLE GENERATION VIEWSETS
# ============================================================================

class SubjectPeriodRequirementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing subject period requirements.
    These define how many periods per week each subject needs for each class.
    """
    queryset = SubjectPeriodRequirement.objects.all()
    serializer_class = SubjectPeriodRequirementSerializer
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'ai_timetable_generator'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['academic_year', 'class_obj', 'subject', 'requires_lab']
    search_fields = ['subject__name', 'class_obj__name']
    ordering_fields = ['class_obj__name', 'subject__name', 'periods_per_week']
    ordering = ['class_obj__name', 'subject__name']

    def get_queryset(self):
        return self.queryset.select_related(
            'academic_year', 'class_obj', 'subject', 'teacher'
        )

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Bulk create subject period requirements for a class.

        Expected payload:
        {
            "academic_year": <id>,
            "class_obj": <id>,
            "requirements": [
                {
                    "subject": <id>,
                    "periods_per_week": 5,
                    "teacher": <id>,  // optional
                    "requires_lab": false,
                    "consecutive_periods": 1
                }, ...
            ]
        }
        """
        serializer = SubjectPeriodRequirementBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        created = []
        errors = []
        for req in data['requirements']:
            try:
                obj, was_created = SubjectPeriodRequirement.objects.update_or_create(
                    academic_year=data['academic_year'],
                    class_obj=data['class_obj'],
                    subject_id=req['subject'],
                    defaults={
                        'periods_per_week': req.get('periods_per_week', 1),
                        'teacher_id': req.get('teacher'),
                        'requires_lab': req.get('requires_lab', False),
                        'preferred_room_type': req.get('preferred_room_type'),
                        'consecutive_periods': req.get('consecutive_periods', 1),
                        'preferred_time_slots': req.get('preferred_time_slots', []),
                    }
                )
                created.append(str(obj.id))
            except Exception as e:
                errors.append({'subject': req.get('subject'), 'error': str(e)})

        return Response({
            'created_or_updated': len(created),
            'errors': errors,
        }, status=status.HTTP_201_CREATED if created else status.HTTP_400_BAD_REQUEST)


class TeacherAvailabilityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing teacher availability.
    """
    queryset = TeacherAvailability.objects.all()
    serializer_class = TeacherAvailabilitySerializer
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'ai_timetable_generator'
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['academic_year', 'teacher', 'day_of_week', 'is_available']
    ordering_fields = ['teacher', 'day_of_week']
    ordering = ['teacher', 'day_of_week']

    def get_queryset(self):
        return self.queryset.select_related('academic_year', 'teacher')

    @action(detail=False, methods=['post'])
    def bulk_set(self, request):
        """
        Set full week availability for a teacher.

        Expected payload:
        {
            "academic_year": <id>,
            "teacher": <id>,
            "availability": [
                {
                    "day_of_week": "MONDAY",
                    "is_available": true,
                    "max_periods_per_day": 6,
                    "max_consecutive_periods": 3,
                    "available_from": "08:00",
                    "available_until": "16:00"
                }, ...
            ]
        }
        """
        serializer = TeacherAvailabilityBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        created = []
        for avail in data['availability']:
            obj, _ = TeacherAvailability.objects.update_or_create(
                academic_year=data['academic_year'],
                teacher=data['teacher'],
                day_of_week=avail['day_of_week'],
                defaults={
                    'is_available': avail.get('is_available', True),
                    'available_from': avail.get('available_from'),
                    'available_until': avail.get('available_until'),
                    'max_periods_per_day': avail.get('max_periods_per_day', 6),
                    'max_consecutive_periods': avail.get('max_consecutive_periods', 3),
                    'preferred_time_slots': avail.get('preferred_time_slots', []),
                    'notes': avail.get('notes', ''),
                }
            )
            created.append(str(obj.id))

        return Response({
            'set_count': len(created),
            'message': f'Availability set for {len(created)} days.',
        }, status=status.HTTP_200_OK)


class TimetableGenerationConfigViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing timetable generation configurations.
    """
    queryset = TimetableGenerationConfig.objects.all()
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'ai_timetable_generator'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['academic_year', 'algorithm', 'is_active']
    search_fields = ['name']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return TimetableGenerationConfigListSerializer
        return TimetableGenerationConfigSerializer

    def get_queryset(self):
        return self.queryset.prefetch_related('classes', 'sections', 'runs')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TimetableGenerationRunViewSet(viewsets.ModelViewSet):
    """
    ViewSet for timetable generation runs.
    Supports triggering generation, polling progress, previewing results,
    applying generated timetables, and rolling back.
    """
    queryset = TimetableGenerationRun.objects.all()
    permission_classes = [IsAuthenticated, HasFeature]
    required_feature = 'ai_timetable_generator'
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['config', 'status']
    ordering_fields = ['created_at', 'fitness_score']
    ordering = ['-created_at']
    http_method_names = ['get', 'post', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'list':
            return TimetableGenerationRunListSerializer
        if self.action == 'progress':
            return TimetableGenerationRunProgressSerializer
        return TimetableGenerationRunSerializer

    def get_queryset(self):
        return self.queryset.select_related('config', 'triggered_by')

    def create(self, request, *args, **kwargs):
        """
        Trigger a new timetable generation run.

        Payload: { "config_id": "<uuid>" }
        """
        serializer = GenerationRunTriggerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        config_id = serializer.validated_data['config_id']
        config = TimetableGenerationConfig.objects.filter(id=config_id).first()

        if not config:
            return Response(
                {'error': 'Configuration not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create the run record
        run = TimetableGenerationRun.objects.create(
            config=config,
            status='PENDING',
            triggered_by=request.user,
        )

        # Dispatch Celery task
        try:
            from .tasks import generate_timetable_task
            task = generate_timetable_task.delay(str(run.id))
            run.celery_task_id = task.id
            run.save(update_fields=['celery_task_id'])
        except Exception as e:
            run.status = 'FAILED'
            run.error_message = f'Failed to dispatch task: {str(e)}'
            run.save(update_fields=['status', 'error_message'])

        return Response(
            TimetableGenerationRunSerializer(run).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Lightweight progress polling endpoint."""
        run = self.get_object()
        serializer = TimetableGenerationRunProgressSerializer(run)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Preview the generated timetable in a structured format."""
        run = self.get_object()

        if run.status not in ('COMPLETED', 'APPLIED'):
            return Response(
                {'error': 'Timetable preview only available for completed runs.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'run_id': str(run.id),
            'config_name': run.config.name,
            'fitness_score': run.fitness_score,
            'conflicts_found': run.conflicts_found,
            'warnings': run.warnings,
            'timetable': run.generated_timetable,
        })

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """
        Apply the generated timetable to ClassTimetable + TeacherTimetable.
        Takes a snapshot of the current timetable for rollback.
        """
        run = self.get_object()

        if run.status != 'COMPLETED':
            return Response(
                {'error': 'Can only apply completed generation runs.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from .services import apply_generated_timetable
            result = apply_generated_timetable(run)
            return Response(result)
        except Exception as e:
            return Response(
                {'error': f'Failed to apply timetable: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def rollback(self, request, pk=None):
        """Rollback to the timetable state before this run was applied."""
        run = self.get_object()

        if run.status != 'APPLIED':
            return Response(
                {'error': 'Can only rollback applied generation runs.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from .services import rollback_generated_timetable
            result = rollback_generated_timetable(run)
            return Response(result)
        except Exception as e:
            return Response(
                {'error': f'Failed to rollback: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def analysis(self, request, pk=None):
        """Get conflict analysis and utilization stats for a completed run."""
        run = self.get_object()

        if run.status not in ('COMPLETED', 'APPLIED'):
            return Response(
                {'error': 'Analysis only available for completed runs.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from .services import analyze_generated_timetable
            result = analyze_generated_timetable(run)
            return Response(result)
        except Exception as e:
            return Response(
                {'error': f'Analysis failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a running generation task."""
        run = self.get_object()

        if run.status not in ('PENDING', 'VALIDATING', 'GENERATING', 'OPTIMIZING'):
            return Response(
                {'error': 'Can only cancel running generation tasks.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if run.celery_task_id:
            from celery.result import AsyncResult
            AsyncResult(run.celery_task_id).revoke(terminate=True)

        run.status = 'FAILED'
        run.error_message = 'Cancelled by user.'
        run.save(update_fields=['status', 'error_message'])

        return Response({'message': 'Generation run cancelled.'})
