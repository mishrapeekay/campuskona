from django.contrib import admin
from django.utils.html import format_html
from .models import SyncLog, SyncConflict


@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'operation', 'status_badge', 'created_at')
    list_filter = ('operation', 'status', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    readonly_fields = ('user', 'operation', 'status', 'details', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def status_badge(self, obj):
        colors = {
            'SUCCESS': '#28a745',
            'PARTIAL': '#ffc107',
            'ERROR': '#dc3545',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(SyncConflict)
class SyncConflictAdmin(admin.ModelAdmin):
    list_display = ('user', 'entity_name', 'entity_id', 'resolved', 'resolution_strategy', 'created_at')
    list_filter = ('resolved', 'entity_name', 'created_at')
    search_fields = ('user__email', 'entity_name', 'entity_id')
    readonly_fields = ('user', 'entity_name', 'entity_id', 'client_version', 'server_version', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False
