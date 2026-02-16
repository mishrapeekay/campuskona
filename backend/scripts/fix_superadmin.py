"""
Script to fix Super Admin user type.
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from apps.authentication.models import User

email = 'superadmin@schoolms.com'
try:
    user = User.objects.get(email=email)
    user.user_type = 'SUPER_ADMIN'
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print(f"✓ Updated {user.email} to {user.user_type}")
except User.DoesNotExist:
    print(f"✗ User {email} not found")
