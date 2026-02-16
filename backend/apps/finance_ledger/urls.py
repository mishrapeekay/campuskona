from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LedgerAccountViewSet, LedgerTransactionViewSet, 
    FinancialSnapshotViewSet, FinancialAuditLogViewSet
)

router = DefaultRouter()
router.register(r'accounts', LedgerAccountViewSet)
router.register(r'transactions', LedgerTransactionViewSet)
router.register(r'snapshots', FinancialSnapshotViewSet)
router.register(r'audit-logs', FinancialAuditLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
