
import os
import sys
import django
from django.db import connection

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

def inspect_audit_table():
    schema = 'tenant_veda_vidyalaya'
    print(f"Inspecting audit_logs in: {schema}")
    
    sql = """
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_schema = %s AND table_name = 'audit_logs'
    ORDER BY ordinal_position
    """
    
    with connection.cursor() as cursor:
        try:
            cursor.execute(sql, [schema])
            columns = cursor.fetchall()
            for col in columns:
                print(f"{col[0]}: {col[1]} (Nullable: {col[2]}, Default: {col[3]})")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    inspect_audit_table()
