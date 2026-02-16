import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.authentication.models import User
from apps.core.db_router import switch_to_public_schema

def fix_admin_passwords():
    """Reset passwords for existing admin accounts"""
    
    switch_to_public_schema()
    
    print("=" * 70)
    print("FIXING ADMIN ACCOUNT PASSWORDS")
    print("=" * 70)
    
    # Find all admin users
    admin_users = User.objects.filter(
        user_type__in=['SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'],
        is_active=True
    )
    
    print(f"\nFound {admin_users.count()} admin users\n")
    
    for user in admin_users:
        # Reset password
        user.set_password("School@123")
        user.save()
        
        # Verify
        if user.check_password("School@123"):
            print(f"✅ {user.email:45} - Password: School@123")
        else:
            print(f"❌ {user.email:45} - Password reset failed!")
    
    print("\n" + "=" * 70)
    print("RECOMMENDED ADMIN ACCOUNTS FOR MOBILE APP")
    print("=" * 70)
    
    print("\n📱 Demo High School (subdomain: demo):")
    print("   Email: pooja.desai@schoolname.edu.in")
    print("   Password: School@123")
    
    print("\n📱 Veda Vidyalaya (subdomain: veda):")
    print("   Email: vv-emp-0001@vedavidyalaya.edu.in")
    print("   Password: School@123")
    
    print("\n📱 Super Admin (all tenants):")
    print("   Email: superadmin@schoolms.com")
    print("   Password: School@123")

if __name__ == "__main__":
    fix_admin_passwords()
