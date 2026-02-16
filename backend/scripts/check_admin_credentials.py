import os
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.authentication.models import User
from apps.tenants.models import School
from apps.core.db_router import switch_to_public_schema, switch_to_tenant_schema

def check_admin_credentials():
    print("=" * 80)
    print("ADMIN CREDENTIALS CHECK FOR ALL TENANTS")
    print("=" * 80)
    
    # Get all tenants
    switch_to_public_schema()
    tenants = School.objects.filter(is_active=True)
    
    print(f"\nFound {tenants.count()} active tenant(s)\n")
    
    for tenant in tenants:
        print("-" * 80)
        print(f"TENANT: {tenant.name} ({tenant.subdomain})")
        print("-" * 80)
        
        # Check public schema for admin users
        switch_to_public_schema()
        
        # Find all admin type users
        admin_users = User.objects.filter(
            user_type__in=['SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'],
            is_active=True
        ).order_by('user_type', 'email')
        
        if admin_users.exists():
            print(f"\nAdmin Users in PUBLIC schema:")
            for user in admin_users:
                print(f"\n  📧 Email: {user.email}")
                print(f"  👤 Name: {user.get_full_name()}")
                print(f"  🔑 User Type: {user.user_type}")
                print(f"  ✅ Active: {user.is_active}")
                print(f"  🔐 Password: School@123 (default)")
        else:
            print("\n  ⚠️  No admin users found in PUBLIC schema")
        
        # Check tenant schema
        try:
            switch_to_tenant_schema(tenant)
            print(f"\n  Checking tenant schema: {tenant.schema_name}")
            
            tenant_admins = User.objects.filter(
                user_type__in=['SCHOOL_ADMIN', 'PRINCIPAL'],
                is_active=True
            ).order_by('user_type', 'email')
            
            if tenant_admins.exists():
                print(f"\n  Admin Users in TENANT schema ({tenant.schema_name}):")
                for user in tenant_admins:
                    print(f"\n    📧 Email: {user.email}")
                    print(f"    👤 Name: {user.get_full_name()}")
                    print(f"    🔑 User Type: {user.user_type}")
                    print(f"    ✅ Active: {user.is_active}")
                    print(f"    🔐 Password: School@123 (default)")
            else:
                print(f"\n    ℹ️  No admin users in tenant schema")
                
        except Exception as e:
            print(f"\n  ❌ Error checking tenant schema: {e}")
        
        print()
    
    # Summary
    print("=" * 80)
    print("QUICK REFERENCE - ADMIN LOGIN CREDENTIALS")
    print("=" * 80)
    
    switch_to_public_schema()
    all_admins = User.objects.filter(
        user_type__in=['SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'],
        is_active=True
    ).order_by('email')
    
    if all_admins.exists():
        print("\nAll Admin Accounts:")
        for user in all_admins:
            print(f"\n  Tenant: (Check subdomain in login)")
            print(f"  Email: {user.email}")
            print(f"  Password: School@123")
            print(f"  Type: {user.user_type}")
    else:
        print("\n⚠️  WARNING: No admin users found!")
        print("\nYou may need to create admin users using:")
        print("  python manage.py createsuperuser")

if __name__ == '__main__':
    check_admin_credentials()
