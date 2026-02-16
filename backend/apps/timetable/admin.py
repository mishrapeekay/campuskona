"""
Admin interface for Timetable models
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from apps.timetable.models import (
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


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    """Admin interface for Time Slots"""
    list_display = [
        'name',
        'slot_type',
        'start_time',
        'end_time',
        'duration_minutes',
        'order',
        'is_active'
    ]
    list_filter = ['slot_type', 'is_active']
    search_fields = ['name']
    ordering = ['order', 'start_time']
    list_editable = ['order', 'is_active']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slot_type', 'order')
        }),
        ('Time Details', {
            'fields': ('start_time', 'end_time', 'duration_minutes')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    readonly_fields = ['duration_minutes']


@admin.register(ClassTimetable)
class ClassTimetableAdmin(admin.ModelAdmin):
    """Admin interface for Class Timetable"""
    list_display = [
        'class_section',
        'day_of_week',
        'time_slot',
        'subject',
        'teacher_name',
        'room_number',
        'is_active_badge'
    ]
    list_filter = [
        'academic_year',
        'day_of_week',
        'class_obj',
        'section',
        'is_active'
    ]
    search_fields = [
        'class_obj__name',
        'section__name',
        'subject__name',
        'teacher__first_name',
        'teacher__last_name',
        'room_number'
    ]
    autocomplete_fields = ['class_obj', 'section', 'subject', 'teacher']
    ordering = ['day_of_week', 'time_slot__order']
    
    fieldsets = (
        ('Class Information', {
            'fields': ('academic_year', 'class_obj', 'section')
        }),
        ('Schedule', {
            'fields': ('day_of_week', 'time_slot')
        }),
        ('Assignment', {
            'fields': ('subject', 'teacher', 'room_number')
        }),
        ('Additional', {
            'fields': ('is_active', 'remarks')
        }),
    )

    def class_section(self, obj):
        """Display class and section"""
        return f"{obj.class_obj.name} - {obj.section.name}"
    class_section.short_description = 'Class'

    def teacher_name(self, obj):
        """Display teacher name"""
        return obj.teacher.get_full_name() if obj.teacher else '-'
    teacher_name.short_description = 'Teacher'

    def is_active_badge(self, obj):
        """Display active status"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Active</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Inactive</span>'
        )
    is_active_badge.short_description = 'Status'

    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related(
            'academic_year',
            'class_obj',
            'section',
            'subject',
            'teacher',
            'time_slot'
        )


