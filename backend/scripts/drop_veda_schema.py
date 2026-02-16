import os
import django
from django.db import connection

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

def drop_schema():
    schema_name = 'tenant_veda_vidyalaya'
    print(f"Dropping schema {schema_name}...")
    with connection.cursor() as cursor:
        cursor.execute(f'DROP SCHEMA IF EXISTS "{schema_name}" CASCADE')
    print("Schema dropped.")

    # Also delete the tenant from public.schools if needed, so it can be recreated.
    from apps.tenants.models import School
    try:
        school = School.objects.get(schema_name=schema_name)
        print(f"Deleting tenant record for {school.name}...")
        school.delete() # This might trigger schema drop too if configured, but we did it manually to be sure.
        print("Tenant record deleted.")
    except School.DoesNotExist:
        print("Tenant record not found.")

if __name__ == '__main__':
    drop_schema()
