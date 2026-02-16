"""
Fix admin@veda.com by creating a StaffMember profile in the Veda Test schema.

The admin user exists in public.users but has no tenant-specific profile,
which causes "No School assigned" message in frontend.
"""

import os
import django
from datetime import date

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from apps.authentication.models import User
from apps.tenants.models import School
from apps.staff.models import StaffMember

def fix_admin_profile():
    """Create StaffMember profile for admin user."""

    # Get admin user from public schema
    admin_user = User.objects.get(email='admin@veda.com')
    print(f'Found admin user: {admin_user.email} ({admin_user.id})')

    # Get Veda Test tenant
    tenant = School.objects.get(subdomain='vedatest')
    print(f'Found tenant: {tenant.name} ({tenant.schema_name})')

    # Switch to tenant schema
    with connection.cursor() as cursor:
        cursor.execute(f'SET search_path TO "{tenant.schema_name}", "public"')

    # Check if admin already has a staff profile
    existing_staff = StaffMember.objects.filter(user_id=admin_user.id).first()
    if existing_staff:
        print(f'Admin already has staff profile: {existing_staff.employee_id}')
        return existing_staff

    # Create StaffMember profile for admin
    print('\nCreating StaffMember profile for admin...')

    staff = StaffMember.objects.create(
        user=admin_user,
        employee_id='VV-ADMIN-0001',
        designation='ADMINISTRATOR',
        department='ADMINISTRATION',
        employment_type='PERMANENT',
        employment_status='ACTIVE',
        joining_date=date(2024, 1, 1),
        first_name='Admin',
        last_name='User',
        date_of_birth=date(1980, 1, 1),
        gender='M',
        blood_group='O+',
        phone_number=admin_user.phone,
        email=admin_user.email,
        current_address_line1='School Campus',
        current_city='Bhopal',
        current_state='Madhya Pradesh',
        current_pincode='462001'
    )

    print(f'\n✅ Created StaffMember profile:')
    print(f'   Employee ID: {staff.employee_id}')
    print(f'   Name: {staff.first_name} {staff.last_name}')
    print(f'   Designation: {staff.designation}')
    print(f'   Email: {staff.email}')

    return staff


if __name__ == '__main__':
    print('='*80)
    print('FIX ADMIN PROFILE - Create StaffMember for admin@veda.com')
    print('='*80)

    try:
        staff = fix_admin_profile()

        print('\n' + '='*80)
        print('✅ SUCCESS!')
        print('='*80)
        print('\nAdmin user now has a StaffMember profile in Veda Test schema.')
        print('The "No School assigned" message should be resolved.')
        print('\nTest by logging in as:')
        print('  Email: admin@veda.com')
        print('  Password: admin123')

    except Exception as e:
        print(f'\n❌ ERROR: {e}')
        import traceback
        traceback.print_exc()
