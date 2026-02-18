"""
DPDP Act 2023 Compliance - URL Configuration
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.privacy.views import (
    ConsentPurposeViewSet,
    ParentalConsentViewSet,
    GrievanceViewSet,
    DataBreachViewSet,
    DeletionRequestViewSet,
    CorrectionRequestViewSet,
    SensitiveDataAccessViewSet,
    AccessPatternAlertViewSet,
    ComplianceDashboardViewSet,
    GenerateDPAView,
    GeneratePrivacyNoticeView,
    GenerateComplianceCertificateView,
    BulkImportDPDPAuditView,
)

app_name = 'privacy'

router = DefaultRouter()
router.register(r'consent-purposes', ConsentPurposeViewSet, basename='consent-purpose')
router.register(r'consents', ParentalConsentViewSet, basename='parental-consent')
router.register(r'grievances', GrievanceViewSet, basename='grievance')
router.register(r'breaches', DataBreachViewSet, basename='data-breach')
router.register(r'deletion-requests', DeletionRequestViewSet, basename='deletion-request')
router.register(r'correction-requests', CorrectionRequestViewSet, basename='correction-request')
router.register(r'audit-logs', SensitiveDataAccessViewSet, basename='audit-log')
router.register(r'alerts', AccessPatternAlertViewSet, basename='access-alert')
router.register(r'dashboard', ComplianceDashboardViewSet, basename='compliance-dashboard')

urlpatterns = [
    path('', include(router.urls)),
    # Workstream D: DPDP document downloads
    path('generate-dpa/', GenerateDPAView.as_view(), name='generate-dpa'),
    path('generate-privacy-notice/', GeneratePrivacyNoticeView.as_view(), name='generate-privacy-notice'),
    path('compliance-certificate/', GenerateComplianceCertificateView.as_view(), name='compliance-certificate'),
    # Workstream H: Pre-import DPDP audit
    path('import-audit/', BulkImportDPDPAuditView.as_view(), name='import-audit'),
]
