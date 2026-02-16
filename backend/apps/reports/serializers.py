from rest_framework import serializers
from .models import ReportTemplate, GeneratedReport, ReportSchedule, SavedReport


class ReportTemplateSerializer(serializers.ModelSerializer):
    module_display = serializers.CharField(source='get_module_display', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True, default=''
    )
    schedules_count = serializers.SerializerMethodField()

    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'module', 'module_display',
            'query_config', 'layout_config', 'default_format',
            'is_system', 'is_active', 'created_by', 'created_by_name',
            'schedules_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_schedules_count(self, obj):
        return obj.schedules.filter(is_active=True).count()


class ReportTemplateListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing templates."""
    module_display = serializers.CharField(source='get_module_display', read_only=True)

    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'module', 'module_display',
            'default_format', 'is_system', 'is_active', 'created_at',
        ]


class GeneratedReportSerializer(serializers.ModelSerializer):
    module_display = serializers.CharField(source='get_module_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    format_display = serializers.CharField(source='get_output_format_display', read_only=True)
    generated_by_name = serializers.CharField(
        source='generated_by.get_full_name', read_only=True, default=''
    )
    template_name = serializers.CharField(
        source='template.name', read_only=True, default=''
    )

    class Meta:
        model = GeneratedReport
        fields = [
            'id', 'template', 'template_name', 'name', 'description',
            'module', 'module_display', 'parameters', 'output_format',
            'format_display', 'file', 'file_size', 'row_count',
            'status', 'status_display', 'error_message',
            'generated_by', 'generated_by_name', 'generated_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'file', 'file_size', 'row_count', 'status',
            'error_message', 'generated_at', 'created_at', 'updated_at',
        ]


class GenerateReportRequestSerializer(serializers.Serializer):
    """Serializer for the report generation request."""
    template_id = serializers.UUIDField(required=False, help_text='Template to use')
    name = serializers.CharField(max_length=300)
    module = serializers.ChoiceField(choices=ReportTemplate.MODULE_CHOICES)
    parameters = serializers.JSONField(default=dict)
    output_format = serializers.ChoiceField(
        choices=GeneratedReport.FORMAT_CHOICES, default='PDF'
    )


class ReportScheduleSerializer(serializers.ModelSerializer):
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    created_by_name = serializers.CharField(
        source='created_by.get_full_name', read_only=True, default=''
    )

    class Meta:
        model = ReportSchedule
        fields = [
            'id', 'template', 'template_name', 'name', 'frequency',
            'frequency_display', 'day_of_week', 'day_of_month',
            'time_of_day', 'output_format', 'parameters',
            'email_recipients', 'is_active', 'last_run', 'next_run',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'last_run', 'next_run', 'created_at', 'updated_at']

    def validate(self, data):
        frequency = data.get('frequency')
        if frequency == 'WEEKLY' and data.get('day_of_week') is None:
            raise serializers.ValidationError(
                {'day_of_week': 'Day of week is required for weekly schedules.'}
            )
        if frequency in ('MONTHLY', 'QUARTERLY', 'YEARLY') and data.get('day_of_month') is None:
            raise serializers.ValidationError(
                {'day_of_month': 'Day of month is required for monthly/quarterly/yearly schedules.'}
            )
        return data


class SavedReportSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True, default='')

    class Meta:
        model = SavedReport
        fields = [
            'id', 'user', 'name', 'template', 'template_name',
            'parameters', 'output_format', 'is_pinned',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
