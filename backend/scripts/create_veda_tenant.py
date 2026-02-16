
import os
import sys
import django
from datetime import date

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.tenants.models import School, Domain, Subscription
from apps.authentication.models import User
from apps.staff.models import StaffMember
from apps.students.models import Student
from apps.academics.models import AcademicYear, Board, Class, Section, StudentEnrollment
from apps.core.db_router import switch_to_tenant_schema
from django.db import connection

def create_veda_tenant():
    print("=" * 70)
    print("CREATING VEDA VIDYALAYA TENANT")
    print("=" * 70)

    try:
        # 1. Create Subscription
        print("\n--- Setting up Subscription ---")
        subscription, created = Subscription.objects.get_or_create(
            name='Standard Plan',
            defaults={
                'price_monthly': 0.00,
                'price_yearly': 0.00,
                'description': 'Standard Plan for testing',
                'max_students': 2000,
                'max_staff': 100,
                'max_teachers': 100,
                'features': {"all": True},
                'is_active': True
            }
        )
        print(f"Subscription: {subscription.name} (Created: {created})")

        # 2. Create School (Tenant)
        print("\n--- Creating School (Tenant) ---")
        school_name = "Veda Vidyalaya"
        subdomain = "veda"
        
        school, created = School.objects.get_or_create(
            subdomain=subdomain,
            defaults={
                'name': school_name,
                'code': 'VEDA01',
                'schema_name': f'tenant_{subdomain}',
                'phone': '9876543210',
                'email': 'admin@vedavidyalaya.edu.in',
                'address': '123 Veda Campus',
                'city': 'Varanasi',
                'state': 'Uttar Pradesh',
                'country': 'India',
                'pincode': '221001',
                'subscription': subscription,
                'subscription_start_date': date(2024, 1, 1),
                'subscription_end_date': date(2025, 12, 31),
                'is_active': True,
                # 'auto_create_schema': True  # Usually the model handles this on save if configured
            }
        )
        print(f"School: {school.name} ({school.subdomain}) (Created: {created})")

        # 3. Create Domain
        print("\n--- Creating Domain ---")
        domain, created = Domain.objects.get_or_create(
            domain=subdomain,
            defaults={
                'school': school, # Changed from tenant to school based on previous error
                'is_primary': True
            }
        )
        print(f"Domain: {domain.domain} (Created: {created})")

        # 4. Setup Tenant Data (Users, etc.)
        print("\n--- Setting up Tenant Data ---")
        
        # Switch schema
        switch_to_tenant_schema(school)
        print(f"Switched to schema: {school.schema_name}")

        # Setup Academic Year
        ay, _ = AcademicYear.objects.get_or_create(
            name='2025-2026',
            defaults={
                'start_date': date(2025, 4, 1),
                'end_date': date(2026, 3, 31),
                'is_current': True
            }
        )
        
        
        # Setup Board/Class/Section for testing
        print("\n--- Getting Academic Structure ---")
        board = Board.objects.first()
        if not board:
            board = Board.objects.create(board_code='CBSE', board_name='CBSE', board_type='CBSE')
            print("Created Board")
            
        try:
            class_10 = Class.objects.get(class_order=10)
            print(f"Found Class: {class_10.name}")
        except Class.DoesNotExist:
            class_10 = Class.objects.create(name='10', class_order=10, board=board)
            print("Created Class 10")
            
        section_a, _ = Section.objects.get_or_create(
            name='A', 
            class_instance=class_10, 
            defaults={'capacity': 40}
        )
        print(f"Section: {section_a.name}")

        # --- Users ---
        password = 'School@123'
        
        # Admin
        admin_email = 'admin@vedavidyalaya.edu.in'
        if not User.objects.filter(email=admin_email).exists():
            admin_user = User.objects.create_superuser(
                email=admin_email,
                password=password,
                first_name='Admin',
                last_name='Veda',
                user_type='SCHOOL_ADMIN',
                phone='9999999901'
            )
            print(f"Created Admin: {admin_email} / {password}")
        else:
            print(f"Admin already exists: {admin_email}")

        # Teacher
        teacher_email = 'teacher@veda.school'
        if not User.objects.filter(email=teacher_email).exists():
            teacher_user = User.objects.create_user(
                email=teacher_email,
                password=password,
                first_name='Priya',
                last_name='Singh',
                user_type='TEACHER',
                phone='9999999902'
            )
            StaffMember.objects.create(
                user=teacher_user,
                employee_id='VEDA-T-001',
                designation='Senior Teacher',
                date_of_birth=date(1985, 1, 1),
                joining_date=date(2020, 1, 1)
            )
            print(f"Created Teacher: {teacher_email} / {password}")
        else:
            print(f"Teacher already exists: {teacher_email}")

        # Student
        student_email = 'student@veda.school'
        student_user = None
        
        if not User.objects.filter(email=student_email).exists():
            student_user = User.objects.create_user(
                email=student_email,
                password=password,
                first_name='Arjun',
                last_name='Sharma',
                user_type='STUDENT',
                phone='9999999903'
            )
            print(f"Created Student User: {student_email}")
        else:
            student_user = User.objects.get(email=student_email)
            print(f"Student User already exists: {student_email}")

        student_profile, created = Student.objects.get_or_create(
            user=student_user,
            defaults={
                'admission_number': 'VEDA-S-001',
                'admission_date': date.today(),
                'date_of_birth': date(2010, 1, 1)
            }
        )
        if created:
            print("Created Student Profile")
        else:
            print("Student Profile already exists")

        enrollment, created = StudentEnrollment.objects.get_or_create(
            student=student_profile,
            academic_year=ay,
            defaults={
                'section': section_a,
                'enrollment_date': date.today(),
                'enrollment_status': 'ENROLLED'
            }
        )
        if created:
            print("Created Student Enrollment")
        else:
            print("Student Enrollment already exists")
            
        print(f"Student Setup Complete: {student_email} / {password}")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_veda_tenant()
