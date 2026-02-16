"""
Veda Vidyalaya - Create Students and Teachers

This script creates sample students and teachers with User accounts.
Creates realistic data for testing the complete system.
"""

import os
import sys
import django
from pathlib import Path
from datetime import datetime, date, timedelta
import random
from uuid import uuid4

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
from apps.academics.models import Class, Section
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

# Find tenant
print("[1/3] Finding tenant...")
tenant = School.objects.get(subdomain="vedatest")
print(f"   ✅ {tenant.name} ({tenant.schema_name})")

# Switch schema
print("\n[2/3] Switching to tenant schema...")
with connection.cursor() as cursor:
    cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')
print(f"   ✅ Schema: {tenant.schema_name}")

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

# Create Teachers
print("\n[3/3] Creating teachers...")
try:
    from apps.staff.models import Staff

    # Clear existing
    Staff.objects.all().delete()
    User.objects.filter(user_type='TEACHER').delete()

    print("   → Creating teacher accounts...")

    # Teacher subjects mapping
    teacher_data = [
        {"name": "Rajesh Kumar", "subject": "Mathematics", "qualification": "M.Sc Mathematics", "experience": 10},
        {"name": "Priya Sharma", "subject": "English", "qualification": "M.A English", "experience": 8},
        {"name": "Amit Verma", "subject": "Science", "qualification": "M.Sc Physics", "experience": 12},
        {"name": "Sunita Patel", "subject": "Hindi", "qualification": "M.A Hindi", "experience": 7},
        {"name": "Vikram Singh", "subject": "Social Science", "qualification": "M.A History", "experience": 9},
        {"name": "Meena Gupta", "subject": "Computer Science", "qualification": "MCA", "experience": 5},
        {"name": "Ravi Reddy", "subject": "Physical Education", "qualification": "B.P.Ed", "experience": 6},
        {"name": "Anjali Nair", "subject": "Art & Craft", "qualification": "BFA", "experience": 4},
        {"name": "Suresh Iyer", "subject": "Music", "qualification": "B.Mus", "experience": 8},
        {"name": "Kavita Mehta", "subject": "Mathematics", "qualification": "M.Sc Mathematics", "experience": 6},
    ]

    for idx, t_data in enumerate(teacher_data):
        # Create User account in public schema (switch back temporarily)
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        email = f"teacher{idx+1}@veda.com"
        user = User.objects.create_user(
            email=email,
            password='teacher123',
            first_name=t_data["name"].split()[0],
            last_name=t_data["name"].split()[-1],
            phone=f"98765{43210 + idx}",
            user_type='TEACHER',
            is_staff=False,
            is_active=True,
            email_verified=True,
            phone_verified=True
        )

        # Switch back to tenant schema
        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')

        # Create Staff profile in tenant schema
        staff = Staff.objects.create(
            user=user,
            employee_id=f"VV-TCHR-{1001 + idx}",
            designation='TEACHER',
            department='ACADEMICS',
            qualification=t_data["qualification"],
            experience_years=t_data["experience"],
            joining_date=date.today() - timedelta(days=365 * t_data["experience"]),
            salary=45000 + (t_data["experience"] * 2000),
            is_active=True
        )

        stats['teachers'] += 1
        print(f"      ✅ Created teacher: {t_data['name']} ({email})")

    print(f"   ✅ Created {stats['teachers']} teachers")

except Exception as e:
    print(f"   ⚠️  Teacher creation error: {e}")
    import traceback
    traceback.print_exc()

