"""
Script to create test staff members for the School Management System
"""

import os
import django
import sys
from datetime import date, timedelta

# Setup Django environment
sys.path.append('G:/School Mgmt System/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.staff.models import StaffMember
from apps.authentication.models import User

def create_test_staff():
    """Create test staff members"""
    
    print("Creating test staff members...")
    
    # Test data
    staff_data = [
        {
            'employee_id': 'EMP001',
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john.smith@school.com',
            'phone_number': '+91-9876543210',
            'gender': 'MALE',
            'date_of_birth': date(1985, 5, 15),
            'designation': 'Principal',
            'department': 'Administration',
            'employment_type': 'PERMANENT',
            'employment_status': 'ACTIVE',
            'joining_date': date(2020, 1, 1),
            'qualification': 'M.Ed, Ph.D',
            'experience_years': 15,
            'address': '123 Main Street, City',
            'emergency_contact_name': 'Jane Smith',
            'emergency_contact_number': '+91-9876543211',
        },
        {
            'employee_id': 'EMP002',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'email': 'sarah.johnson@school.com',
            'phone_number': '+91-9876543212',
            'gender': 'FEMALE',
            'date_of_birth': date(1990, 8, 20),
            'designation': 'Mathematics Teacher',
            'department': 'Academic',
            'employment_type': 'PERMANENT',
            'employment_status': 'ACTIVE',
            'joining_date': date(2021, 6, 1),
            'qualification': 'M.Sc Mathematics, B.Ed',
            'experience_years': 8,
            'address': '456 Park Avenue, City',
            'emergency_contact_name': 'Mike Johnson',
            'emergency_contact_number': '+91-9876543213',
        },
        {
            'employee_id': 'EMP003',
            'first_name': 'Robert',
            'last_name': 'Williams',
            'email': 'robert.williams@school.com',
            'phone_number': '+91-9876543214',
            'gender': 'MALE',
            'date_of_birth': date(1988, 3, 10),
            'designation': 'Science Teacher',
            'department': 'Academic',
            'employment_type': 'PERMANENT',
            'employment_status': 'ACTIVE',
            'joining_date': date(2019, 8, 15),
            'qualification': 'M.Sc Physics, B.Ed',
            'experience_years': 10,
            'address': '789 Oak Street, City',
            'emergency_contact_name': 'Mary Williams',
            'emergency_contact_number': '+91-9876543215',
        },
        {
            'employee_id': 'EMP004',
            'first_name': 'Emily',
            'last_name': 'Davis',
            'email': 'emily.davis@school.com',
            'phone_number': '+91-9876543216',
            'gender': 'FEMALE',
            'date_of_birth': date(1992, 11, 25),
            'designation': 'English Teacher',
            'department': 'Academic',
            'employment_type': 'CONTRACT',
            'employment_status': 'ACTIVE',
            'joining_date': date(2022, 1, 10),
            'qualification': 'M.A English, B.Ed',
            'experience_years': 5,
            'address': '321 Elm Street, City',
            'emergency_contact_name': 'Tom Davis',
            'emergency_contact_number': '+91-9876543217',
        },
        {
            'employee_id': 'EMP005',
            'first_name': 'Michael',
            'last_name': 'Brown',
            'email': 'michael.brown@school.com',
            'phone_number': '+91-9876543218',
            'gender': 'MALE',
            'date_of_birth': date(1987, 7, 5),
            'designation': 'Sports Coach',
            'department': 'Sports',
            'employment_type': 'PERMANENT',
            'employment_status': 'ACTIVE',
            'joining_date': date(2020, 7, 1),
            'qualification': 'B.P.Ed, M.P.Ed',
            'experience_years': 12,
            'address': '654 Pine Street, City',
            'emergency_contact_name': 'Lisa Brown',
            'emergency_contact_number': '+91-9876543219',
        },
    ]
    
    created_count = 0
    for data in staff_data:
        # Check if staff already exists
        if not StaffMember.objects.filter(employee_id=data['employee_id']).exists():
            staff = StaffMember.objects.create(**data)
            print(f"✅ Created: {staff.get_full_name()} ({staff.employee_id})")
            created_count += 1
        else:
            print(f"⏭️  Skipped: {data['employee_id']} (already exists)")
    
    print(f"\n✅ Created {created_count} staff members")
    print(f"📊 Total staff in database: {StaffMember.objects.count()}")

if __name__ == '__main__':
    create_test_staff()
