import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.authentication.models import User
from apps.core.db_router import switch_to_public_schema

def create_admin_accounts():
    """Create admin accounts in PUBLIC schema for both tenants"""
    
    switch_to_public_schema()
    
    print("=" * 70)
    print("CREATING ADMIN ACCOUNTS IN PUBLIC SCHEMA")
    print("=" * 70)
    
    admins = [
        {
            "email": "admin@demohighschool.edu.in",
            "first_name": "Demo",
            "last_name": "Administrator",
            "user_type": "SCHOOL_ADMIN",
            "phone": "8888888881",
        },
        {
            "email": "admin@vedavidyalaya.edu.in",
            "first_name": "Veda",
            "last_name": "Administrator",
            "user_type": "SCHOOL_ADMIN",
            "phone": "8888888882",
        },
    ]
    
    for admin_data in admins:
        email = admin_data["email"]
        
        # Check if user already exists
        existing = User.objects.filter(email=email).first()
        
        if existing:
            print(f"\n✅ User already exists: {email}")
            print(f"   Name: {existing.get_full_name()}")
            print(f"   Type: {existing.user_type}")
            print(f"   Active: {existing.is_active}")
            
            # Update password to ensure it's correct
            existing.set_password("School@123")
            existing.save()
            print(f"   🔐 Password reset to: School@123")
        else:
            # Create new user
            user = User.objects.create_user(
                email=email,
                password="School@123",
                first_name=admin_data["first_name"],
                last_name=admin_data["last_name"],
                user_type=admin_data["user_type"],
                phone=admin_data["phone"],
                is_active=True,
            )
            print(f"\n✅ Created new user: {email}")
            print(f"   Name: {user.get_full_name()}")
            print(f"   Type: {user.user_type}")
            print(f"   Password: School@123")
    
    print("\n" + "=" * 70)
    print("VERIFICATION")
    print("=" * 70)
    
    for admin_data in admins:
        user = User.objects.get(email=admin_data["email"])
        # Test password
        if user.check_password("School@123"):
            print(f"✅ {admin_data['email']} - Password verified")
        else:
            print(f"❌ {admin_data['email']} - Password mismatch!")

if __name__ == "__main__":
    create_admin_accounts()
