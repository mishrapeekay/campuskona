#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

# Veda Vidyalaya schema
schema = 'tenant_veda_vidyalaya'

print("=" * 70)
print("CHECKING PASSWORD HASH FOR TEST ACCOUNT")
print("=" * 70)

with connection.cursor() as cursor:
    # Check if the password was updated
    cursor.execute(f"""
        SELECT email, password, is_active, user_type
        FROM {schema}.users
        WHERE email = 'vv-adm-2024-0490@vedavidyalaya.edu.in'
    """)
    
    result = cursor.fetchone()
    if result:
        email, password_hash, is_active, user_type = result
        print(f"\n✓ User found:")
        print(f"  Email: {email}")
        print(f"  User Type: {user_type}")
        print(f"  Active: {is_active}")
        print(f"  Password Hash: {password_hash[:50]}...")
        print(f"  Hash starts with: {password_hash[:10]}")
        
        # Check if it's a Django password hash
        if password_hash.startswith('pbkdf2_sha256'):
            print("\n✓ Password hash format is correct (Django pbkdf2_sha256)")
        else:
            print(f"\n✗ WARNING: Password hash format is unusual: {password_hash[:20]}")
    else:
        print("\n✗ User not found!")

print("\n" + "=" * 70)
