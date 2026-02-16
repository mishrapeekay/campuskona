from django.contrib import admin
from django.utils.html import format_html
from apps.students.models import (
    Student,
    StudentDocument,
    StudentParent,
    StudentHealthRecord,
    StudentNote
)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """
    Admin interface for Student model
    """
    list_display = [
        'admission_number',
        'get_full_name_display',
        'gender',
        'admission_date',
        'admission_status',
        'get_photo_display'
    ]
    list_filter = [
        'admission_status',
        'gender',
        'category',
        'religion',
        'admission_date',
        'is_differently_abled'
    ]
    search_fields = [
        'admission_number',
        'first_name',
        'last_name',
        'father_name',
        'mother_name',
        'email',
        'phone_number',
        'aadhar_number',
        'samagra_family_id',
        'samagra_member_id'
    ]
    readonly_fields = ['admission_number', 'created_at', 'updated_at']
    date_hierarchy = 'admission_date'

    fieldsets = (
        ('User Account', {
            'fields': ('user',)
        }),
        ('Admission Details', {
            'fields': (
                'admission_number',
                'admission_date',
                'admission_status'
            )
        }),
        ('Personal Information', {
            'fields': (
                'first_name',
                'middle_name',
                'last_name',
                'date_of_birth',
                'gender',
                'blood_group',
                'photo'
            )
        }),
        ('Contact Information', {
            'fields': (
                'phone_number',
                'emergency_contact_number',
                'email'
            )
        }),
        ('Current Address', {
            'fields': (
                'current_address_line1',
                'current_address_line2',
                'current_city',
                'current_state',
                'current_pincode'
            )
        }),
        ('Permanent Address', {
            'fields': (
                'permanent_address_line1',
                'permanent_address_line2',
                'permanent_city',
                'permanent_state',
                'permanent_pincode'
            )
        }),
        ('Family Details', {
            'fields': (
                'father_name',
                'father_occupation',
                'father_phone',
                'father_email',
                'father_annual_income',
                'mother_name',
                'mother_occupation',
                'mother_phone',
                'mother_email',
                'mother_annual_income',
                'guardian_name',
                'guardian_relation',
                'guardian_phone',
                'guardian_email'
            )
        }),
        ('Government IDs', {
            'fields': (
                'aadhar_number',
                'samagra_family_id',
                'samagra_member_id',
                'samagra_id_verified',
                'samagra_id_verification_date'
            ),
            'description': 'Samagra ID fields are only applicable for Madhya Pradesh students. Required for scholarships and welfare schemes.'
        }),
        ('Academic Background', {
            'fields': (
                'previous_school_name',
                'previous_school_board',
                'previous_class',
                'transfer_certificate_number'
            )
        }),
        ('Category & Religion', {
            'fields': ('category', 'religion')
        }),
        ('Special Needs', {
            'fields': (
                'is_differently_abled',
                'disability_details'
            )
        }),
        ('Medical Information', {
            'fields': ('medical_conditions',)
        }),
        ('Remarks', {
            'fields': ('remarks',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def get_full_name_display(self, obj):
        return obj.get_full_name()
    get_full_name_display.short_description = 'Full Name'
    get_full_name_display.admin_order_field = 'first_name'

    def get_current_class(self, obj):
        """
        Get current class for student
        Note: This requires StudentEnrollment model which may not be implemented yet
        """
        try:
            # Try to get enrollment if the method exists
            if hasattr(obj, 'get_current_class_enrollment'):
                enrollment = obj.get_current_class_enrollment()
                if enrollment and hasattr(enrollment, 'class_section'):
                    return enrollment.class_section.get_full_name()
        except Exception:
            pass
        return '-'
    get_current_class.short_description = 'Current Class'

    def get_photo_display(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" width="50" height="50" style="border-radius: 50%;" />',
                obj.photo.url
            )
        return '-'
    get_photo_display.short_description = 'Photo'


@admin.register(StudentDocument)
class StudentDocumentAdmin(admin.ModelAdmin):
    """
    Admin interface for Student Documents
    """
    list_display = [
        'student',
        'document_type',
        'document_name',
        'is_verified',
        'verified_by',
        'created_at'
    ]
    list_filter = [
        'document_type',
        'is_verified',
        'created_at'
    ]
    search_fields = [
        'student__admission_number',
        'student__first_name',
        'student__last_name',
        'document_name',
        'document_number'
    ]
    readonly_fields = ['verified_by', 'verified_at', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Student', {
            'fields': ('student',)
        }),
        ('Document Details', {
            'fields': (
                'document_type',
                'document_name',
                'document_file',
                'document_number',
                'issue_date',
                'expiry_date',
                'issued_by'
            )
        }),
        ('Verification', {
            'fields': (
                'is_verified',
                'verified_by',
                'verified_at'
            )
        }),
        ('Remarks', {
            'fields': ('remarks',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(StudentParent)
class StudentParentAdmin(admin.ModelAdmin):
    """
    Admin interface for Student-Parent relationships
    """
    list_display = [
        'student',
        'parent',
        'relation',
        'is_primary_contact',
        'is_emergency_contact',
        'can_pickup'
    ]
    list_filter = [
        'relation',
        'is_primary_contact',
        'is_emergency_contact',
        'can_pickup'
    ]
    search_fields = [
        'student__admission_number',
        'student__first_name',
        'student__last_name',
        'parent__first_name',
        'parent__last_name',
        'parent__email'
    ]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(StudentHealthRecord)
class StudentHealthRecordAdmin(admin.ModelAdmin):
    """
    Admin interface for Student Health Records
    """
    list_display = [
        'student',
        'checkup_date',
        'height',
        'weight',
        'conducted_by',
        'next_checkup_date'
    ]
    list_filter = ['checkup_date']
    search_fields = [
        'student__admission_number',
        'student__first_name',
        'student__last_name',
        'conducted_by'
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'checkup_date'

    fieldsets = (
        ('Student', {
            'fields': ('student',)
        }),
        ('Measurements', {
            'fields': ('height', 'weight')
        }),
        ('Medical Details', {
            'fields': (
                'vaccination_records',
                'allergies',
                'chronic_conditions',
                'medications'
            )
        }),
        ('Doctor Information', {
            'fields': (
                'family_doctor_name',
                'family_doctor_phone'
            )
        }),
        ('Vision & Dental', {
            'fields': (
                'vision_status',
                'dental_status'
            )
        }),
        ('Checkup Details', {
            'fields': (
                'checkup_date',
                'next_checkup_date',
                'conducted_by'
            )
        }),
        ('Remarks', {
            'fields': ('remarks',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(StudentNote)
class StudentNoteAdmin(admin.ModelAdmin):
    """
    Admin interface for Student Notes
    """
    list_display = [
        'student',
        'note_type',
        'title',
        'is_important',
        'is_private',
        'created_by',
        'created_at'
    ]
    list_filter = [
        'note_type',
        'is_important',
        'is_private',
        'created_at'
    ]
    search_fields = [
        'student__admission_number',
        'student__first_name',
        'student__last_name',
        'title',
        'content'
    ]
    readonly_fields = ['created_by', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Student', {
            'fields': ('student',)
        }),
        ('Note Details', {
            'fields': (
                'note_type',
                'title',
                'content',
                'is_important',
                'is_private'
            )
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
