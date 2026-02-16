
import os
import sys
import django
from django.db import connection

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

def check_veda_tables():
    schema = 'tenant_veda_vidyalaya'
    print(f"Checking tables in schema: {schema}")
    
    with connection.cursor() as cursor:
        try:
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = %s", [schema])
            tables = cursor.fetchall()
            
            if not tables:
                print("No tables found in this schema! It might need migration.")
            else:
                print(f"Found {len(tables)} tables:")
                for table in tables:
                    print(f"- {table[0]}")
                    
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    check_veda_tables()
