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

with connection.cursor() as cursor:
    cursor.execute("SELECT schema_name, name FROM tenants_school;")
    schools = cursor.fetchall()
    print(f"Schools in DB: {schools}")
    
    # Check if these schemas actually exist in pg_namespace
    cursor.execute("SELECT nspname FROM pg_catalog.pg_namespace;")
    existing_schemas = [row[0] for row in cursor.fetchall()]
    
    for schema_name, name in schools:
        if schema_name in existing_schemas:
            print(f"  Schema '{schema_name}' for school '{name}' EXISTS")
        else:
            print(f"  Schema '{schema_name}' for school '{name}' is MISSING in Postgres!")
