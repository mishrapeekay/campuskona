
import os
import sys
import django
from django.db import connection
from django.core.management import call_command

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

def fix_veda_schema():
    schema = 'tenant_veda_vidyalaya'
    print(f"Fixing schema: {schema}")
    
    with connection.cursor() as cursor:
        try:
            # 1. Switch to schema
            cursor.execute(f'SET search_path TO "{schema}"')
            print(f"✅ Switched to schema: {schema}")
            
            # 2. Get SQL for authentication 0001
            print("Generating SQL for authentication 0001...")
            sql = call_command('sqlmigrate', 'authentication', '0001')
            
            # 3. Execute SQL
            print("Executing SQL to restore 'users' table...")
            cursor.execute(sql)
            print("✅ 'users' table restored and related tables created.")
            
            # 4. Now run general migration to fix other apps (library, etc.)
            print("Running remaining migrations...")
            call_command('migrate', '--database=default', verbosity=1)
            print("✅ distinct migrations completed.")
            
        except Exception as e:
            print(f"Error: {e}")
            # If error is "relation already exists", it might be partial state.
            # But since we confirmed users table is missing, this should run fine for users table creation.

if __name__ == "__main__":
    fix_veda_schema()
