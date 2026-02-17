from django.contrib import admin
from django.utils.html import format_html
from .models import FeeLedgerEntry


@admin.register(FeeLedgerEntry)
class FeeLedgerEntryAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'entry_type', 'base_amount', 'total_amount',
        'running_balance', 'reference_id', 'created_at'
    )
    list_filter = ('entry_type', 'created_at')
    search_fields = ('student__first_name', 'student__last_name', 'reference_id', 'description')
    date_hierarchy = 'created_at'
    readonly_fields = (
        'total_amount', 'running_balance', 'previous_hash', 'entry_hash',
        'created_at', 'updated_at'
    )

    fieldsets = (
        ('Student', {
            'fields': ('student',)
        }),
        ('Entry Details', {
            'fields': ('entry_type', 'reference_id', 'description')
        }),
        ('Amounts', {
            'fields': ('base_amount', 'cgst', 'sgst', 'igst', 'tds_deducted', 'total_amount', 'running_balance')
        }),
        ('Integrity', {
            'fields': ('previous_hash', 'entry_hash'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('metadata', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
