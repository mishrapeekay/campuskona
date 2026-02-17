from django.contrib import admin
from .models import LedgerAccount, LedgerTransaction, LedgerEntry, FinancialSnapshot, FinancialAuditLog


class LedgerEntryInline(admin.TabularInline):
    model = LedgerEntry
    extra = 0
    readonly_fields = ('account', 'debit', 'credit', 'created_at')
    can_delete = False


@admin.register(LedgerAccount)
class LedgerAccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'account_type', 'school', 'balance', 'currency', 'is_active')
    list_filter = ('account_type', 'is_active', 'currency')
    search_fields = ('name', 'school__name')
    readonly_fields = ('balance', 'created_at', 'updated_at')


@admin.register(LedgerTransaction)
class LedgerTransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_type', 'status', 'reference_id', 'description', 'timestamp')
    list_filter = ('transaction_type', 'status')
    search_fields = ('description', 'reference_id')
    readonly_fields = ('transaction_hash', 'previous_hash', 'timestamp')
    inlines = [LedgerEntryInline]

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ('account', 'transaction', 'debit', 'credit', 'created_at')
    list_filter = ('account__account_type',)
    search_fields = ('account__name',)
    readonly_fields = ('created_at', 'updated_at')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(FinancialSnapshot)
class FinancialSnapshotAdmin(admin.ModelAdmin):
    list_display = ('report_name', 'timestamp', 'generated_by', 'integrity_hash_short')
    search_fields = ('report_name',)
    readonly_fields = ('integrity_hash', 'timestamp', 'created_at', 'updated_at')

    def integrity_hash_short(self, obj):
        return obj.integrity_hash[:16] + '...' if obj.integrity_hash else '-'
    integrity_hash_short.short_description = 'Hash'

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(FinancialAuditLog)
class FinancialAuditLogAdmin(admin.ModelAdmin):
    list_display = ('actor', 'action', 'entity_type', 'entity_id', 'ip_address', 'created_at')
    list_filter = ('action', 'entity_type')
    search_fields = ('actor__email', 'action', 'entity_type')
    readonly_fields = ('created_at', 'updated_at')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
