
#!/usr/bin/env python
import os
import django
import sys

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

schema = 'tenant_veda_vidyalaya'

print("=" * 70)
print("VEDA VIDYALAYA TENANT - ACCOUNT INVENTORY")
print("=" * 70)

with connection.cursor() as cursor:
    # List all users
    cursor.execute(f'SET search_path TO "{schema}"')
    
    cursor.execute(f"""
        SELECT email, user_type, is_active, first_name, last_name
        FROM users
        ORDER BY user_type, email
    """)
    
    print("\n📧 USERS:")
    print("-" * 70)
    users = cursor.fetchall()
    for email, user_type, is_active, first_name, last_name in users:
        status = "✓" if is_active else "✗"
        print(f"  {status} {email:35} | {user_type:15} | {first_name} {last_name}")
    
    print(f"\n  Total: {len(users)} users")
    
    # Check staff profiles
    cursor.execute(f"""
        SELECT u.email, sm.employee_id, sm.designation
        FROM staff_members sm
        JOIN users u ON sm.user_id = u.id
    """)
    
    print("\n👨‍🏫 STAFF PROFILES:")
    print("-" * 70)
    staff = cursor.fetchall()
    for email, emp_id, designation in staff:
        print(f"  {email:35} | {emp_id:15} | {designation}")
    
    print(f"\n  Total: {len(staff)} staff profiles")
    
    # Check student profiles
    cursor.execute(f"""
        SELECT u.email, s.admission_number, s.first_name, s.last_name
        FROM students s
        JOIN users u ON s.user_id = u.id
    """)
    
    print("\n🎓 STUDENT PROFILES:")
    print("-" * 70)
    students = cursor.fetchall()
    for email, adm_no, first_name, last_name in students:
        print(f"  {email:35} | {adm_no:15} | {first_name} {last_name}")
    
    print(f"\n  Total: {len(students)} student profiles")

print("\n" + "=" * 70)
