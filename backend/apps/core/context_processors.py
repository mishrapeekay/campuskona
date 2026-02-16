from django.db import connection

def filtered_jazzmin_settings(request):
    """
    Context processor that provides branding variables based on the current schema.
    We leave jazzmin_settings to the default Jazzmin context processor to avoid 
    breaking the sidebar menu.
    """
    schema_name = connection.schema_name
    is_master = (schema_name == 'public')
    
    context = {
        'is_master_admin': is_master,
    }

    if is_master:
        context.update({
            'site_header': "Master Admin - Control Center",
            'site_brand': "MASTER ADMIN",
        })
    else:
        school_name = "School Management"
        tenant = getattr(request, 'tenant', None)
        if tenant and tenant.schema_name != 'public':
            school_name = tenant.name
            
        context.update({
            'site_header': f"{school_name} - Admin",
            'site_brand': school_name,
        })

    return context
