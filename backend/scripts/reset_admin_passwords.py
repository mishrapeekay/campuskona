#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from django.contrib.auth.hashers import make_password

# Reset password for public schema admin/superadmin accounts
password = 'Admin@123'
hashed_password = make_password(password)

print("=" * 70)
print("PUBLIC SCHEMA - RESETTING ADMIN/SUPERADMIN PASSWORDS")
print("=" * 70)

with connection.cursor() as cursor:
    # First, let's see what admin accounts exist
    cursor.execute("""
        SELECT id, email, user_type, is_active, first_name, last_name
        FROM public.users
        WHERE user_type IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
        ORDER BY user_type, email
    """)
    
    admin_accounts = cursor.fetchall()
    
    if not admin_accounts:
        print("\n⚠️  NO ADMIN ACCOUNTS FOUND IN PUBLIC SCHEMA!")
        print("\nCreating default superadmin account...")
        
        # Create a default superadmin account
        cursor.execute("""
            INSERT INTO public.users (
                email, password, user_type, is_active, 
                first_name, last_name, is_staff, is_superuser
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, email, user_type
        """, [
            'superadmin@school.com',
            hashed_password,
            'SUPER_ADMIN',
            True,
            'Super',
            'Admin',
            True,
            True
        ])
        
        result = cursor.fetchone()
        if result:
            user_id, email, user_type = result
            print(f"\n✅ Created: {email}")
            print(f"   Type: {user_type}")
            print(f"   Password: {password}")
    else:
        print(f"\n📋 Found {len(admin_accounts)} admin account(s):")
        print("-" * 70)
        
        for user_id, email, user_type, is_active, first_name, last_name in admin_accounts:
            status = "✓" if is_active else "✗"
            print(f"  {status} {email:35} | {user_type:15} | {first_name} {last_name}")
        
        print("\n🔄 Resetting passwords...")
        
        # Reset passwords for all admin accounts
        cursor.execute("""
            UPDATE public.users 
            SET password = %s, is_active = true
            WHERE user_type IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
            RETURNING email, user_type
        """, [hashed_password])
        
        updated_accounts = cursor.fetchall()
        
        print("\n✅ Updated accounts:")
        for email, user_type in updated_accounts:
            print(f"   {email} ({user_type})")
            print(f"   Password: {password}")

print("\n" + "=" * 70)
print("✅ ADMIN ACCOUNTS READY!")
print("=" * 70)
print("\nYou can now login to the backend with:")
print("\n🔐 ADMIN CREDENTIALS:")
print(f"   Password: {password}")
print("\n   Use any of the admin emails listed above")
print("\n" + "=" * 70)
print("NEXT STEPS:")
print("=" * 70)
print("1. Access the Django admin at: http://localhost:8000/admin/")
print("2. Login with the credentials above")
print("3. You can manage all tenants and users from there")
print("\n" + "=" * 70)
