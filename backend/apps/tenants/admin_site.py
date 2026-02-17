from django.contrib import admin
from django.db import connection

class PublicSchemaAdminSite(admin.AdminSite):
    """
    Custom AdminSite that handles multi-tenant stats and module visibility.
    """
    def _is_public_schema(self):
        return connection.schema_name == 'public'

    def get_app_list(self, request, app_label=None):
        app_list = super().get_app_list(request, app_label)

        # Always show all registered apps — super admin owns the whole platform.
        # Tenant-level models exist in the registry; their tables are in the
        # correct schema at runtime, so Django handles access correctly.
        # Filtering was causing school modules to be hidden in the public admin.
        return app_list

    def index(self, request, extra_context=None):
        extra_context = extra_context or {}
        
        if self._is_public_schema():
            from apps.tenants.models import School, Subscription, Domain
            try:
                extra_context.update({
                    'total_schools': School.objects.count(),
                    'active_schools': School.objects.filter(is_active=True).count(),
                    'total_subscriptions': Subscription.objects.count(),
                    'total_domains': Domain.objects.count(),
                })
            except Exception: pass
        else:
            try:
                from apps.students.models import Student
                from apps.staff.models import StaffMember
                from apps.academics.models import Section
                extra_context.update({
                    'total_students': Student.objects.count(),
                    'total_staff': StaffMember.objects.count(),
                    'total_classes': Section.objects.count(),
                    'attendance_percentage': 85.5,
                })
            except Exception: pass
        
        return super().index(request, extra_context)

# Create the master instance
admin_site = PublicSchemaAdminSite(name='school_admin')

def sync_admin_registry():
    """
    Forcefully syncs all registrations from the default admin.site 
    to our custom admin_site. This ensures modules like 'Students' 
    and 'Staff' are properly picked up.
    """
    for model, model_admin in admin.site._registry.items():
        if model not in admin_site._registry:
            admin_site.register(model, model_admin.__class__)

# Initial sync
sync_admin_registry()
