"""
Simplified Demo Data Population
Uses Django management command approach for better compatibility
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.core.management import call_command
from django.db import connection

# Run migrations for the demo schema
print("Running migrations for demo schema...")
print("="*60)

# We need to manually run migrations for the tenant schema
# This is a simplified approach

with connection.cursor() as cursor:
    cursor.execute("SET search_path TO school_demo, public")
    
    # Check if tables exist
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'school_demo' 
        AND table_name = 'students'
    """)
    
    if not cursor.fetchone():
        print("Tables don't exist in school_demo schema.")
        print("Running migrations...")
        
        # We need to run migrations with the schema context
        # For now, let's use a direct SQL approach to copy the structure
        
        cursor.execute("""
            DO $$
            DECLARE
                r RECORD;
            BEGIN
                FOR r IN 
                    SELECT tablename FROM pg_tables 
                    WHERE schemaname = 'public' 
                    AND tablename NOT LIKE 'public_%'
                    AND tablename NOT LIKE 'django_%'
                    AND tablename NOT LIKE 'auth_%'
                    AND tablename != 'users'
                LOOP
                    EXECUTE 'CREATE TABLE IF NOT EXISTS school_demo.' || quote_ident(r.tablename) || 
                            ' (LIKE public.' || quote_ident(r.tablename) || ' INCLUDING ALL)';
                END LOOP;
            END $$;
        """)
        
        print("✅ Schema structure created")
    else:
        print("✅ Tables already exist in school_demo schema")

print("\n" + "="*60)
print("Schema setup complete!")
print("="*60)
print("\nNow run the Django admin to create users manually, or use:")
print("python backend/manage.py createsuperuser")
print("\nFor demo purposes, you can also use the existing accounts")
print("that may have been created in previous runs.")
