"""
Veda Vidyalaya - Create Students and Teachers (FIXED)

Corrected model imports and field names.
"""

import os
import sys
import django
from pathlib import Path
from datetime import datetime, date, timedelta
import random

# Fix Windows console encoding
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Setup Django
sys.path.append(str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from apps.tenants.models import School
from apps.academics.models import Class, Section, AcademicYear, StudentEnrollment
from apps.authentication.models import User

print("="*80)
print("VEDA VIDYALAYA - CREATE STUDENTS & TEACHERS")
print("="*80)
print()

# Statistics
stats = {
    'teachers': 0,
    'students': 0,
    'enrollments': 0,
}

# Sample data
INDIAN_FIRST_NAMES_MALE = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Arnav", "Ayaan",
    "Krishna", "Ishaan", "Shaurya", "Atharva", "Advik", "Pranav", "Reyansh"
]

INDIAN_FIRST_NAMES_FEMALE = [
    "Aadhya", "Ananya", "Pari", "Anika", "Sara", "Diya", "Ira", "Myra",
    "Navya", "Kiara", "Saanvi", "Kavya", "Avni", "Riya", "Ishita"
]

INDIAN_LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Reddy", "Joshi",
    "Nair", "Iyer", "Kapoor", "Malhotra", "Chopra", "Mehta", "Shah"
]

# Find tenant
print("[1/3] Finding tenant...")
tenant = School.objects.get(subdomain="vedatest")
print(f"   ✅ {tenant.name} ({tenant.schema_name})")

# Switch schema
print("\n[2/3] Switching to tenant schema...")
with connection.cursor() as cursor:
    cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')
print(f"   ✅ Schema: {tenant.schema_name}")

# Create Teachers
print("\n[3/3] Creating teachers...")
try:
    from apps.staff.models import StaffMember

    # Clear existing teachers
    StaffMember.objects.filter(designation='TEACHER').delete()

    # Switch to public schema to delete users
    with connection.cursor() as cursor:
        cursor.execute('SET search_path TO "public"')
    User.objects.filter(user_type='TEACHER', email__contains='@veda.com').delete()

    # Switch back to tenant schema
    with connection.cursor() as cursor:
        cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')

    print("   → Creating teacher accounts...")

    teacher_data = [
        {"name": "Rajesh Kumar", "subject": "Mathematics", "dept": "ACADEMICS"},
        {"name": "Priya Sharma", "subject": "English", "dept": "ACADEMICS"},
        {"name": "Amit Verma", "subject": "Science", "dept": "ACADEMICS"},
        {"name": "Sunita Patel", "subject": "Hindi", "dept": "ACADEMICS"},
        {"name": "Vikram Singh", "subject": "Social Science", "dept": "ACADEMICS"},
        {"name": "Meena Gupta", "subject": "Computer Science", "dept": "ACADEMICS"},
        {"name": "Ravi Reddy", "subject": "Physical Education", "dept": "SPORTS"},
        {"name": "Anjali Nair", "subject": "Art & Craft", "dept": "ARTS"},
        {"name": "Suresh Iyer", "subject": "Music", "dept": "ARTS"},
        {"name": "Kavita Mehta", "subject": "Mathematics", "dept": "ACADEMICS"},
    ]

    for idx, t_data in enumerate(teacher_data):
        parts = t_data["name"].split()
        first_name = parts[0]
        last_name = parts[-1]

        # Create User in public schema
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        email = f"teacher{idx+1}@veda.com"
        user = User.objects.create_user(
            email=email,
            password='teacher123',
            first_name=first_name,
            last_name=last_name,
            phone=f"97001{10000 + idx}",  # Unique phone numbers
            user_type='TEACHER',
            is_staff=False,
            is_active=True,
            email_verified=True,
            phone_verified=True
        )

        # Switch to tenant schema
        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')

        # Create StaffMember profile
        staff = StaffMember.objects.create(
            user=user,
            employee_id=f"VV-TCHR-{1001 + idx}",
            designation='TEACHER',
            department=t_data["dept"],
            employment_type='PERMANENT',
            employment_status='ACTIVE',
            joining_date=date.today() - timedelta(days=365 * 5),
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date(1985 + idx, 1, 15),
            gender='M' if idx % 2 == 0 else 'F',
            blood_group=random.choice(['A+', 'B+', 'O+', 'AB+']),
            phone_number=f"97001{10000 + idx}",
            email=email,
            current_address_line1=f"Address Line {idx+1}",
            current_city="Bhopal",
            current_state="Madhya Pradesh",
            current_pincode="462001"
        )

        stats['teachers'] += 1
        print(f"      ✅ {t_data['name']} ({email})")

    print(f"   ✅ Created {stats['teachers']} teachers")

