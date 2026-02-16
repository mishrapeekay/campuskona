#!/usr/bin/env python
import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.tenants.models import School
from django.db import connection
from apps.authentication.models import User
from apps.students.models import Student
from apps.academics.models import AcademicYear, Class, Section, StudentEnrollment

# Set tenant
school = School.objects.get(subdomain='demo')
connection.set_tenant(school)

# Create user
user, user_created = User.objects.get_or_create(
    email='student@demo.com',
    defaults={
        'first_name': 'Student',
        'last_name': 'Demo',
        'user_type': 'STUDENT',
        'is_active': True
    }
)
user.set_password('School@123')
user.save()
print(f"✓ User: {user.email} (Created: {user_created})")

# Create student profile
student, st_created = Student.objects.get_or_create(
    user=user,
    defaults={
        'admission_number': 'STU001',
        'admission_date': date(2024, 1, 1),
        'first_name': 'Student',
        'last_name': 'Demo',
        'date_of_birth': date(2010, 1, 1),
        'gender': 'M',
        'current_address_line1': '123 Main St',
        'current_city': 'Demo City',
        'current_state': 'Demo State',
        'current_pincode': '123456',
        'permanent_address_line1': '123 Main St',
        'permanent_city': 'Demo City',
        'permanent_state': 'Demo State',
        'permanent_pincode': '123456',
        'father_name': 'Father Name',
        'father_phone': '9999999999',
        'mother_name': 'Mother Name',
        'emergency_contact_number': '9999999999'
    }
)
print(f"✓ Student: {student.admission_number} (ID: {student.id}, Created: {st_created})")

# Get academic year and class
academic_year = AcademicYear.objects.filter(is_current=True).first()
class_obj = Class.objects.first()

if academic_year and class_obj:
    # Create section
    section, sec_created = Section.objects.get_or_create(
        name='A',
        class_instance=class_obj,
        academic_year=academic_year,
        defaults={'max_students': 40}
    )
    print(f"✓ Section: {section} (Created: {sec_created})")
    
    # Create enrollment
    enrollment, enr_created = StudentEnrollment.objects.get_or_create(
        student=student,
        section=section,
        academic_year=academic_year,
        defaults={
            'roll_number': '1',
            'enrollment_date': date(2024, 1, 1)
        }
    )
    print(f"✓ Enrollment: {enrollment.section} (Created: {enr_created})")
else:
    print("⚠ Warning: No academic year or class found")

print("\n✅ SUCCESS: Student account is ready!")
print(f"   Email: student@demo.com")
print(f"   Password: School@123")
print(f"   Student ID: {student.id}")
