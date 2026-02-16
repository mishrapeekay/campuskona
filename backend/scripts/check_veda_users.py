#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.tenants.models import School
from django.db import connection
from apps.authentication.models import User
from apps.students.models import Student
from apps.staff.models import StaffMember

# Switch to Veda Vidyalaya tenant
school = School.objects.get(subdomain='veda')
connection.set_schema(school.schema_name)

print("=" * 70)
print(f"VEDA VIDYALAYA TENANT - Users & Profiles")
print("=" * 70)

# Check users
print("\n📧 USERS (First 10):")
print("-" * 70)
users = User.objects.all().order_by('user_type', 'email')[:10]
for u in users:
    print(f"  {u.email:30} | Type: {u.user_type:10} | Active: {u.is_active}")

print(f"\n  Total Users: {User.objects.count()}")

# Check students
print("\n🎓 STUDENTS (First 5):")
print("-" * 70)
students = Student.objects.all()[:5]
for s in students:
    print(f"  {s.admission_number:10} | {s.get_full_name():25} | Email: {s.user.email}")

print(f"\n  Total Students: {Student.objects.count()}")

# Check staff
print("\n👨‍🏫 STAFF (First 5):")
print("-" * 70)
staff = StaffMember.objects.all()[:5]
for st in staff:
    print(f"  {st.employee_id:10} | {st.get_full_name():25} | {st.designation:15} | Email: {st.user.email}")

print(f"\n  Total Staff: {StaffMember.objects.count()}")

# Find a sample student and teacher for testing
print("\n" + "=" * 70)
print("SUGGESTED TEST ACCOUNTS:")
print("=" * 70)

sample_student = Student.objects.first()
if sample_student:
    print(f"\n✅ Student Account:")
    print(f"   Email: {sample_student.user.email}")
    print(f"   Name: {sample_student.get_full_name()}")
    print(f"   Admission #: {sample_student.admission_number}")
    print(f"   Password: (needs to be reset to School@123)")

sample_teacher = StaffMember.objects.filter(designation__in=['TEACHER', 'PRIMARY_TEACHER', 'SENIOR_TEACHER']).first()
if sample_teacher:
    print(f"\n✅ Teacher Account:")
    print(f"   Email: {sample_teacher.user.email}")
    print(f"   Name: {sample_teacher.get_full_name()}")
    print(f"   Employee ID: {sample_teacher.employee_id}")
    print(f"   Designation: {sample_teacher.designation}")
    print(f"   Password: (needs to be reset to School@123)")

print("\n" + "=" * 70)
