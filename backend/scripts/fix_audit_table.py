
import os
import sys
import django
from django.db import connection

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

def fix_audit_table():
    schema = 'tenant_veda_vidyalaya'
    print(f"Fixing audit table in: {schema}")
    
    with connection.cursor() as cursor:
        try:
            cursor.execute(f'SET search_path TO "{schema}"')
            
            # Check if core_auditlog exists
            cursor.execute("SELECT to_regclass('core_auditlog')")
            if cursor.fetchone()[0]:
                print("Found core_auditlog. Renaming to audit_logs...")
                cursor.execute('ALTER TABLE "core_auditlog" RENAME TO "audit_logs"')
                print("✅ Renamed core_auditlog to audit_logs")
            else:
                print("core_auditlog not found.")
                
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    fix_audit_table()
