#!/usr/bin/env python
import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from apps.authentication.models import User
from apps.students.models import Student
from apps.academics.models import AcademicYear, Class, Section, StudentEnrollment

# Demo tenant schema
schema = 'school_demo'

print("=" * 70)
print("CREATING STUDENT ACCOUNT IN DEMO TENANT")
print("=" * 70)

with connection.cursor() as cursor:
    # Set search path
    cursor.execute(f"SET search_path TO {schema}, public")
    
    # Create user with temp password
    from django.contrib.auth.hashers import make_password
    temp_password = make_password('temp123')
    
    cursor.execute(f"""
        INSERT INTO {schema}.users (
            id, email, password, first_name, last_name, user_type, 
            is_active, is_staff, is_superuser, created_at, updated_at,
            phone, email_verified, phone_verified
        ) VALUES (
            gen_random_uuid(), 'student@demo.com', %s, 'Demo', 'Student', 'STUDENT',
            true, false, false, NOW(), NOW(),
            '9999999999', false, false
        )
        ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
        RETURNING id, email
    """, [temp_password])
    
    user_result = cursor.fetchone()
    if user_result:
        user_id, email = user_result
        print(f"\n✓ User created/updated: {email}")
        print(f"  User ID: {user_id}")
        
        # Now set the actual password using Django's hash
        from django.contrib.auth.hashers import make_password
        hashed_pw = make_password('School@123')
        cursor.execute(f"""
            UPDATE {schema}.users SET password = %s WHERE id = %s
        """, [hashed_pw, user_id])
        print(f"  Password set to: School@123")
        
        # Create student profile
        cursor.execute(f"""
            INSERT INTO {schema}.students (
                id, user_id, admission_number, admission_date, admission_status,
                first_name, last_name, date_of_birth, gender,
                current_address_line1, current_city, current_state, current_pincode,
                permanent_address_line1, permanent_city, permanent_state, permanent_pincode,
                father_name, father_phone, mother_name, emergency_contact_number,
                created_at, updated_at, is_deleted
            ) VALUES (
                gen_random_uuid(), %s, 'DEMO-STU-001', %s, 'ACTIVE',
                'Demo', 'Student', '2010-01-01', 'M',
                '123 Demo St', 'Demo City', 'Demo State', '123456',
                '123 Demo St', 'Demo City', 'Demo State', '123456',
                'Demo Father', '9999999999', 'Demo Mother', '9999999999',
                NOW(), NOW(), false
            )
            ON CONFLICT DO NOTHING
            RETURNING id, admission_number
        """, [user_id, date.today()])
        
        student_result = cursor.fetchone()
        if student_result:
            student_id, adm_no = student_result
            print(f"\n✓ Student profile created:")
            print(f"  Student ID: {student_id}")
            print(f"  Admission #: {adm_no}")
        else:
            print(f"\n⚠️  Student profile already exists (skipped)")

print("\n" + "=" * 70)
print("✅ STUDENT ACCOUNT READY!")
print("=" * 70)
print("\nLogin credentials:")
print("  School: Demo High School")
print("  Email: student@demo.com")
print("  Password: School@123")
print("\n" + "=" * 70)
