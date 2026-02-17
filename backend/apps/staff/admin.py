from django.contrib import admin
from django.utils.html import format_html
from apps.staff.models import StaffMember, StaffDocument


@admin.register(StaffMember)
class StaffMemberAdmin(admin.ModelAdmin):
    list_display = (
        'employee_id', 'get_full_name', 'designation', 'department',
        'joining_date', 'employment_status', 'employment_type', 'get_photo'
    )
    list_filter = ('department', 'designation', 'employment_status', 'employment_type', 'gender', 'is_class_teacher')
    search_fields = ('employee_id', 'first_name', 'last_name', 'email', 'phone_number')
    readonly_fields = ('employee_id', 'created_at', 'updated_at')
    autocomplete_fields = ['user']
    date_hierarchy = 'joining_date'

    fieldsets = (
        ('Account', {
            'fields': ('user', 'employee_id')
        }),
        ('Personal Information', {
            'fields': (
                ('first_name', 'middle_name', 'last_name'),
                ('date_of_birth', 'gender', 'blood_group', 'marital_status'),
                'photo',
            )
        }),
        ('Contact Details', {
            'fields': (
                ('phone_number', 'alternate_phone'),
                'email',
                ('emergency_contact_name', 'emergency_contact_number', 'emergency_contact_relation'),
            )
        }),
        ('Current Address', {
            'fields': (
                'current_address_line1', 'current_address_line2',
                ('current_city', 'current_state', 'current_pincode'),
            ),
            'classes': ('collapse',)
        }),
        ('Permanent Address', {
            'fields': (
                'permanent_address_line1', 'permanent_address_line2',
                ('permanent_city', 'permanent_state', 'permanent_pincode'),
            ),
            'classes': ('collapse',)
        }),
        ('Job Details', {
            'fields': (
                ('department', 'designation'),
                ('joining_date', 'employment_type', 'employment_status'),
                ('probation_period_months', 'probation_end_date'),
                ('notice_period_days', 'exit_date'),
                'exit_reason',
            )
        }),
        ('Qualifications & Teaching', {
            'fields': (
                # Correct field names: highest_qualification, teaching_experience_years
                ('highest_qualification', 'university', 'specialization'),
                'teaching_experience_years',
                'is_class_teacher',
                'subjects_taught',
            )
        }),
        ('Salary & Bank', {
            'fields': (
                'basic_salary',
                # Correct field names: bank_account_number, bank_ifsc_code
                ('bank_name', 'bank_branch'),
                ('bank_account_number', 'bank_ifsc_code'),
            )
        }),
        ('Government IDs', {
            'fields': ('aadhar_number', 'pan_number'),
            'classes': ('collapse',)
        }),
        ('Remarks', {
            'fields': ('remarks',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    get_full_name.short_description = 'Name'
    get_full_name.admin_order_field = 'first_name'

    def get_photo(self, obj):
        if obj.photo:
            try:
                return format_html(
                    '<img src="{}" width="40" height="40" style="border-radius:50%;" />',
                    obj.photo.url
                )
            except Exception:
                return "-"
        return "-"
    get_photo.short_description = 'Photo'


@admin.register(StaffDocument)
class StaffDocumentAdmin(admin.ModelAdmin):
    list_display = ('staff_member', 'document_type', 'document_name', 'is_verified', 'verified_by', 'created_at')
    list_filter = ('document_type', 'is_verified')
    search_fields = ('staff_member__employee_id', 'staff_member__first_name', 'staff_member__last_name', 'document_name')
    readonly_fields = ('verified_by', 'verified_at', 'created_at', 'updated_at')
