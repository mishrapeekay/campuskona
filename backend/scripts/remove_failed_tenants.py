
import os
import sys
import django
from django.db import connection

# Add project root to sys.path
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.tenants.models import School

tenants_to_remove = ['Test Header School', 'Veda Test']

for name in tenants_to_remove:
    print(f"Processing removal for: {name}")
    try:
        tenant = School.objects.filter(name=name).first()
        if tenant:
            print(f"Found tenant: {tenant.name} (Schema: {tenant.schema_name}, ID: {tenant.id})")
            
            # Attempt standard ORM delete first
            try:
                print("Attempting ORM delete...")
                # We can try setting auto_drop_schema to False if possible, but it's usually on the model mixin
                # tenant.auto_drop_schema = False 
                # tenant.save()
                tenant.delete()
                print("Successfully deleted via ORM.")
            except Exception as e:
                print(f"ORM delete failed with error: {e}")
                print("Attempting raw SQL delete from public_schools table...")
                try:
                    with connection.cursor() as cursor:
                        # Using parameterized query for safety, though ID is UUID
                        cursor.execute("DELETE FROM public_schools WHERE id = %s", [str(tenant.id)])
                    print("Successfully deleted via raw SQL.")
                except Exception as sql_e:
                    print(f"Raw SQL delete also failed: {sql_e}")
        else:
            print(f"Tenant '{name}' not found in database.")

    except Exception as e:
        print(f"Unexpected error processing {name}: {e}")

print("Tenant removal process completed.")
