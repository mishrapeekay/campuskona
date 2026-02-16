#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from apps.tenants.models import School
from apps.authentication.models import User

# Get Veda Vidyalaya tenant
school = School.objects.get(subdomain='veda')

# Switch to tenant schema using raw SQL
schema = school.schema_name

print("=" * 70)
print("TESTING LOGIN CREDENTIALS")
print("=" * 70)

# Test credentials
test_email = 'vv-adm-2024-0490@vedavidyalaya.edu.in'
test_password = 'School@123'

with connection.cursor() as cursor:
    # Set search path to tenant schema
    cursor.execute(f"SET search_path TO {schema}, public")
    
    # Try to get the user
    try:
        user = User.objects.using('default').get(email=test_email)
        print(f"\n✓ User found: {user.email}")
        print(f"  User Type: {user.user_type}")
        print(f"  Is Active: {user.is_active}")
        
        # Test password
        if user.check_password(test_password):
            print(f"\n✅ PASSWORD IS CORRECT!")
            print(f"   Login should work with: {test_email} / {test_password}")
        else:
            print(f"\n✗ PASSWORD IS INCORRECT")
            print(f"   The password '{test_password}' does not match")
            
            # Try to reset it again
            print(f"\n🔄 Resetting password to '{test_password}'...")
            user.set_password(test_password)
            user.save()
            print(f"✓ Password reset complete. Please try logging in again.")
            
    except User.DoesNotExist:
        print(f"\n✗ User not found: {test_email}")
    except Exception as e:
        print(f"\n✗ Error: {e}")

print("\n" + "=" * 70)
