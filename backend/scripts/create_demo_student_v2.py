#!/usr/bin/env python
import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from django.contrib.auth.hashers import make_password

# Demo tenant schema
schema = 'school_demo'

print("=" * 70)
print("CREATING STUDENT ACCOUNT IN DEMO TENANT")
print("=" * 70)

with connection.cursor() as cursor:
    # Set search path
    cursor.execute(f"SET search_path TO {schema}, public")
    
    # Create user with all required fields
    hashed_password = make_password('School@123')
    
    cursor.execute(f"""
        INSERT INTO {schema}.users (
            id, email, password, first_name, last_name, user_type, 
            is_active, is_staff, is_superuser, 
            phone, email_verified, phone_verified,
            date_joined, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), 'student@demo.com', %s, 'Demo', 'Student', 'STUDENT',
            true, false, false,
            '9999999999', false, false,
            NOW(), NOW(), NOW()
        )
        ON CONFLICT (email) DO UPDATE SET 
            password = EXCLUDED.password,
            is_active = true
        RETURNING id, email
    """, [hashed_password])
    
    user_result = cursor.fetchone()
    if user_result:
        user_id, email = user_result
        print(f"\n✓ User created/updated: {email}")
        print(f"  User ID: {user_id}")
        print(f"  Password: School@123")
        
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
            
            # Try to enroll in a class if available
            cursor.execute(f"""
                SELECT s.id, c.name, s.name as section_name
                FROM {schema}.sections s
                JOIN {schema}.classes c ON s.class_instance_id = c.id
                JOIN {schema}.academic_years ay ON s.academic_year_id = ay.id
                WHERE ay.is_current = true
                LIMIT 1
            """)
            
            section_result = cursor.fetchone()
            if section_result:
                section_id, class_name, section_name = section_result
                
                # Get academic year
                cursor.execute(f"""
                    SELECT id FROM {schema}.academic_years WHERE is_current = true LIMIT 1
                """)
                ay_result = cursor.fetchone()
                
                if ay_result:
                    ay_id = ay_result[0]
                    
                    # Create enrollment
                    cursor.execute(f"""
                        INSERT INTO {schema}.student_enrollments (
                            id, student_id, section_id, academic_year_id,
                            enrollment_date, roll_number, enrollment_status, is_active,
                            created_at, updated_at, is_deleted
                        ) VALUES (
                            gen_random_uuid(), %s, %s, %s,
                            %s, '1', 'ENROLLED', true,
                            NOW(), NOW(), false
                        )
                        ON CONFLICT DO NOTHING
                        RETURNING id
                    """, [student_id, section_id, ay_id, date.today()])
                    
                    enr_result = cursor.fetchone()
                    if enr_result:
                        print(f"\n✓ Enrolled in: {class_name} - {section_name}")
                    else:
                        print(f"\n⚠️  Enrollment already exists")
        else:
            print(f"\n⚠️  Student profile already exists")

print("\n" + "=" * 70)
print("✅ STUDENT ACCOUNT READY!")
print("=" * 70)
print("\nLogin credentials:")
print("  School: Demo High School")
print("  Email: student@demo.com")
print("  Password: School@123")
print("\n" + "=" * 70)
