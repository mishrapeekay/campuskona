import os
import sys
import django

# Add backend directory to sys.path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
if backend_path not in sys.path:
    sys.path.append(backend_path)

from django.conf import settings
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

shared_tables = ['users', 'permissions', 'roles', 'user_roles', 'tenants_school', 'tenants_domain']

with connection.cursor() as cursor:
    cursor.execute("SELECT nspname FROM pg_catalog.pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema' AND nspname != 'public';")
    tenant_schemas = [row[0] for row in cursor.fetchall()]
    print(f"Tenant Schemas: {tenant_schemas}")
    
    for schema in tenant_schemas:
        print(f"\nProcessing schema: {schema}")
        for table in shared_tables:
            cursor.execute(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{schema}' AND table_name = '{table}';")
            if cursor.fetchone():
                print(f"  Dropping shared table '{table}' from schema '{schema}'")
                try:
                    # Use CASCADE to handle potential foreign keys pointing to these tables within the same schema
                    cursor.execute(f"DROP TABLE \"{schema}\".\"{table}\" CASCADE;")
                except Exception as e:
                    print(f"    Error dropping '{table}': {e}")
            else:
                # No shared table found, which is good
                pass
    
    print("\nCleanup complete.")
