"""
Platform Finance URLs
====================
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    InvestorDashboardViewSet, MarketingSpendViewSet, InvestorProfileViewSet,
    FinancialLedgerViewSet, FinancialSnapshotViewSet, AuditLogViewSet,
    RoleBasedAccessViewSet, FinancialReportViewSet
)

app_name = 'platform_finance'

router = DefaultRouter()
router.register(r'investor/dashboard', InvestorDashboardViewSet, basename='investor-dashboard')
router.register(r'investor/marketing-spend', MarketingSpendViewSet, basename='marketing-spend')
router.register(r'investor/profiles', InvestorProfileViewSet, basename='investor-profiles')
router.register(r'ledger', FinancialLedgerViewSet, basename='financial-ledger')
router.register(r'snapshots', FinancialSnapshotViewSet, basename='financial-snapshots')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-logs')
router.register(r'access-control', RoleBasedAccessViewSet, basename='access-control')
router.register(r'reports', FinancialReportViewSet, basename='financial-reports')

urlpatterns = [
    path('', include(router.urls)),
]
