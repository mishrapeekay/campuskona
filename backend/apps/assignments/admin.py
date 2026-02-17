from django.contrib import admin
from .models import Assignment, AssignmentSubmission


class AssignmentSubmissionInline(admin.TabularInline):
    model = AssignmentSubmission
    extra = 0
    fields = ('student', 'submission_date', 'status', 'marks_obtained', 'graded_by')
    readonly_fields = ('submission_date',)


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'section', 'teacher', 'due_date', 'status', 'submission_count')
    list_filter = ('status', 'section__class_instance', 'academic_year')
    search_fields = ('title', 'description', 'teacher__first_name', 'teacher__last_name')
    date_hierarchy = 'due_date'
    inlines = [AssignmentSubmissionInline]

    def submission_count(self, obj):
        return obj.submissions.count()
    submission_count.short_description = 'Submissions'


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'submission_date', 'status', 'marks_obtained', 'graded_by')
    list_filter = ('status', 'assignment__section__class_instance')
    search_fields = ('student__first_name', 'student__last_name', 'assignment__title')
    readonly_fields = ('submission_date', 'created_at', 'updated_at')
