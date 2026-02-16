
import os
import sys
import django
from django.db import connection

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

def recreate_audit_logs():
    schema = 'tenant_veda_vidyalaya'
    print(f"Recreating audit_logs in: {schema}")
    
    # New definition includes explicit uuid primary key 'id'
    # And other fields matching apps.core.models.AuditLog
    create_sql = """
    CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL PRIMARY KEY,
        "created_at" timestamp with time zone NOT NULL,
        "updated_at" timestamp with time zone NOT NULL,
        "action" varchar(10) NOT NULL,
        "model_name" varchar(100) NOT NULL,
        "object_id" varchar(100) NOT NULL,
        "object_repr" varchar(200) NOT NULL,
        "changes" jsonb NOT NULL,
        "ip_address" inet NULL,
        "user_agent" text NOT NULL,
        "timestamp" timestamp with time zone NOT NULL,
        "user_id" uuid NULL REFERENCES "users" ("id") DEFERRABLE INITIALLY DEFERRED
    );
    CREATE INDEX "audit_logs_model_name_object_id_idx" ON "audit_logs" ("model_name", "object_id");
    CREATE INDEX "audit_logs_user_id_timestamp_idx" ON "audit_logs" ("user_id", "timestamp");
    """
    
    with connection.cursor() as cursor:
        try:
            cursor.execute(f'SET search_path TO "{schema}"')
            
            print("Dropping existing audit_logs...")
            cursor.execute('DROP TABLE IF EXISTS "audit_logs" CASCADE')
            cursor.execute('DROP TABLE IF EXISTS "core_auditlog" CASCADE') # Just in case
            
            print("Creating new audit_logs table...")
            cursor.execute(create_sql)
            
            print("✅ 'audit_logs' table recreated.")
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    recreate_audit_logs()
