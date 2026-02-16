import os
from django.db import connection
from django.conf import settings
from apps.tenants.models import School
from apps.students.models import Student
from apps.staff.models import StaffMember
from apps.transport.models import Vehicle, Route
from apps.library.models import Book

def verify():
    # Get the school
    try:
        school = School.objects.get(code='VV')
        print(f"School Found: {school.name} ({school.code})")
        print(f"Schema: {school.schema_name}")
    except School.DoesNotExist:
        print("Error: School 'Veda Vidyalaya' not found!")
        return

    # Switch to Tenant Schema
    print(f"Switching to schema: {school.schema_name}")
    with connection.cursor() as cursor:
        cursor.execute(f'SET search_path TO "{school.schema_name}"')
    
    # Count Records
    print(f"\n--- Data Verification for {school.name} ---")
    print(f"Students: {Student.objects.count()}")
    print(f"Staff: {StaffMember.objects.count()}")
    print(f"Transport Vehicles: {Vehicle.objects.count()}")
    print(f"Transport Routes: {Route.objects.count()}")
    print(f"Library Books: {Book.objects.count()}")
    
    # Check a specific sample
    principal = StaffMember.objects.filter(designation='PRINCIPAL').first()
    if principal:
        print(f"\nPrincipal: {principal.first_name} {principal.last_name} ({principal.email})")
    
    student = Student.objects.first()
    if student:
        print(f"Sample Student: {student.first_name} {student.last_name} ({student.admission_number})")

if __name__ == "__main__":
    verify()
