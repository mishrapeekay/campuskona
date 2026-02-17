from django.contrib import admin
from .models import InvestorMetric, MarketingSpend


@admin.register(InvestorMetric)
class InvestorMetricAdmin(admin.ModelAdmin):
    list_display = ('date', 'mrr', 'arr', 'total_revenue', 'total_schools', 'active_schools', 'churn_rate')
    list_filter = ('date',)
    readonly_fields = ('date', 'created_at', 'updated_at')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(MarketingSpend)
class MarketingSpendAdmin(admin.ModelAdmin):
    list_display = ('month', 'channel', 'amount', 'currency')
    list_filter = ('channel', 'month')
    search_fields = ('channel',)
