import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.authentication.models import User

# Reset superuser password
try:
    user = User.objects.get(email='superadmin@schoolmgmt.com')
    user.set_password('admin123')
    user.is_superuser = True
    user.is_staff = True
    user.is_active = True
    user.save()
    print(f"✅ Password reset for: {user.email}")
    print(f"   Is superuser: {user.is_superuser}")
    print(f"   Is staff: {user.is_staff}")
    print(f"   Is active: {user.is_active}")
except User.DoesNotExist:
    print("❌ Superuser not found")
