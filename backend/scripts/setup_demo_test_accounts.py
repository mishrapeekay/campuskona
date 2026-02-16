#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from django.contrib.auth.hashers import make_password

schema = 'school_demo'
password = 'School@123'
hashed_password = make_password(password)

print("=" * 70)
print("DEMO TENANT - RESETTING PASSWORDS FOR TEST ACCOUNTS")
print("=" * 70)

test_accounts = [
    'std.1@demo.school',  # Student
    'std.2@demo.school',  # Student
    'mr..john smith@demo.school',  # Teacher
    'mr..robert dsouza@demo.school',  # Principal
]

with connection.cursor() as cursor:
    for email in test_accounts:
        cursor.execute(f"""
            UPDATE {schema}.users 
            SET password = %s, is_active = true
            WHERE email = %s
            RETURNING email, user_type
        """, [hashed_password, email])
        
        result = cursor.fetchone()
        if result:
            email, user_type = result
            print(f"\n✅ {email}")
            print(f"   Type: {user_type}")
            print(f"   Password: {password}")

print("\n" + "=" * 70)
print("✅ TEST ACCOUNTS READY!")
print("=" * 70)
print("\nYou can now login with:")
print("\n📚 STUDENT ACCOUNTS:")
print("   std.1@demo.school / School@123")
print("   std.2@demo.school / School@123")
print("\n👨‍🏫 TEACHER ACCOUNT:")
print("   mr..john smith@demo.school / School@123")
print("\n🏫 PRINCIPAL ACCOUNT:")
print("   mr..robert dsouza@demo.school / School@123")
print("\n" + "=" * 70)
print("NEXT STEPS:")
print("=" * 70)
print("1. In the mobile app, select 'Demo High School'")
print("2. Login with any of the accounts above")
print("3. Test the respective dashboards")
print("\n" + "=" * 70)
