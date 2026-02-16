import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.students.models import Student
from django.contrib.auth import get_user_model
from apps.tenants.models import School

User = get_user_model()

def inspect_and_fix(subdomain, email):
    print(f"\n--- Inspecting {subdomain} ({email}) ---")
    
    # 1. Get Schema
    try:
        # Based on apps.core.db_router logic or common sense
        # Assuming subdomain matches something in School.subdomain
        school = School.objects.get(subdomain__icontains=subdomain) # Loose match
        schema = school.schema_name
        print(f"✅ Found School: {school.name} -> Schema: {schema}")
    except School.DoesNotExist:
         # Fallback mappings based on known issues
         if 'veda' in subdomain:
             schema = 'tenant_veda_vidyalaya'
         elif 'demo' in subdomain:
             schema = 'school_demo'
         else:
             schema = subdomain
         print(f"⚠️ School/Tenant lookup failed. Using fallback schema: {schema}")
    
    # 2. Find User
    try:
        user = User.objects.get(email=email)
        print(f"✅ User found: {user.id} ({user.email})")
    except User.DoesNotExist:
        print(f"❌ User {email} not found in public schema!")
        return

    # 3. Check Student in Schema
    print(f"Switching to schema: {schema}")
    with connection.cursor() as cursor:
        cursor.execute(f'SET search_path TO "{schema}", "public"')
    connection.schema_name = schema
    
    try:
        student = Student.objects.get(user=user)
        print(f"✅ Student profile FOUND: {student.id}")
        return
    except Student.DoesNotExist:
        print(f"❌ Student profile NOT FOUND for user {user.id}")
    
    # 4. Fix if missing
    print("Attempting to CREATE/LINK Student profile...")
    try:
        # Check if any unlinked student exists to hijack (bad practice but useful for recovery)
        # Or better, create a new one.
        from datetime import date
        
        # Check if a student with this email exists (without user link?) - Unlikely for OneToOne reversed
        # We just create a new one.
        
        student = Student.objects.create(
            user=user,
            first_name="Test",
            last_name="Student",
            admission_number=f"ADM-{subdomain.upper()}-{user.id.hex[:4]}",
            admission_date=date.today(),
            gender='M',
            date_of_birth=date(2010, 1, 1),
            admission_status='ACTIVE',
            email=email,
            phone_number='9999999999',
            employee_id="STU-001" # ?? Not a field
        )
        print(f"✅ Created Student profile: {student.id}")
    except Exception as e:
        print(f"❌ Creation failed: {e}")

if __name__ == "__main__":
    inspect_and_fix('veda', 'student@veda.com')
    inspect_and_fix('demo', 'student@demo.com')