# Create Students
print("\n[4/3] Creating students...")
try:
    from apps.students.models import Student, StudentEnrollment

    # Clear existing
    StudentEnrollment.objects.all().delete()
    Student.objects.all().delete()
    User.objects.filter(user_type='STUDENT').delete()

    print("   → Creating student accounts...")

    # Get classes and sections
    classes = list(Class.objects.all().order_by('class_order')[:10])  # First 10 classes
    sections = list(Section.objects.all())

    if not classes or not sections:
        print("   ⚠️  No classes/sections found. Cannot create students.")
    else:
        # Create 30 students distributed across classes
        students_to_create = 30

        for idx in range(students_to_create):
            # Alternate between male and female
            is_male = idx % 2 == 0
            first_name = random.choice(INDIAN_FIRST_NAMES_MALE if is_male else INDIAN_FIRST_NAMES_FEMALE)
            last_name = random.choice(INDIAN_LAST_NAMES)

            # Assign to a class and section
            class_obj = classes[idx % len(classes)]
            class_sections = [s for s in sections if s.class_assigned_id == class_obj.id]
            section_obj = random.choice(class_sections) if class_sections else sections[0]

            # Generate admission number
            admission_number = f"VV-2024-{1001 + idx}"

            # Calculate age based on class (LKG=3 years, UKG=4, Class 1=6, etc.)
            class_order = class_obj.class_order
            if class_order == 1:  # LKG
                age = 3
            elif class_order == 2:  # UKG
                age = 4
            else:  # Class 1 onwards
                age = 5 + class_order

            dob = date.today() - timedelta(days=365 * age)

            # Create User account in public schema
            with connection.cursor() as cursor:
                cursor.execute('SET search_path TO "public"')

            email = f"student{idx+1}@veda.com"
            user = User.objects.create_user(
                email=email,
                password='student123',
                first_name=first_name,
                last_name=last_name,
                phone=f"91234{56789 + idx}",
                user_type='STUDENT',
                is_staff=False,
                is_active=True,
                email_verified=True,
                phone_verified=True
            )

            # Switch back to tenant schema
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')

            # Create Student profile
            student = Student.objects.create(
                user=user,
                admission_number=admission_number,
                first_name=first_name,
                last_name=last_name,
                date_of_birth=dob,
                gender='MALE' if is_male else 'FEMALE',
                blood_group=random.choice(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
                current_class=class_obj,
                current_section=section_obj,
                admission_date=date(2024, 4, 1),
                roll_number=idx + 1,

                # Contact info
                phone=f"91234{56789 + idx}",
                email=email,

                # Address
                address_line1=f"House No. {idx + 1}, Street {idx % 10 + 1}",
                city="Bhopal",
                state="Madhya Pradesh",
                pincode="462001",
                country="India",

                # Parent info
                father_name=f"{random.choice(INDIAN_FIRST_NAMES_MALE)} {last_name}",
                father_phone=f"98765{10000 + idx}",
                father_email=f"father{idx+1}@veda.com",
                father_occupation=random.choice(['Engineer', 'Doctor', 'Teacher', 'Business', 'Government']),

                mother_name=f"{random.choice(INDIAN_FIRST_NAMES_FEMALE)} {last_name}",
                mother_phone=f"98765{20000 + idx}",
                mother_email=f"mother{idx+1}@veda.com",
                mother_occupation=random.choice(['Homemaker', 'Teacher', 'Doctor', 'Engineer', 'Business']),

                is_active=True
            )

            # Create enrollment
            from apps.academics.models import AcademicYear
            current_ay = AcademicYear.objects.filter(is_current=True).first()

            StudentEnrollment.objects.create(
                student=student,
                academic_year=current_ay,
                class_enrolled=class_obj,
                section=section_obj,
                enrollment_date=date(2024, 4, 1),
                status='ACTIVE'
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
print(f"\n📊 New Records Created: {total:,}")
print()

for key, value in stats.items():
    if value > 0:
        print(f"   {key.replace('_', ' ').title()}: {value:,}")

print("\n" + "="*80)
print("UPDATED TOTALS")
print("="*80)
print()
print("✅ Previous Data: 119 records")
print("   - Academic Structure: 79")
print("   - Transport: 17")
print("   - Library: 23")
print()
print(f"✅ New Data: {total} records")
print(f"   - Teachers: {stats['teachers']}")
print(f"   - Students: {stats['students']}")
print(f"   - Enrollments: {stats['enrollments']}")
print()
print(f"🎉 GRAND TOTAL: {119 + total} records")
print()
print("="*80)
print("LOGIN CREDENTIALS")
print("="*80)
print()
print("Frontend: http://localhost:3000")
print()
print("Admin:")
print("  Email:    admin@veda.com")
print("  Password: admin123")
print()
print("Sample Teacher:")
print("  Email:    teacher1@veda.com")
print("  Password: teacher123")
print()
print("Sample Student:")
print("  Email:    student1@veda.com")
print("  Password: student123")
print()
print("="*80)
print("TESTING SCENARIOS")
print("="*80)
print()
print("1. Teacher Login Test:")
print("   - Login with teacher1@veda.com / teacher123")
print("   - View assigned classes")
print("   - Mark attendance for students")
print()
print("2. Student Login Test:")
print("   - Login with student1@veda.com / student123")
print("   - View class schedule")
print("   - Check academic progress")
print()
print("3. Admin Management Test:")
print("   - View all 30 students")
print("   - View all 10 teachers")
print("   - Assign teachers to classes")
print("   - Generate reports")
print()
print("="*80)
