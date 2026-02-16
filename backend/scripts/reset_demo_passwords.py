#!/usr/bin/env python
"""
Simple password reset for demo tenant users using direct SQL.
"""
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
print("DEMO TENANT - PASSWORD RESET")
print("=" * 70)

with connection.cursor() as cursor:
    # Reset teacher password
    cursor.execute(f"""
        UPDATE {schema}.users 
        SET password = %s, is_active = true
        WHERE email = 'teacher@demo.com'
        RETURNING email, user_type
    """, [hashed_password])
    
    result = cursor.fetchone()
    if result:
        email, user_type = result
        print(f"\n✅ Teacher Account Ready:")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Type: {user_type}")
    
    # Check if teacher has a staff profile
    cursor.execute(f"""
        SELECT sm.id, sm.employee_id, sm.designation
        FROM {schema}.staff_members sm
        JOIN {schema}.users u ON sm.user_id = u.id
        WHERE u.email = 'teacher@demo.com'
    """)
    
    staff_result = cursor.fetchone()
    if staff_result:
        staff_id, emp_id, designation = staff_result
        print(f"\n✅ Staff Profile Found:")
        print(f"   Staff ID: {staff_id}")
        print(f"   Employee ID: {emp_id}")
        print(f"   Designation: {designation}")
    else:
        print(f"\n⚠️  No staff profile found for teacher@demo.com")

print("\n" + "=" * 70)
print("READY FOR TESTING")
print("=" * 70)
print("\n✅ You can now test:")
print("   1. Teacher Dashboard - teacher@demo.com / School@123")
print("   2. School Admin Dashboard - teacher@demo.com / School@123 (if has admin role)")
print("\n" + "=" * 70)
