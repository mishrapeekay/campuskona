from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LedgerAccount, LedgerTransaction, FinancialSnapshot, FinancialAuditLog
from .serializers import (
    LedgerAccountSerializer, LedgerTransactionSerializer, 
    FinancialSnapshotSerializer, FinancialAuditLogSerializer
)
from .permissions import (
    HasFinanceAuditAccess, CanViewPlatformRevenue, 
    CanViewSchoolCollections, CanViewPartnerCommissions, CanViewInvestorPayouts
)
from .services import LedgerService

class LedgerAccountViewSet(viewsets.ModelViewSet):
    queryset = LedgerAccount.objects.all()
    serializer_class = LedgerAccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        
        # Segregation Logic
        if user.is_superuser:
            return queryset
            
        # Filter based on roles/perms
        if not user.has_perm('finance_ledger.view_platform_revenue'):
            queryset = queryset.exclude(account_type='PLATFORM_REVENUE')
            
        if not user.has_perm('finance_ledger.view_partner_commission'):
            queryset = queryset.exclude(account_type='PARTNER_COMMISSION')
            
        if not user.has_perm('finance_ledger.view_investor_payout'):
            queryset = queryset.exclude(account_type='INVESTOR_PAYOUT')
            
        # School collections - only see their own school unless platform admin
        if not user.is_staff: # Staff here means platform staff
            queryset = queryset.filter(school=user.school)
            
        return queryset

class LedgerTransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Transactions are READ-ONLY via API for audit integrity.
    Creation happens via Service layer internally.
    """
    queryset = LedgerTransaction.objects.all().prefetch_related('entries', 'entries__account')
    serializer_class = LedgerTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Similar segregation logic for transactions
        if user.is_superuser:
            return self.queryset
        
        # We filter based on the accounts involved in the transaction
        # If a user can see any account in the transaction, they see the transaction?
        # Or more strict: they must be allowed to see all accounts in the transaction.
        # Let's simplify: school-restricted users only see transactions where their school account is involved.
        if not user.is_staff:
            return self.queryset.filter(entries__account__school=user.school).distinct()
        
        return self.queryset

class FinancialSnapshotViewSet(viewsets.ModelViewSet):
    queryset = FinancialSnapshot.objects.all()
    serializer_class = FinancialSnapshotSerializer
    permission_classes = [HasFinanceAuditAccess]

    @action(detail=False, methods=['post'])
    def create_snapshot(self, request):
        report_name = request.data.get('report_name', f"Manual Snapshot {timezone.now()}")
        snapshot = LedgerService.generate_snapshot(report_name, request.user)
        serializer = self.get_serializer(snapshot)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class FinancialAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FinancialAuditLog.objects.all()
    serializer_class = FinancialAuditLogSerializer
    permission_classes = [HasFinanceAuditAccess]
