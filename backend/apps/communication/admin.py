from django.contrib import admin
from .models import Notice, Event, Notification


@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'target_audience', 'priority', 'posted_by', 'is_published', 'display_until', 'created_at')
    list_filter = ('target_audience', 'priority', 'is_published')
    search_fields = ('title', 'content', 'posted_by__email')
    date_hierarchy = 'created_at'
    filter_horizontal = ('specific_classes',)

    fieldsets = (
        ('Notice Details', {
            'fields': ('title', 'content', 'attachment')
        }),
        ('Audience', {
            'fields': ('target_audience', 'specific_classes')
        }),
        ('Settings', {
            'fields': ('priority', 'is_published', 'display_until', 'posted_by')
        }),
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'event_type', 'start_date', 'end_date', 'location', 'organizer', 'is_public')
    list_filter = ('event_type', 'is_public', 'start_date')
    search_fields = ('title', 'description', 'organizer', 'location')
    date_hierarchy = 'start_date'
    filter_horizontal = ('participants',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('recipient__email', 'title', 'message')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at')

    def has_add_permission(self, request):
        return False
