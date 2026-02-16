#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from django.contrib.auth.hashers import make_password

# Veda Vidyalaya schema
schema = 'tenant_veda_vidyalaya'

# Password to set
password = 'School@123'
hashed_password = make_password(password)

print("=" * 70)
print("RESETTING PASSWORDS FOR TEST ACCOUNTS")
print("=" * 70)

with connection.cursor() as cursor:
    # Reset password for a student
    student_email = 'vv-adm-2024-0490@vedavidyalaya.edu.in'
    cursor.execute(f"""
        UPDATE {schema}.users
        SET password = %s
        WHERE email = %s
    """, [hashed_password, student_email])
    print(f"\n✅ Student Account Reset:")
    print(f"   Email: {student_email}")
    print(f"   Password: {password}")
    
    # Reset password for a teacher
    teacher_email = 'vv-emp-0004@vedavidyalaya.edu.in'
    cursor.execute(f"""
        UPDATE {schema}.users
        SET password = %s
        WHERE email = %s
    """, [hashed_password, teacher_email])
    print(f"\n✅ Teacher Account Reset:")
    print(f"   Email: {teacher_email}")
    print(f"   Password: {password}")
    
    # Reset password for a school admin
    admin_email = 'vv-emp-0001@vedavidyalaya.edu.in'
    cursor.execute(f"""
        UPDATE {schema}.users
        SET password = %s
        WHERE email = %s
    """, [hashed_password, admin_email])
    print(f"\n✅ School Admin Account Reset:")
    print(f"   Email: {admin_email}")
    print(f"   Password: {password}")

print("\n" + "=" * 70)
print("NEXT STEPS:")
print("=" * 70)
print("\n1. In the mobile app, select 'Veda Vidyalaya' as the school")
print("2. Login with any of the accounts above")
print("3. Test the respective dashboards")
print("\n" + "=" * 70)
