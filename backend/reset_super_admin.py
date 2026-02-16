
import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.authentication.models import User
from django.db import connection

try:
    print("Attempting to get superuser...")
    user = User.objects.get(email='superadmin@schoolmgmt.com')
    print(f"Found user: {user.email}")
    user.set_password('SuperAdmin@123')
    user.is_superuser = True
    user.is_staff = True
    user.is_active = True
    user.save()
    print("SUCCESS: Password reset to 'SuperAdmin@123'")
except User.DoesNotExist:
    print("ERROR: User does not exist")
except Exception as e:
    print(f"ERROR: {e}")
