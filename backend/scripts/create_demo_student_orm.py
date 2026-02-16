#!/usr/bin/env python
"""
Create a student account in the Demo tenant using Django ORM.
This is the safest method as it respects all model defaults and validations.
"""
import os
import sys
import django
from datetime import date

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from apps.tenants.models import School
from apps.authentication.models import User
from apps.students.models import Student
from apps.academics.models import AcademicYear, Class, Section, StudentEnrollment

print("=" * 70)
print("CREATING STUDENT ACCOUNT IN DEMO TENANT")
print("=" * 70)

# Get demo school
demo_school = School.objects.get(subdomain='demo')
print(f"\n✓ Found school: {demo_school.name}")
print(f"  Schema: {demo_school.schema_name}")

# Switch to demo schema
connection.set_schema(demo_school.schema_name)

# Create or get user
user, user_created = User.objects.get_or_create(
    email='student@demo.com',
    defaults={
        'first_name': 'Demo',
        'last_name': 'Student',
        'user_type': 'STUDENT',
        'is_active': True,
        'phone': '9999999999',
        'alternate_phone': '',
    }
)

# Set password
user.set_password('School@123')
user.save()

print(f"\n✓ User {'created' if user_created else 'updated'}: {user.email}")
print(f"  User ID: {user.id}")
print(f"  Password: School@123")

# Create or get student profile
student, student_created = Student.objects.get_or_create(
    user=user,
    defaults={
        'admission_number': 'DEMO-STU-001',
        'admission_date': date.today(),
        'admission_status': 'ACTIVE',
        'first_name': 'Demo',
        'last_name': 'Student',
        'date_of_birth': date(2010, 1, 1),
        'gender': 'M',
        'current_address_line1': '123 Demo Street',
        'current_city': 'Demo City',
        'current_state': 'Demo State',
        'current_pincode': '123456',
        'permanent_address_line1': '123 Demo Street',
        'permanent_city': 'Demo City',
        'permanent_state': 'Demo State',
        'permanent_pincode': '123456',
        'father_name': 'Demo Father',
        'father_phone': '9999999999',
        'mother_name': 'Demo Mother',
        'emergency_contact_number': '9999999999',
    }
)

print(f"\n✓ Student {'created' if student_created else 'found'}: {student.admission_number}")
print(f"  Student ID: {student.id}")

# Try to enroll in a class
try:
    academic_year = AcademicYear.objects.filter(is_current=True).first()
    if academic_year:
        section = Section.objects.filter(academic_year=academic_year).first()
        if section:
            enrollment, enr_created = StudentEnrollment.objects.get_or_create(
                student=student,
                academic_year=academic_year,
                defaults={
                    'section': section,
                    'enrollment_date': date.today(),
                    'roll_number': '1',
                    'enrollment_status': 'ENROLLED',
                    'is_active': True,
                }
            )
            print(f"\n✓ Enrollment {'created' if enr_created else 'found'}: {section.class_instance.display_name} - {section.name}")
        else:
            print(f"\n⚠️  No sections found for current academic year")
    else:
        print(f"\n⚠️  No current academic year found")
except Exception as e:
    print(f"\n⚠️  Could not create enrollment: {e}")

print("\n" + "=" * 70)
print("✅ STUDENT ACCOUNT READY!")
print("=" * 70)
print("\nLogin credentials:")
print("  School: Demo High School (subdomain: demo)")
print("  Email: student@demo.com")
print("  Password: School@123")
print("\nNext steps:")
print("  1. In the mobile app, select 'Demo High School'")
print("  2. Login with the credentials above")
print("  3. Test the Student Dashboard")
print("\n" + "=" * 70)
