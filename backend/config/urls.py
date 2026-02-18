"""
URL configuration for School Management System.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import TokenRefreshView
from apps.core.views import welcome, health_check
from apps.tenants.admin_site import admin_site

urlpatterns = [
    # Root
    path('', welcome, name='welcome'),

    # Admin
    path('admin/', admin_site.urls),

    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API v1
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/students/', include('apps.students.urls')),
    path('api/v1/staff/', include('apps.staff.urls')),
    path('api/v1/academics/', include('apps.academics.urls')),
    path('api/v1/attendance/', include('apps.attendance.urls')),      # ✅ Phase 3
    path('api/v1/timetable/', include('apps.timetable.urls')),        # ✅ Phase 3
    path('api/v1/examinations/', include('apps.examinations.urls')),  # ✅ Phase 4
    path('api/v1/finance/', include('apps.finance.urls')),            # ✅ Phase 5
    path('api/v1/communication/', include('apps.communication.urls')),# ✅ Phase 6
    path('api/v1/library/', include('apps.library.urls')),            # ✅ Phase 7
    path('api/v1/transport/', include('apps.transport.urls')),        # ✅ Phase 7
    path('api/v1/privacy/', include('apps.privacy.urls')),            # ✅ DPDP Act 2023
    path('api/v1/admissions/', include('apps.admissions.urls')),    # ✅ Phase 8
    path('api/v1/hostel/', include('apps.hostel.urls')),            # ✅ Phase 8
    path('api/v1/hr/', include('apps.hr_payroll.urls')),            # ✅ Phase 8
    path('api/v1/reports/', include('apps.reports.urls')),          # ✅ Phase 8
    path('api/v1/core/', include('apps.core.urls')),
    path('api/v1/assignments/', include('apps.assignments.urls')),
    path('api/v1/integrations/', include('apps.integrations.urls')),
    path('api/v1/workflows/', include('apps.workflows.urls')),
    path('api/v1/government-reports/', include('apps.government_reports.urls')),  # UDISE+/RTE
    path('api/v1/analytics/', include('apps.analytics.urls')),  # Investor Dashboard
    path('api/v1/finance-ledger/', include('apps.finance_ledger.urls')),
    path('api/v1/fee-ledger/', include('apps.fee_ledger.urls')),
    path('api/v1/partners/', include('apps.partners.urls')),  # Partner Commission Tracking
    path('api/v1/platform-finance/', include('apps.platform_finance.urls')),  # Platform Finance & Investor Management
    path('api/v1/ai-questions/', include('apps.ai_questions.urls')),
    path('api/v1/houses/', include('apps.houses.urls')),
    path('api/v1/activities/', include('apps.activities.urls')),
    path('api/v1/onboarding/', include('apps.onboarding.urls')),

    # Mobile BFF
    path('api/mobile/v1/', include('apps.mobile_bff.urls')),

    # Super Admin - Tenant Management
    path('api/v1/tenants/', include('apps.tenants.urls')),

    # Health check — direct view registration to avoid /health/health/ double-nesting
    path('health/', health_check, name='health_check'),

    # Monitoring
    path('', include('django_prometheus.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns

# Customize admin site
admin.site.site_header = 'School Management System Administration'
admin.site.site_title = 'School Management System'
admin.site.index_title = 'Welcome to School Management System Administration'
