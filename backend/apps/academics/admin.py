from django.contrib import admin
from apps.academics.models import (
    AcademicYear, Board, Subject, Class, Section, 
    ClassSubject, StudentEnrollment, SyllabusUnit
)

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'is_current')
    list_editable = ('is_current',)

@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ('board_name', 'board_type', 'board_code', 'is_active')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'subject_type', 'class_group', 'is_active')
    list_filter = ('subject_type', 'class_group', 'stream')
    search_fields = ('name', 'code')

class SectionInline(admin.TabularInline):
    model = Section
    extra = 1

@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'name', 'board', 'class_order', 'is_active')
    list_filter = ('board', 'is_active')
    search_fields = ('name', 'display_name')
    inlines = [SectionInline]

@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('get_full_name', 'class_teacher', 'max_students', 'get_student_count', 'is_active')
    list_filter = ('class_instance', 'academic_year', 'is_active')
    search_fields = ('name', 'class_instance__display_name')

    def get_student_count(self, obj):
        return obj.get_student_count()
    get_student_count.short_description = 'Students'

@admin.register(StudentEnrollment)
class StudentEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'section', 'roll_number', 'enrollment_status', 'is_active')
    list_filter = ('section__class_instance', 'section', 'academic_year', 'enrollment_status')
    search_fields = ('student__first_name', 'student__last_name', 'roll_number')
    autocomplete_fields = ['student']

@admin.register(ClassSubject)
class ClassSubjectAdmin(admin.ModelAdmin):
    list_display = ('class_instance', 'subject', 'teacher', 'academic_year', 'is_compulsory')
    list_filter = ('class_instance', 'academic_year', 'subject', 'teacher')
