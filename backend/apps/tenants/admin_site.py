from django.contrib import admin
from django.db import connection


# Apps whose tables live in the PUBLIC schema (shared across all tenants)
SHARED_APP_LABELS = {
    'core', 'tenants', 'authentication', 'partners',
    'finance_ledger', 'analytics', 'platform_finance',
    'auth', 'contenttypes', 'admin', 'sessions',
}

# Apps whose tables live in TENANT schemas (per-school data)
TENANT_APP_LABELS = {
    'students', 'staff', 'academics', 'attendance', 'timetable',
    'examinations', 'assignments', 'ai_questions', 'finance', 'fee_ledger',
    'communication', 'library', 'transport', 'hostel', 'hr_payroll',
    'admissions', 'reports', 'government_reports', 'workflows', 'integrations',
    'privacy', 'houses', 'activities', 'mobile_bff',
}


class PublicSchemaAdminSite(admin.AdminSite):
    """
    Custom AdminSite that is schema-aware for multi-tenant architecture.

    - campuskona.com/admin/       → public schema  → shows SHARED_APP_LABELS only
    - veda9.campuskona.com/admin/ → tenant schema  → shows TENANT_APP_LABELS only

    Tenant-level tables do not exist in the public schema (and vice-versa),
    so each view must only list models whose tables are present in the
    current schema to avoid "relation does not exist" DB errors.
    """

    def _is_public_schema(self):
        return connection.schema_name == 'public'

    def get_app_list(self, request, app_label=None):
        app_list = super().get_app_list(request, app_label)

        if self._is_public_schema():
            # Platform admin: only models whose tables exist in public schema
            return [app for app in app_list if app['app_label'] in SHARED_APP_LABELS]
        else:
            # School admin: only models whose tables exist in the tenant schema
            return [app for app in app_list if app['app_label'] in TENANT_APP_LABELS]

    def index(self, request, extra_context=None):
        extra_context = extra_context or {}

        if self._is_public_schema():
            # Platform-level stats for super admin dashboard
            from apps.tenants.models import School, Subscription, Domain
            try:
                schools = School.objects.exclude(schema_name='public')
                active_schools = schools.filter(is_active=True)
                school_portals = []
                for school in active_schools:
                    primary_domain = Domain.objects.filter(
                        tenant=school, is_primary=True
                    ).first()
                    if primary_domain:
                        school_portals.append({
                            'name': school.name,
                            'admin_url': f'https://{primary_domain.domain}/admin/',
                            'schema': school.schema_name,
                        })
                extra_context.update({
                    'total_schools': schools.count(),
                    'active_schools': active_schools.count(),
                    'total_subscriptions': Subscription.objects.count(),
                    'total_domains': Domain.objects.count(),
                    'school_portals': school_portals,
                    # Template checks 'is_master_admin' for hero section / sidebar logic
                    'is_master_admin': True,
                })
            except Exception:
                pass
        else:
            # School-level stats for tenant admin dashboard
            try:
                from apps.students.models import Student
                from apps.staff.models import StaffMember
                from apps.academics.models import AcademicYear, Section
                from apps.attendance.models import AttendanceSummary
                from django.db.models import Avg

                current_year = AcademicYear.objects.filter(is_current=True).first()

                # Attendance: average percentage across all summaries for current year
                avg_attendance = 0
                if current_year:
                    avg_qs = AttendanceSummary.objects.filter(
                        academic_year=current_year
                    ).aggregate(avg=Avg('attendance_percentage'))
                    avg_attendance = round(avg_qs['avg'] or 0, 1)

                extra_context.update({
                    # Student count — field is 'admission_status', NOT 'status'
                    'total_students': Student.objects.filter(admission_status='ACTIVE').count(),
                    'total_staff': StaffMember.objects.filter(
                        employment_status='ACTIVE'
                    ).count(),
                    # Template variable is 'total_classes', not 'total_sections'
                    'total_classes': Section.objects.filter(
                        academic_year=current_year, is_active=True
                    ).count() if current_year else 0,
                    # Template variable 'attendance_percentage' was missing before
                    'attendance_percentage': avg_attendance,
                    'current_academic_year': str(current_year) if current_year else 'Not set',
                    'is_school_admin': True,
                })
            except Exception:
                pass

        return super().index(request, extra_context)


# Create the master admin site instance
admin_site = PublicSchemaAdminSite(name='school_admin')


def sync_admin_registry():
    """
    Sync all model registrations from the default admin.site to our custom
    admin_site so that @admin.register() decorators in each app's admin.py
    are picked up automatically.
    """
    for model, model_admin in admin.site._registry.items():
        if model not in admin_site._registry:
            admin_site.register(model, model_admin.__class__)


# Run initial sync at import time
sync_admin_registry()