@admin.register(TeacherTimetable)
class TeacherTimetableAdmin(admin.ModelAdmin):
    """Admin interface for Teacher Timetable"""
    list_display = [
        'teacher_name',
        'day_of_week',
        'time_slot',
        'class_section',
        'subject',
        'room_number',
        'is_active_badge'
    ]
    list_filter = [
        'academic_year',
        'day_of_week',
        'teacher',
        'is_active'
    ]
    search_fields = [
        'teacher__first_name',
        'teacher__last_name',
        'teacher__employee_id',
        'subject__name',
        'class_obj__name'
    ]
    autocomplete_fields = ['teacher', 'class_obj', 'section', 'subject']
    ordering = ['teacher', 'day_of_week', 'time_slot__order']

    fieldsets = (
        ('Teacher Information', {
            'fields': ('academic_year', 'teacher')
        }),
        ('Schedule', {
            'fields': ('day_of_week', 'time_slot')
        }),
        ('Class Details', {
            'fields': ('class_obj', 'section', 'subject', 'room_number')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )

    def teacher_name(self, obj):
        """Display teacher name"""
        return obj.teacher.get_full_name()
    teacher_name.short_description = 'Teacher'

    def class_section(self, obj):
        """Display class and section"""
        return f"{obj.class_obj.name} - {obj.section.name}"
    class_section.short_description = 'Class'

    def is_active_badge(self, obj):
        """Display active status"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Active</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Inactive</span>'
        )
    is_active_badge.short_description = 'Status'

    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related(
            'academic_year',
            'teacher',
            'class_obj',
            'section',
            'subject',
            'time_slot'
        )


@admin.register(TimetableSubstitution)
class TimetableSubstitutionAdmin(admin.ModelAdmin):
    """Admin interface for Timetable Substitutions"""
    list_display = [
        'date',
        'original_teacher_name',
        'substitute_teacher_name',
        'class_info',
        'status_badge',
        'requested_by_name'
    ]
    list_filter = ['status', 'date', 'academic_year']
    search_fields = [
        'original_teacher__first_name',
        'original_teacher__last_name',
        'substitute_teacher__first_name',
        'substitute_teacher__last_name',
        'reason'
    ]
    autocomplete_fields = ['original_teacher', 'substitute_teacher']
    date_hierarchy = 'date'
    ordering = ['-date']
    
    fieldsets = (
        ('Substitution Details', {
            'fields': ('academic_year', 'original_entry', 'date')
        }),
        ('Teachers', {
            'fields': ('original_teacher', 'substitute_teacher')
        }),
        ('Request Information', {
            'fields': ('reason', 'status', 'requested_by')
        }),
        ('Approval', {
            'fields': ('approved_by', 'approved_at', 'remarks')
        }),
    )
    
    readonly_fields = ['requested_by', 'approved_by', 'approved_at']
    
    actions = ['approve_substitutions', 'reject_substitutions']

    def original_teacher_name(self, obj):
        """Display original teacher"""
        return obj.original_teacher.get_full_name()
    original_teacher_name.short_description = 'Original Teacher'

    def substitute_teacher_name(self, obj):
        """Display substitute teacher"""
        return obj.substitute_teacher.get_full_name()
    substitute_teacher_name.short_description = 'Substitute Teacher'

    def class_info(self, obj):
        """Display class information"""
        entry = obj.original_entry
        return f"{entry.class_obj.name} {entry.section.name} - {entry.time_slot.name}"
    class_info.short_description = 'Class & Time'

    def requested_by_name(self, obj):
        """Display requester name"""
        return obj.requested_by.get_full_name() if obj.requested_by else '-'
    requested_by_name.short_description = 'Requested By'

    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'PENDING': '#ffc107',
            'APPROVED': '#28a745',
            'REJECTED': '#dc3545',
            'COMPLETED': '#17a2b8',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def approve_substitutions(self, request, queryset):
        """Bulk approve substitutions"""
        count = 0
        for substitution in queryset.filter(status='PENDING'):
            substitution.approve(request.user)
            count += 1
        self.message_user(request, f'{count} substitution(s) approved successfully.')
    approve_substitutions.short_description = 'Approve selected substitutions'

    def reject_substitutions(self, request, queryset):
        """Bulk reject substitutions"""
        count = 0
        for substitution in queryset.filter(status='PENDING'):
            substitution.reject(request.user)
            count += 1
        self.message_user(request, f'{count} substitution(s) rejected.')
    reject_substitutions.short_description = 'Reject selected substitutions'

    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related(
            'academic_year',
            'original_entry',
            'original_teacher',
            'substitute_teacher',
            'requested_by',
            'approved_by'
        )


@admin.register(RoomAllocation)
class RoomAllocationAdmin(admin.ModelAdmin):
    """Admin interface for Room Allocations"""
    list_display = [
        'room_number',
        'room_name',
        'room_type',
        'floor',
        'building',
        'capacity',
        'is_available'
    ]
    list_filter = ['room_type', 'is_available', 'building']
    search_fields = ['room_number', 'room_name', 'building']
    ordering = ['building', 'floor', 'room_number']
    list_editable = ['is_available']
    
    fieldsets = (
        ('Room Information', {
            'fields': ('room_number', 'room_name', 'room_type')
        }),
        ('Location', {
            'fields': ('building', 'floor')
        }),
        ('Capacity & Facilities', {
            'fields': ('capacity', 'facilities')
        }),
        ('Status', {
            'fields': ('is_available', 'remarks')
        }),
    )


@admin.register(TimetableTemplate)
class TimetableTemplateAdmin(admin.ModelAdmin):
    """Admin interface for Timetable Templates"""
    list_display = [
        'name',
        'created_by_name',
        'is_active_badge',
        'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Template Information', {
            'fields': ('name', 'description')
        }),
        ('Template Data', {
            'fields': ('template_data',)
        }),
        ('Status', {
            'fields': ('is_active', 'created_by')
        }),
    )
    
    readonly_fields = ['created_by']

    def created_by_name(self, obj):
        """Display creator name"""
        return obj.created_by.get_full_name() if obj.created_by else '-'
    created_by_name.short_description = 'Created By'

    def is_active_badge(self, obj):
        """Display active status"""
        if obj.is_active:
            return format_html(
                '<span style="background-color: #28a745; color: white; padding: 3px 10px; border-radius: 3px;">Active</span>'
            )
        return format_html(
            '<span style="background-color: #6c757d; color: white; padding: 3px 10px; border-radius: 3px;">Inactive</span>'
        )
    is_active_badge.short_description = 'Status'


# ============================================================================
# AI TIMETABLE GENERATION ADMIN
# ============================================================================

@admin.register(SubjectPeriodRequirement)
class SubjectPeriodRequirementAdmin(admin.ModelAdmin):
    """Admin for Subject Period Requirements"""
    list_display = [
        'class_name', 'subject_name', 'teacher_name',
        'periods_per_week', 'requires_lab', 'consecutive_periods',
    ]
    list_filter = ['academic_year', 'class_obj', 'requires_lab']
    search_fields = ['subject__name', 'class_obj__name', 'teacher__first_name']
    autocomplete_fields = ['class_obj', 'subject', 'teacher']
    ordering = ['class_obj__name', 'subject__name']

    fieldsets = (
        ('Assignment', {
            'fields': ('academic_year', 'class_obj', 'subject', 'teacher')
        }),
        ('Requirements', {
            'fields': (
                'periods_per_week', 'requires_lab',
                'preferred_room_type', 'consecutive_periods',
                'preferred_time_slots'
            )
        }),
    )

    def class_name(self, obj):
        return obj.class_obj.name
    class_name.short_description = 'Class'

    def subject_name(self, obj):
        return obj.subject.name
    subject_name.short_description = 'Subject'

    def teacher_name(self, obj):
        return obj.teacher.get_full_name() if obj.teacher else '-'
    teacher_name.short_description = 'Teacher'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'academic_year', 'class_obj', 'subject', 'teacher'
        )


@admin.register(TeacherAvailability)
class TeacherAvailabilityAdmin(admin.ModelAdmin):
    """Admin for Teacher Availability"""
    list_display = [
        'teacher_name', 'day_of_week', 'is_available',
        'max_periods_per_day', 'max_consecutive_periods',
        'available_from', 'available_until',
    ]
    list_filter = ['academic_year', 'day_of_week', 'is_available']
    search_fields = ['teacher__first_name', 'teacher__last_name', 'teacher__employee_id']
    autocomplete_fields = ['teacher']
    ordering = ['teacher', 'day_of_week']
    list_editable = ['is_available', 'max_periods_per_day']

    fieldsets = (
        ('Teacher & Day', {
            'fields': ('academic_year', 'teacher', 'day_of_week')
        }),
        ('Availability', {
            'fields': (
                'is_available', 'available_from', 'available_until',
                'max_periods_per_day', 'max_consecutive_periods',
            )
        }),
        ('Preferences', {
            'fields': ('preferred_time_slots', 'notes')
        }),
    )

    def teacher_name(self, obj):
        return obj.teacher.get_full_name()
    teacher_name.short_description = 'Teacher'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'academic_year', 'teacher'
        )


@admin.register(TimetableGenerationConfig)
class TimetableGenerationConfigAdmin(admin.ModelAdmin):
    """Admin for Timetable Generation Config"""
    list_display = [
        'name', 'academic_year', 'algorithm',
        'is_active', 'run_count', 'created_by_name', 'created_at',
    ]
    list_filter = ['algorithm', 'is_active', 'academic_year']
    search_fields = ['name']
    ordering = ['-created_at']
    filter_horizontal = ['classes', 'sections']
    readonly_fields = ['created_by']

    fieldsets = (
        ('Basic', {
            'fields': ('name', 'academic_year', 'classes', 'sections', 'working_days')
        }),
        ('Algorithm', {
            'fields': ('algorithm', 'max_iterations', 'population_size')
        }),
        ('Weights', {
            'fields': (
                'weight_workload_balance', 'weight_subject_spread',
                'weight_teacher_preference', 'weight_room_optimization',
                'weight_no_consecutive_heavy',
            ),
            'classes': ['collapse'],
        }),
        ('Advanced', {
            'fields': ('custom_rules',),
            'classes': ['collapse'],
        }),
        ('Meta', {
            'fields': ('is_active', 'created_by')
        }),
    )

    def run_count(self, obj):
        return obj.runs.count()
    run_count.short_description = 'Runs'

    def created_by_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else '-'
    created_by_name.short_description = 'Created By'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'academic_year', 'created_by'
        ).prefetch_related('classes', 'runs')


@admin.register(TimetableGenerationRun)
class TimetableGenerationRunAdmin(admin.ModelAdmin):
    """Admin for Timetable Generation Runs"""
    list_display = [
        'short_id', 'config_name', 'status_badge',
        'progress_percent', 'fitness_score', 'duration_display',
        'triggered_by_name', 'created_at',
    ]
    list_filter = ['status', 'config']
    search_fields = ['config__name', 'triggered_by__first_name']
    ordering = ['-created_at']
    readonly_fields = [
        'config', 'status', 'progress_percent', 'progress_message',
        'generated_timetable', 'fitness_score', 'conflicts_found',
        'warnings', 'started_at', 'completed_at', 'duration_seconds',
        'celery_task_id', 'error_message', 'rollback_snapshot',
        'triggered_by',
    ]

    fieldsets = (
        ('Run Info', {
            'fields': ('config', 'status', 'triggered_by', 'celery_task_id')
        }),
        ('Progress', {
            'fields': ('progress_percent', 'progress_message')
        }),
        ('Results', {
            'fields': (
                'fitness_score', 'conflicts_found', 'warnings', 'error_message'
            )
        }),
        ('Timing', {
            'fields': ('started_at', 'completed_at', 'duration_seconds')
        }),
        ('Data', {
            'fields': ('generated_timetable', 'rollback_snapshot'),
            'classes': ['collapse'],
        }),
    )

    def short_id(self, obj):
        return str(obj.id)[:8]
    short_id.short_description = 'Run ID'

    def config_name(self, obj):
        return obj.config.name
    config_name.short_description = 'Config'

    def triggered_by_name(self, obj):
        return obj.triggered_by.get_full_name() if obj.triggered_by else '-'
    triggered_by_name.short_description = 'Triggered By'

    def duration_display(self, obj):
        if obj.duration_seconds:
            return f"{obj.duration_seconds:.1f}s"
        return '-'
    duration_display.short_description = 'Duration'

    def status_badge(self, obj):
        colors = {
            'PENDING': '#6c757d',
            'VALIDATING': '#17a2b8',
            'GENERATING': '#007bff',
            'OPTIMIZING': '#6f42c1',
            'COMPLETED': '#28a745',
            'FAILED': '#dc3545',
            'APPLIED': '#20c997',
            'ROLLED_BACK': '#fd7e14',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; '
            'border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'config', 'triggered_by'
        )
