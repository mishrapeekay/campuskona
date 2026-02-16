"""
Admin interface for Examinations models
"""

from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import (
    GradeScale,
    Grade,
    ExamType,
    Examination,
    ExamSchedule,
    StudentMark,
    ExamResult,
    ReportCard
)


@admin.register(GradeScale)
class GradeScaleAdmin(admin.ModelAdmin):
    """Admin interface for Grade Scales"""
    list_display = ['name', 'description', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']


class GradeInline(admin.TabularInline):
    """Inline for grades in grade scale"""
    model = Grade
    extra = 1
    fields = ['grade', 'min_percentage', 'max_percentage', 'grade_point', 'description', 'order']
    ordering = ['order', '-min_percentage']


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    """Admin interface for Grades"""
    list_display = [
        'grade',
        'grade_scale',
        'min_percentage',
        'max_percentage',
        'grade_point',
        'description',
        'order'
    ]
    list_filter = ['grade_scale']
    search_fields = ['grade', 'description']
    ordering = ['grade_scale', 'order', '-min_percentage']


@admin.register(ExamType)
class ExamTypeAdmin(admin.ModelAdmin):
    """Admin interface for Exam Types"""
    list_display = [
        'name',
        'code',
        'exam_type',
        'weightage',
        'is_active'
    ]
    list_filter = ['exam_type', 'is_active']
    search_fields = ['name', 'code']
    ordering = ['name']


@admin.register(Examination)
class ExaminationAdmin(admin.ModelAdmin):
    """Admin interface for Examinations"""
    list_display = [
        'name',
        'exam_type',
        'academic_year',
        'start_date',
        'end_date',
        'status_badge',
        'is_published'
    ]
    list_filter = ['status', 'exam_type', 'academic_year', 'is_published']
    search_fields = ['name', 'description']
    date_hierarchy = 'start_date'
    ordering = ['-start_date']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'exam_type', 'academic_year', 'grade_scale')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date', 'result_date')
        }),
        ('Details', {
            'fields': ('description', 'instructions')
        }),
        ('Status', {
            'fields': ('status', 'is_published')
        }),
    )
    
    actions = ['publish_results', 'unpublish_results', 'mark_completed']

    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'SCHEDULED': '#ffc107',
            'ONGOING': '#17a2b8',
            'COMPLETED': '#28a745',
            'CANCELLED': '#dc3545',
            'POSTPONED': '#6c757d',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def publish_results(self, request, queryset):
        """Bulk publish results"""
        count = queryset.filter(status='COMPLETED').update(is_published=True)
        self.message_user(request, f'{count} examination(s) results published.')
    publish_results.short_description = 'Publish results'

    def unpublish_results(self, request, queryset):
        """Bulk unpublish results"""
        count = queryset.update(is_published=False)
        self.message_user(request, f'{count} examination(s) results unpublished.')
    unpublish_results.short_description = 'Unpublish results'

    def mark_completed(self, request, queryset):
        """Mark examinations as completed"""
        count = queryset.update(status='COMPLETED')
        self.message_user(request, f'{count} examination(s) marked as completed.')
    mark_completed.short_description = 'Mark as completed'


@admin.register(ExamSchedule)
class ExamScheduleAdmin(admin.ModelAdmin):
    """Admin interface for Exam Schedules"""
    list_display = [
        'examination',
        'class_section',
        'subject',
        'exam_date',
        'start_time',
        'end_time',
        'max_marks',
        'room_number'
    ]
    list_filter = ['examination', 'exam_date', 'class_obj', 'section']
    search_fields = [
        'subject__name',
        'class_obj__name',
        'section__name',
        'room_number'
    ]
    date_hierarchy = 'exam_date'
    ordering = ['exam_date', 'start_time']
    
    fieldsets = (
        ('Examination', {
            'fields': ('examination',)
        }),
        ('Class Details', {
            'fields': ('class_obj', 'section', 'subject')
        }),
        ('Schedule', {
            'fields': ('exam_date', 'start_time', 'end_time', 'duration_minutes', 'room_number')
        }),
        ('Marks', {
            'fields': ('max_marks', 'min_passing_marks')
        }),
        ('Instructions', {
            'fields': ('instructions',)
        }),
    )

    def class_section(self, obj):
        """Display class and section"""
        return f"{obj.class_obj.name} - {obj.section.name}"
    class_section.short_description = 'Class'

    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related(
            'examination',
            'class_obj',
            'section',
            'subject'
        )


