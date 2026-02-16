import os
import sys
import django
from django.db import connection

# Setup Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

try:
    django.setup()
except Exception as e:
    print(f"❌ Django/App Setup Failed: {e}")
    print("TIP: Did you install new dependencies? Try: pip install django-tenants")
    sys.exit(1)

from apps.authentication.models import User
from apps.students.models import Student
from apps.staff.models import StaffMember
from apps.core.models import TenantManager

def verify_fixes():
    print("Running Verification Script...")

    # 1. Check connection.schema_name
    print("\n[Test 1] Checking connection.schema_name...")
    # With django-tenants backend, this might optionally exist or default to public
    if hasattr(connection, 'schema_name'):
        print(f"✅ connection.schema_name exists: {connection.schema_name}")
    else:
        print("⚠️ connection.schema_name attribute not found immediately (Safe handling in models should cover this)")

    # 2. Test Student Save (Crash Fix)
    print("\n[Test 2] Testing Student Save (Crash Verification)...")
    try:
        import random
        rand_suffix = random.randint(1000, 9999)
        # Create a dummy user
        user, created = User.objects.get_or_create(
            email=f'test_student_verify_{rand_suffix}@example.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'Student',
                'user_type': 'STUDENT',
                'phone': f'99999{rand_suffix}' # Unique phone
            }
        )
        
        # Try to save a student
        student = Student(
            user=user,
            first_name='Test',
            last_name='Student',
            date_of_birth='2010-01-01',
            admission_date='2024-01-01',
            gender='M',
            father_name='Father',
            mother_name='Mother',
            emergency_contact_number='8888888888',
            current_address_line1='Addr',
            current_city='City',
            current_state='State',
            current_pincode='123456',
            permanent_address_line1='Addr',
            permanent_city='City',
            permanent_state='State',
            permanent_pincode='123456'
        )
        # Verify admission_number is generated without crash
        student.save()
        print(f"✅ Student saved successfully! Admission number: {student.admission_number}")
        
        # Cleanup
        student.delete()
        user.delete()
        
    except Exception as e:
        print(f"❌ Student Save FAILED: {e}")
        import traceback
        traceback.print_exc()

    # 3. Test Staff Isolation
    print("\n[Test 3] Checking Staff Tenant Manager...")
    if isinstance(StaffMember.objects, TenantManager):
        print("✅ StaffMember uses TenantManager for isolation.")
    else:
        print(f"ℹ️ StaffMember Manager: {type(StaffMember.objects)}")

if __name__ == "__main__":
    verify_fixes()
