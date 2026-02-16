"""
Create a super admin user who can access all tenants.
Run this script from the backend directory:
    python create_super_admin.py
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.authentication.models import User

def create_super_admin():
    """Create or update super admin user."""
    
    email = 'superadmin@schoolms.com'
    password = 'SuperAdmin@2024'
    
    # Check if user already exists
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'first_name': 'Super',
            'last_name': 'Admin',
            'user_type': 'SCHOOL_ADMIN',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
            'phone': '9999999999',
            'country': 'India'
        }
    )
    
    if created:
        user.set_password(password)
        user.save()
        print(f"✅ Super admin created successfully!")
    else:
        # Update existing user
        user.set_password(password)
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.save()
        print(f"✅ Super admin updated successfully!")
    
    print(f"\n📧 Email: {email}")
    print(f"🔑 Password: {password}")
    print(f"👤 User Type: {user.user_type}")
    print(f"🔐 Is Superuser: {user.is_superuser}")
    print(f"\n🎯 This user can access ALL tenants (Demo + Veda)")

if __name__ == '__main__':
    create_super_admin()
