from django.contrib import admin
from .models import Club, ClubMembership, ClubActivity, ActivityAttendance


class ClubMembershipInline(admin.TabularInline):
    model = ClubMembership
    extra = 0
    fields = ('student', 'role', 'academic_year', 'joined_date')
    readonly_fields = ('joined_date',)


class ActivityAttendanceInline(admin.TabularInline):
    model = ActivityAttendance
    extra = 0
    fields = ('student', 'is_present', 'remarks')


@admin.register(Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'in_charge', 'is_active', 'member_count')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description', 'in_charge__first_name')
    inlines = [ClubMembershipInline]

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'


@admin.register(ClubMembership)
class ClubMembershipAdmin(admin.ModelAdmin):
    list_display = ('student', 'club', 'role', 'academic_year', 'joined_date')
    list_filter = ('club', 'role', 'academic_year')
    search_fields = ('student__first_name', 'student__last_name', 'club__name')
    readonly_fields = ('joined_date',)


@admin.register(ClubActivity)
class ClubActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'club', 'date', 'start_time', 'end_time', 'venue', 'status')
    list_filter = ('club', 'status', 'date')
    search_fields = ('title', 'club__name', 'venue')
    date_hierarchy = 'date'
    inlines = [ActivityAttendanceInline]


@admin.register(ActivityAttendance)
class ActivityAttendanceAdmin(admin.ModelAdmin):
    list_display = ('activity', 'student', 'is_present', 'remarks')
    list_filter = ('is_present', 'activity__club')
    search_fields = ('student__first_name', 'student__last_name', 'activity__title')
