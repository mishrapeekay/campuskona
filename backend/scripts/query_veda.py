#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

# Query Veda Vidyalaya schema directly
schema = 'tenant_veda_vidyalaya'

print("=" * 70)
print(f"VEDA VIDYALAYA TENANT - Direct SQL Query")
print("=" * 70)

with connection.cursor() as cursor:
    # Check users
    cursor.execute(f"""
        SELECT email, user_type, is_active, first_name, last_name
        FROM {schema}.users
        ORDER BY user_type, email
        LIMIT 10
    """)
    
    print("\n📧 USERS (First 10):")
    print("-" * 70)
    for row in cursor.fetchall():
        email, user_type, is_active, first_name, last_name = row
        print(f"  {email:35} | {user_type:10} | Active: {is_active} | {first_name} {last_name}")
    
    # Count users
    cursor.execute(f"SELECT COUNT(*) FROM {schema}.users")
    user_count = cursor.fetchone()[0]
    print(f"\n  Total Users: {user_count}")
    
    # Check students
    cursor.execute(f"""
        SELECT s.admission_number, s.first_name, s.last_name, u.email
        FROM {schema}.students s
        JOIN {schema}.users u ON s.user_id = u.id
        LIMIT 5
    """)
    
    print("\n🎓 STUDENTS (First 5):")
    print("-" * 70)
    for row in cursor.fetchall():
        adm_no, first_name, last_name, email = row
        print(f"  {adm_no:12} | {first_name} {last_name:25} | {email}")
    
    cursor.execute(f"SELECT COUNT(*) FROM {schema}.students")
    student_count = cursor.fetchone()[0]
    print(f"\n  Total Students: {student_count}")
    
    # Check staff
    cursor.execute(f"""
        SELECT sm.employee_id, sm.first_name, sm.last_name, sm.designation, u.email
        FROM {schema}.staff_members sm
        JOIN {schema}.users u ON sm.user_id = u.id
        LIMIT 5
    """)
    
    print("\n👨‍🏫 STAFF (First 5):")
    print("-" * 70)
    for row in cursor.fetchall():
        emp_id, first_name, last_name, designation, email = row
        print(f"  {emp_id:12} | {first_name} {last_name:25} | {designation:15} | {email}")
    
    cursor.execute(f"SELECT COUNT(*) FROM {schema}.staff_members")
    staff_count = cursor.fetchone()[0]
    print(f"\n  Total Staff: {staff_count}")

print("\n" + "=" * 70)
print("To test dashboards, we need to reset passwords for these accounts")
print("=" * 70)
