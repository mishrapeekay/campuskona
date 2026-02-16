
import os
import sys
import django
from django.db import connection

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

def check_migrations():
    schema = 'tenant_veda_vidyalaya'
    print(f"Checking migrations in schema: {schema}")
    
    with connection.cursor() as cursor:
        try:
            cursor.execute(f'SET search_path TO "{schema}"')
            
            cursor.execute("SELECT app, name FROM django_migrations WHERE app = 'authentication' ORDER BY applied")
            migrations = cursor.fetchall()
            
            if not migrations:
                print("No authentication migrations applied!")
            else:
                print(f"Found {len(migrations)} authentication migrations applied:")
                for app, name in migrations:
                    print(f"- {app}.{name}")
                    
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    check_migrations()
