
import os
import sys
import django
from datetime import date
from django.db import connection

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.tenants.models import School
from apps.authentication.models import User, Role, UserRole
from apps.students.models import Student
from apps.staff.models import StaffMember
from apps.academics.models import AcademicYear, Board, Class, Section, Subject, StudentEnrollment
from apps.core.db_router import switch_to_tenant_schema

def setup_veda_users():
    print("=" * 70)
    print("SETTING UP VEDA VIDYALAYA TENANT")
    print("=" * 70)
    
    try:
        school = School.objects.get(subdomain='veda')
        print(f"Found school: {school.name} ({school.schema_name})")
        
        # Switch to tenant schema
        switch_to_tenant_schema(school)
        
        # 1. Setup Academic Structure
        print("\n--- Setting up Academics ---")
        ay, _ = AcademicYear.objects.get_or_create(
            name='2025-2026',
            defaults={
                'start_date': date(2025, 4, 1),
                'end_date': date(2026, 3, 31),
                'is_current': True
            }
        )
        print(f"Academic Year: {ay.name}")
        
        board, _ = Board.objects.get_or_create(
            board_code='CBSE',
            defaults={
                'board_name': 'Central Board of Secondary Education',
                'board_type': 'CBSE',
                'minimum_passing_percentage': 33,
                'is_active': True
            }
        )
        print(f"Board: {board.board_name}")
        
        class_10, _ = Class.objects.get_or_create(
            class_order=10,
            defaults={
                'name': '10',
                'display_name': 'Class 10',
                'board': board,
                'is_active': True
            }
        )
        
        section_a, _ = Section.objects.get_or_create(
            name='A',
            class_instance=class_10,
            defaults={
                'capacity': 40,
                'is_active': True
            }
        )
        print(f"Class/Section: {class_10.name}-{section_a.name}")
        
        # 2. Create Users
        password = 'School@123'
        
        # --- Student ---
        print("\n--- Creating Student ---")
        stu_email = 'student.veda@veda.school'
        stu_user, created = User.objects.get_or_create(
            email=stu_email,
            defaults={
                'first_name': 'Arjun',
                'last_name': 'Sharma',
                'user_type': 'STUDENT',
                'phone': '9876543210',
                'gender': 'M',
                'is_active': True
            }
        )
        stu_user.set_password(password)
        stu_user.save()
        
        student, _ = Student.objects.get_or_create(
            user=stu_user,
            defaults={
                'admission_number': 'V-2025-001',
                'admission_date': date.today(),
                'admission_status': 'ACTIVE',
                'first_name': 'Arjun',
                'last_name': 'Sharma',
                'date_of_birth': date(2010, 5, 15),
                'gender': 'M',
                'current_address_line1': '123 Veda Street',
                'current_city': 'New Delhi',
                'current_state': 'Delhi',
                'current_pincode': '110001',
                'permanent_address_line1': '123 Veda Street',
                'permanent_city': 'New Delhi',
                'permanent_state': 'Delhi',
                'permanent_pincode': '110001',
                'emergency_contact_number': '9876543210',
                'father_name': 'Rajesh Sharma',
                'father_phone': '9876543210',
                'mother_name': 'Sunita Sharma',
                'category': 'GENERAL',
                'is_differently_abled': False
            }
        )
        
        # Enroll student
        StudentEnrollment.objects.get_or_create(
            student=student,
            academic_year=ay,
            defaults={
                'section': section_a,
                'enrollment_date': date.today(),
                'is_active': True
            }
        )
        print(f"Student created: {stu_email} / {password}")
        
        # --- Teacher ---
        print("\n--- Creating Teacher ---")
        teacher_email = 'teacher.veda@veda.school'
        teacher_user, _ = User.objects.get_or_create(
            email=teacher_email,
            defaults={
                'first_name': 'Priya',
                'last_name': 'Singh',
                'user_type': 'TEACHER',
                'phone': '9876543211',
                'gender': 'F',
                'is_active': True
            }
        )
        teacher_user.set_password(password)
        teacher_user.save()
        
        StaffMember.objects.get_or_create(
            user=teacher_user,
            defaults={
                'employee_id': 'V-EMP-001',
                'employment_type': 'PERMANENT',
                'employment_status': 'ACTIVE',
                'designation': 'SENIOR_TEACHER',
                'date_of_birth': date(1985, 8, 20),
                'gender': 'F',
                'phone_number': '9876543211',
                'email': teacher_email,
                'emergency_contact_name': 'Rohan Singh',
                'emergency_contact_number': '9876543211',
                'emergency_contact_relation': 'Spouse',
                'current_address_line1': '456 Veda Lane',
                'current_city': 'New Delhi',
                'current_state': 'Delhi',
                'current_pincode': '110002',
                'permanent_address_line1': '456 Veda Lane',
                'permanent_city': 'New Delhi',
                'permanent_state': 'Delhi',
                'permanent_pincode': '110002',
                'joining_date': date(2020, 4, 1)
            }
        )
        print(f"Teacher created: {teacher_email} / {password}")
        
        # --- Principal ---
        print("\n--- Creating Principal ---")
        principal_email = 'admin@veda.school'
        principal_user, _ = User.objects.get_or_create(
            email=principal_email,
            defaults={
                'first_name': 'Dr. Rajesh',
                'last_name': 'Gupta',
                'user_type': 'PRINCIPAL',
                'phone': '9876543212',
                'gender': 'M',
                'is_active': True
            }
        )
        principal_user.set_password(password)
        principal_user.save()
        
        StaffMember.objects.get_or_create(
            user=principal_user,
            defaults={
                'employee_id': 'V-EMP-000',
                'employment_type': 'PERMANENT',
                'employment_status': 'ACTIVE',
                'designation': 'PRINCIPAL',
                'date_of_birth': date(1975, 1, 10),
                'gender': 'M',
                'phone_number': '9876543212',
                'email': principal_email,
                'emergency_contact_name': 'Anita Gupta',
                'emergency_contact_number': '9876543212',
                'emergency_contact_relation': 'Spouse',
                'current_address_line1': '789 Veda Ave',
                'current_city': 'New Delhi',
                'current_state': 'Delhi',
                'current_pincode': '110003',
                'permanent_address_line1': '789 Veda Ave',
                'permanent_city': 'New Delhi',
                'permanent_state': 'Delhi',
                'permanent_pincode': '110003',
                'joining_date': date(2015, 6, 1)
            }
        )
        print(f"Principal created: {principal_email} / {password}")

        print("\n" + "=" * 70)
        print("✅ VEDA SETUP COMPLETE")
        print("=" * 70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    setup_veda_users()
