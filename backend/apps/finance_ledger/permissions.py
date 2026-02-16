from rest_framework import permissions

class HasFinanceAuditAccess(permissions.BasePermission):
    """
    Allows access only to users with audit permissions.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.has_perm('finance_ledger.view_financialauditlog') or request.user.is_superuser

class CanViewPlatformRevenue(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('finance_ledger.view_platform_revenue')

class CanViewSchoolCollections(permissions.BasePermission):
    def has_permission(self, request, view):
        # Platform admins can see all, school admins see their own
        return request.user.has_perm('finance_ledger.view_school_collection')

class CanViewPartnerCommissions(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('finance_ledger.view_partner_commission')

class CanViewInvestorPayouts(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.has_perm('finance_ledger.view_investor_payout')
