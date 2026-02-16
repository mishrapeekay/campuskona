from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count, Q

from .models import ReportTemplate, GeneratedReport, ReportSchedule, SavedReport
from .serializers import (
    ReportTemplateSerializer, ReportTemplateListSerializer,
    GeneratedReportSerializer, GenerateReportRequestSerializer,
    ReportScheduleSerializer, SavedReportSerializer,
)
from apps.core.i18n.utils import LanguageResolver


class ReportTemplateViewSet(viewsets.ModelViewSet):
    """
    CRUD for report templates.
    Supports filtering by module, system/user templates.
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['module', 'is_system', 'is_active', 'default_format']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'module', 'created_at']
    ordering = ['module', 'name']

    def get_queryset(self):
        return ReportTemplate.objects.filter(is_deleted=False)

    def get_serializer_class(self):
        if self.action == 'list':
            return ReportTemplateListSerializer
        return ReportTemplateSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'])
    def by_module(self, request):
        """Get templates grouped by module."""
        templates = self.get_queryset().filter(is_active=True)
        module_groups = {}
        for choice_value, choice_label in ReportTemplate.MODULE_CHOICES:
            module_templates = templates.filter(module=choice_value)
            if module_templates.exists():
                module_groups[choice_value] = {
                    'label': choice_label,
                    'count': module_templates.count(),
                    'templates': ReportTemplateListSerializer(module_templates, many=True).data,
                }
        return Response(module_groups)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a template to create a new custom version."""
        template = self.get_object()
        new_template = ReportTemplate.objects.create(
            name=f"Copy of {template.name}",
            description=template.description,
            module=template.module,
            query_config=template.query_config,
            layout_config=template.layout_config,
            default_format=template.default_format,
            is_system=False,
            created_by=request.user,
        )
        return Response(
            ReportTemplateSerializer(new_template).data,
            status=status.HTTP_201_CREATED
        )


class GeneratedReportViewSet(viewsets.ModelViewSet):
    """
    Manage generated reports.
    Supports generating new reports from templates or ad-hoc configurations.
    """
    serializer_class = GeneratedReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['module', 'status', 'output_format', 'generated_by']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'generated_at', 'file_size']
    ordering = ['-created_at']

    def get_queryset(self):
        return GeneratedReport.objects.filter(is_deleted=False).select_related(
            'template', 'generated_by'
        )

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate a new report. In production this would trigger an async task.
        For now it creates a PENDING record.
        """
        serializer = GenerateReportRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        template = None
        if data.get('template_id'):
            try:
                template = ReportTemplate.objects.get(
                    id=data['template_id'], is_deleted=False
                )
            except ReportTemplate.DoesNotExist:
                return Response(
                    {'error': 'Template not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )

        report = GeneratedReport.objects.create(
            template=template,
            name=data['name'],
            module=data['module'],
            parameters={
                **data.get('parameters', {}),
                'language': LanguageResolver.resolve_language(request.user)
            },
            output_format=data.get('output_format', 'PDF'),
            status='PENDING',
            generated_by=request.user,
        )

        # TODO: Trigger async report generation task (Celery)
        # generate_report_task.delay(report.id)

        return Response(
            GeneratedReportSerializer(report).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def regenerate(self, request, pk=None):
        """Re-generate a previously generated report with the same parameters."""
        original = self.get_object()
        new_report = GeneratedReport.objects.create(
            template=original.template,
            name=f"{original.name} (Regenerated)",
            description=original.description,
            module=original.module,
            parameters=original.parameters,
            output_format=original.output_format,
            status='PENDING',
            generated_by=request.user,
        )
        return Response(
            GeneratedReportSerializer(new_report).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Report generation statistics."""
        qs = self.get_queryset()
        total = qs.count()
        by_status = dict(
            qs.values_list('status').annotate(count=Count('id')).values_list('status', 'count')
        )
        by_module = dict(
            qs.values_list('module').annotate(count=Count('id')).values_list('module', 'count')
        )
        by_format = dict(
            qs.values_list('output_format').annotate(count=Count('id')).values_list('output_format', 'count')
        )
        return Response({
            'total': total,
            'by_status': by_status,
            'by_module': by_module,
            'by_format': by_format,
        })


class ReportScheduleViewSet(viewsets.ModelViewSet):
    """
    CRUD for report schedules — automated periodic report generation.
    """
    serializer_class = ReportScheduleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['frequency', 'is_active', 'template']
    search_fields = ['name']
    ordering_fields = ['name', 'next_run', 'frequency']
    ordering = ['name']

    def get_queryset(self):
        return ReportSchedule.objects.filter(is_deleted=False).select_related(
            'template', 'created_by'
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle schedule active/inactive status."""
        schedule = self.get_object()
        schedule.is_active = not schedule.is_active
        schedule.save(update_fields=['is_active', 'updated_at'])
        return Response(ReportScheduleSerializer(schedule).data)

    @action(detail=True, methods=['post'])
    def run_now(self, request, pk=None):
        """Manually trigger a scheduled report generation."""
        schedule = self.get_object()
        report = GeneratedReport.objects.create(
            template=schedule.template,
            name=f"{schedule.name} - Manual Run ({timezone.now().strftime('%Y-%m-%d %H:%M')})",
            module=schedule.template.module,
            parameters=schedule.parameters,
            output_format=schedule.output_format,
            status='PENDING',
            generated_by=request.user,
        )
        schedule.last_run = timezone.now()
        schedule.save(update_fields=['last_run', 'updated_at'])

        # TODO: Trigger async report generation task (Celery)
        # generate_report_task.delay(report.id)

        return Response({
            'message': 'Report generation triggered.',
            'report': GeneratedReportSerializer(report).data,
        })


class SavedReportViewSet(viewsets.ModelViewSet):
    """
    User-saved/bookmarked reports for quick access and dashboard pinning.
    """
    serializer_class = SavedReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_pinned', 'output_format']
    search_fields = ['name']
    ordering_fields = ['name', 'is_pinned', 'created_at']
    ordering = ['-is_pinned', 'name']

    def get_queryset(self):
        return SavedReport.objects.filter(
            is_deleted=False,
            user=self.request.user
        ).select_related('template')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_pin(self, request, pk=None):
        """Toggle pinned state for a saved report."""
        saved = self.get_object()
        saved.is_pinned = not saved.is_pinned
        saved.save(update_fields=['is_pinned', 'updated_at'])
        return Response(SavedReportSerializer(saved).data)

    @action(detail=False, methods=['get'])
    def pinned(self, request):
        """Get all pinned reports for the current user."""
        pinned = self.get_queryset().filter(is_pinned=True)
        return Response(SavedReportSerializer(pinned, many=True).data)
