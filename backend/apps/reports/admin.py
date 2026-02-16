from django.contrib import admin
from .models import ReportTemplate, GeneratedReport, ReportSchedule, SavedReport


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'module', 'default_format', 'is_system', 'is_active', 'created_by', 'created_at')
    list_filter = ('module', 'default_format', 'is_system', 'is_active')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(GeneratedReport)
class GeneratedReportAdmin(admin.ModelAdmin):
    list_display = ('name', 'module', 'output_format', 'status', 'file_size', 'row_count', 'generated_by', 'generated_at')
    list_filter = ('module', 'status', 'output_format')
    search_fields = ('name', 'description')
    readonly_fields = ('file_size', 'row_count', 'generated_at', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'


@admin.register(ReportSchedule)
class ReportScheduleAdmin(admin.ModelAdmin):
    list_display = ('name', 'template', 'frequency', 'is_active', 'last_run', 'next_run')
    list_filter = ('frequency', 'is_active')
    search_fields = ('name', 'template__name')
    readonly_fields = ('last_run', 'next_run', 'created_at', 'updated_at')


@admin.register(SavedReport)
class SavedReportAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'template', 'output_format', 'is_pinned', 'created_at')
    list_filter = ('is_pinned', 'output_format')
    search_fields = ('name', 'user__first_name', 'user__last_name')
    readonly_fields = ('created_at', 'updated_at')
