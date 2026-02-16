#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

def check_user(email, schema):
    with connection.cursor() as cursor:
        try:
            cursor.execute(f"SELECT id, is_active FROM {schema}.users WHERE email = %s", [email])
            result = cursor.fetchone()
            if result:
                print(f"✅ Found {email} in '{schema}'.users (Active: {result[1]})")
            else:
                print(f"❌ NOT Found {email} in '{schema}'.users")
        except Exception as e:
            print(f"⚠️ Error querying {schema}: {e}")

print("Checking User Locations...")
print("-" * 50)

# Check Teacher
check_user('teacher@demo.com', 'public')
check_user('teacher@demo.com', 'school_demo')

print("-" * 50)

# Check Student
check_user('std.1@demo.school', 'public')
check_user('std.1@demo.school', 'school_demo')

print("-" * 50)

# Check Veda Student
check_user('vv-adm-2024-0490@vedavidyalaya.edu.in', 'public')
check_user('vv-adm-2024-0490@vedavidyalaya.edu.in', 'tenant_veda_vidyalaya')
