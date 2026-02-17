from django.contrib import admin
from apps.attendance.models import (
    AttendancePeriod, StudentAttendance, StaffAttendance, 
    StudentLeave, StaffLeave, Holiday, AttendanceSummary
)

@admin.register(AttendancePeriod)
class AttendancePeriodAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_time', 'end_time', 'period_type', 'duration', 'is_active')
    list_editable = ('is_active',)

@admin.register(StudentAttendance)
class StudentAttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'status', 'period', 'marked_by')
    list_filter = ('status', 'date', 'academic_year')
    search_fields = ('student__first_name', 'student__last_name', 'student__admission_number')
    autocomplete_fields = ['student']

@admin.register(StaffAttendance)
class StaffAttendanceAdmin(admin.ModelAdmin):
    list_display = ('staff_member', 'date', 'status', 'check_in_time', 'check_out_time', 'working_hours')
    list_filter = ('status', 'date')
    search_fields = ('staff_member__first_name', 'staff_member__last_name', 'staff_member__employee_id')

@admin.register(StudentLeave)
class StudentLeaveAdmin(admin.ModelAdmin):
    list_display = ('student', 'leave_type', 'start_date', 'end_date', 'status', 'total_days')
    list_filter = ('status', 'leave_type')
    search_fields = ('student__first_name', 'reason')
    actions = ['approve_leaves', 'reject_leaves']

    def approve_leaves(self, request, queryset):
        queryset.update(status='APPROVED')
    approve_leaves.short_description = "Approve selected leaves"


@admin.register(StaffLeave)
class StaffLeaveAdmin(admin.ModelAdmin):
    list_display = ('staff_member', 'leave_type', 'start_date', 'end_date', 'status', 'total_days')
    list_filter = ('status', 'leave_type')
    search_fields = ('staff_member__first_name', 'staff_member__last_name', 'staff_member__employee_id', 'reason')
    actions = ['approve_leaves']

    def approve_leaves(self, request, queryset):
        queryset.update(status='APPROVED')
    approve_leaves.short_description = "Approve selected leaves"


@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'holiday_type', 'academic_year', 'is_optional')
    list_filter = ('holiday_type', 'academic_year')
    search_fields = ('name',)

@admin.register(AttendanceSummary)
class AttendanceSummaryAdmin(admin.ModelAdmin):
    list_display = ('student', 'month', 'attendance_percentage', 'present_days', 'absent_days')
    list_filter = ('academic_year', 'month')
    readonly_fields = ('attendance_percentage', 'present_days', 'absent_days', 'total_days')
