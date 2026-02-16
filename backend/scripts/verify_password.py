#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from django.contrib.auth.hashers import check_password

schema = 'school_demo'
test_email = 'std.1@demo.school'
test_password = 'School@123'

print("=" * 70)
print("VERIFYING PASSWORD FOR TEST ACCOUNT")
print("=" * 70)

with connection.cursor() as cursor:
    # Get user and password hash
    cursor.execute(f"""
        SELECT id, email, password, is_active, user_type
        FROM {schema}.users
        WHERE email = %s
    """, [test_email])
    
    result = cursor.fetchone()
    if result:
        user_id, email, password_hash, is_active, user_type = result
        print(f"\n✓ User found: {email}")
        print(f"  User ID: {user_id}")
        print(f"  User Type: {user_type}")
        print(f"  Is Active: {is_active}")
        print(f"  Password Hash: {password_hash[:50]}...")
        
        # Verify password
        if check_password(test_password, password_hash):
            print(f"\n✅ PASSWORD VERIFICATION: SUCCESS")
            print(f"   The password '{test_password}' is CORRECT")
        else:
            print(f"\n❌ PASSWORD VERIFICATION: FAILED")
            print(f"   The password '{test_password}' does NOT match")
            
            # Try to reset it again
            from django.contrib.auth.hashers import make_password
            new_hash = make_password(test_password)
            cursor.execute(f"""
                UPDATE {schema}.users
                SET password = %s
                WHERE email = %s
            """, [new_hash, test_email])
            print(f"\n🔄 Password has been reset again")
    else:
        print(f"\n❌ User NOT found: {test_email}")

print("\n" + "=" * 70)
