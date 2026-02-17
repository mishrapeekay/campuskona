from django.contrib import admin
from .models import House, HouseMembership, HousePointLog


class HouseMembershipInline(admin.TabularInline):
    model = HouseMembership
    extra = 0
    fields = ('student', 'role', 'academic_year', 'points_contributed')
    readonly_fields = ('points_contributed',)


@admin.register(House)
class HouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'color_code', 'motto', 'total_points', 'member_count')
    search_fields = ('name', 'code')
    inlines = [HouseMembershipInline]

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'


@admin.register(HouseMembership)
class HouseMembershipAdmin(admin.ModelAdmin):
    list_display = ('student', 'house', 'role', 'academic_year', 'points_contributed')
    list_filter = ('house', 'role', 'academic_year')
    search_fields = ('student__first_name', 'student__last_name', 'house__name')


@admin.register(HousePointLog)
class HousePointLogAdmin(admin.ModelAdmin):
    list_display = ('house', 'student', 'points', 'category', 'reason', 'awarded_by', 'awarded_date')
    list_filter = ('house', 'category', 'awarded_date')
    search_fields = ('reason', 'house__name', 'student__first_name')
    readonly_fields = ('awarded_date', 'created_at', 'updated_at')
