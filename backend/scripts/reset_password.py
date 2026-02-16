"""
Temporary script to reset user passwords.
Run with: python reset_password.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from apps.authentication.models import User

# Reset passwords for demo users
users_to_reset = [
    ('superadmin@schoolms.com', 'SuperAdmin@2024'),
    ('admin@vedavidyalaya.edu.in', 'VedaAdmin@2024'),
    ('admin@school.com', 'admin123'),
]

for email, password in users_to_reset:
    try:
        user = User.objects.get(email=email)
        user.set_password(password)
        user.is_active = True
        user.save()
        print(f"✓ Password reset for {email}")
    except User.DoesNotExist:
        print(f"✗ User not found: {email}")

print("\nDone! Try logging in again.")
