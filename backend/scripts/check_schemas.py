import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

def list_schemas():
    with connection.cursor() as cursor:
        cursor.execute("SELECT schema_name FROM information_schema.schemata;")
        schemas = [row[0] for row in cursor.fetchall()]
        print("Available Schemas:")
        for s in schemas:
            print(f" - {s}")

    print("\nChecking 'veda' data:")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SET search_path to veda, public")
            cursor.execute("SELECT count(*) FROM students")
            print(f" - Students in 'veda': {cursor.fetchone()[0]}")
    except Exception as e:
        print(f" - 'veda' check failed: {e}")

    print("\nChecking 'tenant_veda_vidyalaya' data:")
    try:
        with connection.cursor() as cursor:
            cursor.execute("SET search_path to tenant_veda_vidyalaya, public")
            cursor.execute("SELECT count(*) FROM students")
            print(f" - Students in 'tenant_veda_vidyalaya': {cursor.fetchone()[0]}")
    except Exception as e:
        print(f" - 'tenant_veda_vidyalaya' check failed: {e}")

if __name__ == "__main__":
    list_schemas()