except Exception as e:
    print(f"   ⚠️  Teacher creation error: {e}")
    import traceback
    traceback.print_exc()

# Create Students
print("\n[4/3] Creating students...")
try:
    from apps.students.models import Student

    # Clear existing students
    StudentEnrollment.objects.all().delete()
    Student.objects.all().delete()

    # Switch to public schema
    with connection.cursor() as cursor:
        cursor.execute('SET search_path TO "public"')
    User.objects.filter(user_type='STUDENT', email__contains='@veda.com').delete()

    # Switch back
    with connection.cursor() as cursor:
        cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')

    print("   → Creating student accounts...")

    # Get classes and sections
    classes = list(Class.objects.all().order_by('class_order')[:10])
    sections = list(Section.objects.all())
    current_ay = AcademicYear.objects.filter(is_current=True).first()

    if not classes or not sections:
        print("   ⚠️  No classes/sections found.")
    else:
        # Create 30 students
        for idx in range(30):
            is_male = idx % 2 == 0
            first_name = random.choice(INDIAN_FIRST_NAMES_MALE if is_male else INDIAN_FIRST_NAMES_FEMALE)
            last_name = random.choice(INDIAN_LAST_NAMES)

            # Assign class
            class_obj = classes[idx % len(classes)]
            class_sections = [s for s in sections if s.class_instance_id == class_obj.id]
            section_obj = random.choice(class_sections) if class_sections else sections[0]

            admission_number = f"VV-2024-{1001 + idx}"

            # Calculate age
            class_order = class_obj.class_order
            age = 5 + class_order if class_order > 2 else (3 if class_order == 1 else 4)
            dob = date.today() - timedelta(days=365 * age)

            # Create User in public schema
            with connection.cursor() as cursor:
                cursor.execute('SET search_path TO "public"')

            email = f"student{idx+1}@veda.com"
            user = User.objects.create_user(
                email=email,
                password='student123',
                first_name=first_name,
                last_name=last_name,
                phone=f"96002{20000 + idx}",  # Unique phone numbers
                user_type='STUDENT',
                is_staff=False,
                is_active=True,
                email_verified=True,
                phone_verified=True
            )

            # Switch to tenant schema
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')

            # Create Student profile
            student = Student.objects.create(
                user=user,
                admission_number=admission_number,
                admission_date=date(2024, 4, 1),
                admission_status='ACTIVE',
                first_name=first_name,
                last_name=last_name,
                date_of_birth=dob,
                gender='M' if is_male else 'F',
                blood_group=random.choice(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
                phone_number=f"96002{20000 + idx}",
                email=email,

                # Address
                current_address_line1=f"House {idx + 1}, Street {idx % 10 + 1}",
                current_city="Bhopal",
                current_state="Madhya Pradesh",
                current_pincode="462001",

                # Parent info
                father_name=f"{random.choice(INDIAN_FIRST_NAMES_MALE)} {last_name}",
                father_phone=f"95003{30000 + idx}",
                father_email=f"father{idx+1}@veda.com",
                father_occupation=random.choice(['Engineer', 'Doctor', 'Teacher', 'Business']),

                mother_name=f"{random.choice(INDIAN_FIRST_NAMES_FEMALE)} {last_name}",
                mother_phone=f"94004{40000 + idx}",
                mother_email=f"mother{idx+1}@veda.com",
                mother_occupation=random.choice(['Homemaker', 'Teacher', 'Doctor', 'Engineer'])
            )

            # Create enrollment
            StudentEnrollment.objects.create(
                student=student,
                academic_year=current_ay,
                section=section_obj,
                roll_number=idx + 1,
                enrollment_date=date(2024, 4, 1),
                enrollment_status='ACTIVE',
                is_active=True
            )

            stats['students'] += 1
            stats['enrollments'] += 1

            if (idx + 1) % 10 == 0:
                print(f"      ✅ Created {idx + 1} students...")

    print(f"   ✅ Created {stats['students']} students")
    print(f"   ✅ Created {stats['enrollments']} enrollments")

except Exception as e:
    print(f"   ⚠️  Student creation error: {e}")
    import traceback
    traceback.print_exc()

# Summary
print("\n" + "="*80)
print("✅ STUDENTS & TEACHERS CREATED!")
print("="*80)

total = sum(stats.values())
print(f"\n📊 New Records: {total:,}")
print()
for key, value in stats.items():
    if value > 0:
        print(f"   {key.replace('_', ' ').title()}: {value:,}")

print("\n" + "="*80)
print("GRAND TOTAL: {} records".format(119 + total))
print("="*80)
print()
print("Frontend: http://localhost:3000")
print()
print("Admin: admin@veda.com / admin123")
print("Teacher: teacher1@veda.com / teacher123")
print("Student: student1@veda.com / student123")
print()
print("="*80)
