from django.contrib import admin
from .models import ReportGeneration, RTEComplianceRecord, UDISECodeMapping


@admin.register(ReportGeneration)
class ReportGenerationAdmin(admin.ModelAdmin):
    list_display = ('report_type', 'academic_year', 'generated_format', 'status', 'created_by', 'created_at')
    list_filter = ('report_type', 'status', 'generated_format', 'academic_year')
    search_fields = ('academic_year', 'created_by__email')
    readonly_fields = ('created_at', 'updated_at', 'created_by')

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(RTEComplianceRecord)
class RTEComplianceRecordAdmin(admin.ModelAdmin):
    list_display = (
        'academic_year', 'total_intake_capacity', 'reserved_seats_rte',
        'seats_filled_rte', 'compliance_percentage_display', 'verification_status'
    )
    list_filter = ('verification_status', 'academic_year')
    search_fields = ('academic_year',)
    readonly_fields = ('verification_date',)

    def compliance_percentage_display(self, obj):
        return f"{obj.compliance_percentage:.1f}%"
    compliance_percentage_display.short_description = 'Compliance %'


@admin.register(UDISECodeMapping)
class UDISECodeMappingAdmin(admin.ModelAdmin):
    list_display = ('category', 'internal_value', 'udise_code', 'udise_description')
    list_filter = ('category',)
    search_fields = ('internal_value', 'udise_code', 'udise_description')
