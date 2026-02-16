from django.contrib import admin
from django.utils.html import format_html
from apps.staff.models import StaffMember, StaffDocument
from apps.attendance.models import StaffAttendance, StaffLeave

@admin.register(StaffMember)
class StaffMemberAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'get_full_name', 'designation', 'department', 'joining_date', 'employment_status', 'get_photo')
    list_filter = ('department', 'designation', 'employment_status', 'gender')
    search_fields = ('employee_id', 'first_name', 'last_name', 'email', 'phone_number')
    readonly_fields = ('employee_id', 'created_at', 'updated_at')

    fieldsets = (
        ('Basic Information', {
            'fields': (('user', 'employee_id'), ('first_name', 'last_name'), ('email', 'phone_number'), 'photo')
        }),
        ('Job Details', {
            'fields': (('department', 'designation'), ('joining_date', 'qualification'), 'experience_years', 'employment_status')
        }),
        ('Salary & Bank', {
            'fields': (('basic_salary', 'bank_name'), ('account_number', 'ifsc_code'))
        }),
    )

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    get_full_name.short_description = 'Name'

    def get_photo(self, obj):
        if obj.photo:
            try:
                return format_html('<img src="{}" width="40" height="40" style="border-radius:50%;" />', obj.photo.url)
            except:
                return "-"
        return "-"
    get_photo.short_description = 'Photo'

# Note: StaffLeave and StaffAttendance are registered in attendance/admin.py 
# but we can add shortcuts or view them here if needed.
