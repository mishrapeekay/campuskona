"""
DPDP Act 2023 Compliance - Django Admin
Admin interfaces for consent management, grievances, and data breaches
"""
from django.contrib import admin
from django.utils.html import format_html
from apps.privacy.models import (
    ConsentPurpose,
    ParentalConsent,
    ConsentAuditLog,
    Grievance,
    GrievanceComment,
    DataBreach,
    DeletionRequest,
    CorrectionRequest,
)


@admin.register(ConsentPurpose)
class ConsentPurposeAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'is_mandatory', 'retention_period_days', 'is_active']
    list_filter = ['category', 'is_mandatory', 'is_active']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'description', 'category')
        }),
        ('Legal & Compliance', {
            'fields': ('is_mandatory', 'legal_basis', 'retention_period_days', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class ConsentAuditLogInline(admin.TabularInline):
    model = ConsentAuditLog
    extra = 0
    readonly_fields = ['action', 'performed_by', 'timestamp', 'ip_address', 'details']
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ParentalConsent)
class ParentalConsentAdmin(admin.ModelAdmin):
    list_display = [
        'consent_id',
        'student_link',
        'parent_link',
        'purpose',
        'consent_status',
        'verification_method',
        'consent_date',
    ]
    list_filter = [
        'consent_given',
        'withdrawn',
        'verification_method',
        'purpose__category',
    ]
    search_fields = [
        'consent_id',
        'student__first_name',
        'student__last_name',
        'parent_user__email',
    ]
    readonly_fields = [
        'consent_id',
        'consent_date',
        'verified_at',
        'withdrawn_at',
        'created_at',
        'updated_at',
    ]
    inlines = [ConsentAuditLogInline]

    fieldsets = (
        ('Consent Information', {
            'fields': ('consent_id', 'student', 'parent_user', 'purpose')
        }),
        ('Consent Status', {
            'fields': ('consent_given', 'consent_text', 'consent_date')
        }),
        ('Verification', {
            'fields': ('verification_method', 'verified_at', 'verification_data')
        }),
        ('Withdrawal', {
            'fields': ('withdrawn', 'withdrawn_at', 'withdrawal_reason')
        }),
        ('Audit Trail', {
            'fields': ('ip_address', 'user_agent', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def student_link(self, obj):
        return format_html(
            '<a href="/admin/students/student/{}/change/">{}</a>',
            obj.student.id,
            obj.student.full_name
        )
    student_link.short_description = 'Student'

    def parent_link(self, obj):
        return format_html(
            '<a href="/admin/authentication/user/{}/change/">{}</a>',
            obj.parent_user.id,
            obj.parent_user.get_full_name()
        )
    parent_link.short_description = 'Parent'

    def consent_status(self, obj):
        if obj.withdrawn:
            return format_html('<span style="color: red;">Withdrawn</span>')
        elif obj.consent_given:
            return format_html('<span style="color: green;">Given</span>')
        else:
            return format_html('<span style="color: orange;">Pending</span>')
    consent_status.short_description = 'Status'


@admin.register(ConsentAuditLog)
class ConsentAuditLogAdmin(admin.ModelAdmin):
    list_display = ['timestamp', 'action', 'consent', 'performed_by', 'ip_address']
    list_filter = ['action', 'timestamp']
    search_fields = ['consent__student__first_name', 'consent__student__last_name']
    readonly_fields = ['consent', 'action', 'performed_by', 'timestamp', 'details', 'ip_address']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class GrievanceCommentInline(admin.TabularInline):
    model = GrievanceComment
    extra = 1
    readonly_fields = ['created_at']


@admin.register(Grievance)
class GrievanceAdmin(admin.ModelAdmin):
    list_display = [
        'grievance_id',
        'subject',
        'category',
        'severity',
        'status_badge',
        'filed_by',
        'filed_at',
        'overdue_status',
    ]
    list_filter = ['status', 'severity', 'category', 'filed_at']
    search_fields = ['grievance_id', 'subject', 'description', 'filed_by__email']
    readonly_fields = ['grievance_id', 'filed_at', 'acknowledged_at', 'resolved_at']
    inlines = [GrievanceCommentInline]

    fieldsets = (
        ('Grievance Details', {
            'fields': ('grievance_id', 'student', 'filed_by', 'category', 'subject', 'description', 'severity')
        }),
        ('Status & Timeline', {
            'fields': ('status', 'filed_at', 'acknowledged_at', 'resolved_at')
        }),
        ('Assignment & Resolution', {
            'fields': ('assigned_to', 'resolved_by', 'resolution_notes')
        }),
    )

    def status_badge(self, obj):
        colors = {
            'SUBMITTED': 'orange',
            'ACKNOWLEDGED': 'blue',
            'UNDER_REVIEW': 'purple',
            'RESOLVED': 'green',
            'CLOSED': 'gray',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def overdue_status(self, obj):
        if obj.is_overdue():
            return format_html('<span style="color: red; font-weight: bold;">OVERDUE</span>')
        return format_html('<span style="color: green;">On Time</span>')
    overdue_status.short_description = 'Timeline'


@admin.register(DataBreach)
class DataBreachAdmin(admin.ModelAdmin):
    list_display = [
        'breach_id',
        'title',
        'breach_type',
        'severity',
        'status',
        'discovered_at',
        'notification_status',
    ]
    list_filter = ['severity', 'status', 'breach_type', 'discovered_at']
    search_fields = ['breach_id', 'title', 'description']
    readonly_fields = [
        'breach_id',
        'discovered_at',
        'contained_at',
        'reported_to_dpb_at',
        'parents_notified_at',
    ]
    filter_horizontal = ['students_affected']

    fieldsets = (
        ('Breach Information', {
            'fields': ('breach_id', 'title', 'description', 'breach_type', 'severity')
        }),
        ('Impact Assessment', {
            'fields': ('data_affected', 'students_affected_count', 'students_affected')
        }),
        ('Timeline', {
            'fields': ('discovered_at', 'contained_at', 'reported_to_dpb_at', 'parents_notified_at')
        }),
        ('Notifications', {
            'fields': ('dpb_notification_sent', 'parent_notifications_sent')
        }),
        ('Status & Remediation', {
            'fields': ('status', 'remediation_steps', 'lessons_learned')
        }),
    )

    def notification_status(self, obj):
        dpb_status = "✅ DPB Notified" if obj.dpb_notification_sent else "⏳ Pending"
        parent_status = "✅ Parents Notified" if obj.parent_notifications_sent else "⏳ Pending"

        if obj.is_notification_overdue():
            return format_html(
                '<span style="color: red; font-weight: bold;">OVERDUE: {} | {}</span>',
                dpb_status,
                parent_status
            )
        return format_html('{} | {}', dpb_status, parent_status)
    notification_status.short_description = 'Notifications'


@admin.register(DeletionRequest)
class DeletionRequestAdmin(admin.ModelAdmin):
    list_display = [
        'request_id',
        'student',
        'requested_by',
        'status',
        'requested_at',
        'completed_at',
    ]
    list_filter = ['status', 'requested_at']
    search_fields = ['request_id', 'student__first_name', 'student__last_name']
    readonly_fields = ['request_id', 'requested_at', 'reviewed_at', 'completed_at']

    fieldsets = (
        ('Request Information', {
            'fields': ('request_id', 'student', 'requested_by', 'reason')
        }),
        ('Status & Timeline', {
            'fields': ('status', 'requested_at', 'reviewed_at', 'completed_at')
        }),
        ('Processing', {
            'fields': ('completed_by', 'notes')
        }),
    )


@admin.register(CorrectionRequest)
class CorrectionRequestAdmin(admin.ModelAdmin):
    list_display = [
        'request_id',
        'student',
        'field_name',
        'requested_by',
        'status',
        'requested_at',
    ]
    list_filter = ['status', 'requested_at']
    search_fields = ['request_id', 'student__first_name', 'student__last_name', 'field_name']
    readonly_fields = ['request_id', 'requested_at', 'reviewed_at', 'completed_at']

    fieldsets = (
        ('Request Information', {
            'fields': ('request_id', 'student', 'requested_by', 'field_name', 'reason')
        }),
        ('Correction Details', {
            'fields': ('current_value', 'corrected_value')
        }),
        ('Status & Timeline', {
            'fields': ('status', 'requested_at', 'reviewed_at', 'completed_at')
        }),
        ('Processing', {
            'fields': ('completed_by', 'notes')
        }),
    )
