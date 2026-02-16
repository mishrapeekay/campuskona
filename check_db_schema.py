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
    cursor.execute("SELECT nspname FROM pg_catalog.pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema';")
    schemas = [row[0] for row in cursor.fetchall()]
    print(f"Schemas: {schemas}")
    
    for schema in schemas:
        print(f"\nChecking schema: {schema}")
        for table in shared_tables:
            cursor.execute(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{schema}' AND table_name = '{table}';")
            tables = cursor.fetchall()
            if tables:
                print(f"  Table '{table}' EXISTS")
                # Check for column language_preference if it's the users table
                if table == 'users':
                    cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_schema = '{schema}' AND table_name = 'users' AND column_name = 'language_preference';")
                    column = cursor.fetchone()
                    if column:
                        print(f"    Column 'language_preference' exists")
                    else:
                        print(f"    Column 'language_preference' is MISSING")
            else:
                pass # Expected for shared tables in tenant schemas
