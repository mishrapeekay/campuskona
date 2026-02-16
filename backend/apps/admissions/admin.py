from django.contrib import admin
from .models import AdmissionEnquiry, AdmissionApplication, AdmissionDocument, AdmissionSetting


@admin.register(AdmissionEnquiry)
class AdmissionEnquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'class_applied', 'source', 'status', 'enquiry_date', 'follow_up_date']
    list_filter = ['status', 'source', 'enquiry_date']
    search_fields = ['name', 'phone', 'email']
    date_hierarchy = 'enquiry_date'


@admin.register(AdmissionApplication)
class AdmissionApplicationAdmin(admin.ModelAdmin):
    list_display = ['application_number', 'student_name', 'father_name', 'class_applied', 'status', 'submitted_date']
    list_filter = ['status', 'class_applied', 'academic_year', 'gender']
    search_fields = ['application_number', 'student_name', 'father_name', 'phone', 'email']
    date_hierarchy = 'created_at'
    readonly_fields = ['application_number']


@admin.register(AdmissionDocument)
class AdmissionDocumentAdmin(admin.ModelAdmin):
    list_display = ['application', 'document_type', 'verified', 'uploaded_at', 'verified_by']
    list_filter = ['document_type', 'verified']
    search_fields = ['application__application_number', 'application__student_name']


@admin.register(AdmissionSetting)
class AdmissionSettingAdmin(admin.ModelAdmin):
    list_display = ['academic_year', 'class_applied', 'total_seats', 'filled_seats', 'application_start_date', 'application_end_date']
    list_filter = ['academic_year', 'entrance_test_required', 'interview_required']
