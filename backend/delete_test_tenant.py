import os
import sys
import django
from django.db import connection

# Setup Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.tenants.models import School

def delete_test_tenant():
    print("Deleting test tenant...")
    try:
        tenant = School.objects.get(schema_name="test_header_tenant")
        tenant.delete(keep_parents=False) # Helper to delete just the object if schema is busted
        print(f"✅ Deleted tenant: {tenant.schema_name}")
    except School.DoesNotExist:
        print("Test tenant does not exist.")
    except Exception as e:
        print(f"Error: {e}")
    
    # Always try to drop the schema to be safe
    with connection.cursor() as cursor:
        cursor.execute("DROP SCHEMA IF EXISTS test_header_tenant CASCADE")
        print("✅ Force dropped schema 'test_header_tenant' (if existed)")

if __name__ == "__main__":
    delete_test_tenant()
