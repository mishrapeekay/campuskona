
import os
import sys
import django
from django.db import connection
from django.core.management import call_command

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

def restore_users_table():
    schema = 'tenant_veda_vidyalaya'
    print(f"Restoring 'users' table in: {schema}")
    
    sql = """
    CREATE TABLE "users" (
        "password" varchar(128) NOT NULL, 
        "last_login" timestamp with time zone NULL, 
        "is_superuser" boolean NOT NULL, 
        "first_name" varchar(150) NOT NULL, 
        "last_name" varchar(150) NOT NULL, 
        "is_staff" boolean NOT NULL, 
        "is_active" boolean NOT NULL, 
        "date_joined" timestamp with time zone NOT NULL, 
        "id" uuid NOT NULL PRIMARY KEY, 
        "email" varchar(254) NOT NULL UNIQUE, 
        "phone" varchar(15) NOT NULL UNIQUE, 
        "alternate_phone" varchar(15) NOT NULL, 
        "user_type" varchar(20) NOT NULL, 
        "date_of_birth" date NULL, 
        "gender" varchar(1) NOT NULL, 
        "avatar" varchar(100) NULL, 
        "bio" text NOT NULL, 
        "address" text NOT NULL, 
        "city" varchar(100) NOT NULL, 
        "state" varchar(100) NOT NULL, 
        "country" varchar(100) NOT NULL, 
        "pincode" varchar(10) NOT NULL, 
        "email_verified" boolean NOT NULL, 
        "email_verified_at" timestamp with time zone NULL, 
        "phone_verified" boolean NOT NULL, 
        "phone_verified_at" timestamp with time zone NULL, 
        "failed_login_attempts" integer NOT NULL, 
        "last_failed_login" timestamp with time zone NULL, 
        "account_locked_until" timestamp with time zone NULL, 
        "password_changed_at" timestamp with time zone NULL, 
        "force_password_change" boolean NOT NULL, 
        "last_login_ip" inet NULL, 
        "last_activity" timestamp with time zone NULL, 
        "created_at" timestamp with time zone NOT NULL, 
        "updated_at" timestamp with time zone NOT NULL
    );
    CREATE INDEX "users_email_a7cfd1_idx" ON "users" ("email", "is_active");
    CREATE INDEX "users_user_ty_beeeda_idx" ON "users" ("user_type", "is_active");
    CREATE INDEX "users_phone_af6883_idx" ON "users" ("phone");
    CREATE INDEX "users_email_0ea73cca_like" ON "users" ("email" varchar_pattern_ops);
    """
    
    with connection.cursor() as cursor:
        try:
            cursor.execute(f'SET search_path TO "{schema}"')
            cursor.execute(sql)
            print("✅ 'users' table created.")
            
            # Now run migrations to fix other things
            print("🚀 Retrying migrations...")
            call_command('migrate', '--database=default', verbosity=1)
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    restore_users_table()