@admin.register(StudentMark)
class StudentMarkAdmin(admin.ModelAdmin):
    """Admin interface for Student Marks"""
    list_display = [
        'student_name',
        'exam_subject',
        'marks_obtained',
        'max_marks',
        'percentage',
        'grade',
        'status_badge',
        'is_passed'
    ]
    list_filter = [
        'status',
        'is_passed',
        'exam_schedule__examination',
        'exam_schedule__subject'
    ]
    search_fields = [
        'student__first_name',
        'student__last_name',
        'student__admission_number'
    ]
    ordering = ['-exam_schedule__exam_date', 'student']
    
    fieldsets = (
        ('Exam Details', {
            'fields': ('exam_schedule', 'student')
        }),
        ('Marks', {
            'fields': ('marks_obtained', 'status')
        }),
        ('Calculated Fields', {
            'fields': ('percentage', 'grade', 'grade_point', 'is_passed'),
            'classes': ('collapse',)
        }),
        ('Additional', {
            'fields': ('remarks', 'entered_by')
        }),
    )
    
    readonly_fields = ['percentage', 'grade', 'grade_point', 'is_passed', 'entered_by']

    def student_name(self, obj):
        """Display student name"""
        return obj.student.get_full_name()
    student_name.short_description = 'Student'

    def exam_subject(self, obj):
        """Display exam and subject"""
        return f"{obj.exam_schedule.examination.name} - {obj.exam_schedule.subject.name}"
    exam_subject.short_description = 'Exam & Subject'

    def max_marks(self, obj):
        """Display maximum marks"""
        return obj.exam_schedule.max_marks
    max_marks.short_description = 'Max Marks'

    def status_badge(self, obj):
        """Display status as badge"""
        colors = {
            'PRESENT': 'bg-green-100 text-green-800',
            'ABSENT': 'bg-red-100 text-red-800',
            'EXEMPTED': 'bg-gray-100 text-gray-800',
        }
        color = colors.get(obj.status, 'bg-gray-100 text-gray-800')
        return format_html(
            '<span class="{} px-2 py-1 rounded text-xs font-medium">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def save_model(self, request, obj, form, change):
        """Set entered_by to current user"""
        if not change:
            obj.entered_by = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related(
            'exam_schedule__examination',
            'exam_schedule__subject',
            'student',
            'entered_by'
        )


@admin.register(ExamResult)
class ExamResultAdmin(admin.ModelAdmin):
    """Admin interface for Exam Results"""
    list_display = [
        'student_name',
        'examination',
        'class_section',
        'total_marks',
        'percentage',
        'cgpa',
        'overall_grade',
        'rank',
        'is_passed'
    ]
    list_filter = [
        'is_passed',
        'examination',
        'class_obj',
        'section'
    ]
    search_fields = [
        'student__first_name',
        'student__last_name',
        'student__admission_number'
    ]
    ordering = ['examination', '-percentage']
    
    fieldsets = (
        ('Student & Exam', {
            'fields': ('examination', 'student', 'class_obj', 'section')
        }),
        ('Marks', {
            'fields': ('total_marks_obtained', 'total_max_marks', 'percentage')
        }),
        ('Grading', {
            'fields': ('cgpa', 'overall_grade', 'rank')
        }),
        ('Summary', {
            'fields': ('is_passed', 'subjects_passed', 'subjects_failed')
        }),
        ('Remarks', {
            'fields': ('remarks',)
        }),
    )
    
    actions = ['recalculate_results', 'calculate_ranks']

    def student_name(self, obj):
        """Display student name"""
        return obj.student.get_full_name()
    student_name.short_description = 'Student'

    def class_section(self, obj):
        """Display class and section"""
        return f"{obj.class_obj.name} - {obj.section.name}"
    class_section.short_description = 'Class'

    def total_marks(self, obj):
        """Display total marks"""
        return f"{obj.total_marks_obtained}/{obj.total_max_marks}"
    total_marks.short_description = 'Total Marks'

    def recalculate_results(self, request, queryset):
        """Recalculate selected results"""
        count = 0
        for result in queryset:
            result.calculate_result()
            count += 1
        self.message_user(request, f'{count} result(s) recalculated.')
    recalculate_results.short_description = 'Recalculate results'

    def calculate_ranks(self, request, queryset):
        """Calculate ranks for selected results"""
        # Group by examination, class, and section
        groups = {}
        for result in queryset:
            key = (result.examination_id, result.class_obj_id, result.section_id)
            if key not in groups:
                groups[key] = []
            groups[key].append(result)
        
        count = 0
        for group in groups.values():
            # Sort by percentage descending
            sorted_results = sorted(group, key=lambda x: x.percentage, reverse=True)
            for rank, result in enumerate(sorted_results, 1):
                result.rank = rank
                result.save()
                count += 1
        
        self.message_user(request, f'Ranks calculated for {count} result(s).')
    calculate_ranks.short_description = 'Calculate ranks'

    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related(
            'examination',
            'student',
            'class_obj',
            'section'
        )


@admin.register(ReportCard)
class ReportCardAdmin(admin.ModelAdmin):
    """Admin interface for Report Cards"""
    list_display = [
        'student_name',
        'examination',
        'generated_at',
        'generated_by_name',
        'has_pdf'
    ]
    list_filter = ['generated_at', 'exam_result__examination']
    search_fields = [
        'exam_result__student__first_name',
        'exam_result__student__last_name'
    ]
    ordering = ['-generated_at']
    
    readonly_fields = ['generated_at', 'generated_by']

    def student_name(self, obj):
        """Display student name"""
        return obj.exam_result.student.get_full_name()
    student_name.short_description = 'Student'

    def examination(self, obj):
        """Display examination name"""
        return obj.exam_result.examination.name
    examination.short_description = 'Examination'

    def generated_by_name(self, obj):
        """Display generator name"""
        return obj.generated_by.get_full_name() if obj.generated_by else '-'
    generated_by_name.short_description = 'Generated By'

    def has_pdf(self, obj):
        """Check if PDF exists"""
        if obj.pdf_file:
            return format_html(
                '<span style="color: green;">✓ Yes</span>'
            )
        return format_html(
            '<span style="color: red;">✗ No</span>'
        )
    has_pdf.short_description = 'PDF'

    def get_queryset(self, request):
        """Optimize queryset"""
        return super().get_queryset(request).select_related(
            'exam_result__student',
            'exam_result__examination',
            'generated_by'
        )
