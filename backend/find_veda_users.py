
import os
import sys
import django

# Add the project root to sys.path so 'apps' and 'config' can be found
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

try:
    django.setup()
except Exception as e:
    print(f"Error setting up Django: {e}")
    sys.exit(1)

from django_tenants.utils import schema_context
from apps.tenants.models import Domain, School
from django.contrib.auth import get_user_model
from django.db import connection

def find_veda_users():
    print("Searching for Veda tenant...")
    
    # 1. Find the tenant
    veda_tenant = None
    try:
        # Search by name or schema_name
        tenants = School.objects.all()
        for t in tenants:
            if 'veda' in t.name.lower() or 'veda' in t.schema_name.lower() or 'vv' in t.name.lower():
                print(f"Found candidate tenant: Name='{t.name}', Schema='{t.schema_name}'")
                if 'v9' in t.name.lower() or 'vv9' in t.name.lower(): # prioritizing V9 if exists
                     veda_tenant = t
                     break
        
        if not veda_tenant:
             # Fallback to any veda tenant if specific v9 not found, or take the last one found
             if tenants:
                 for t in tenants:
                    if 'veda' in t.name.lower():
                        veda_tenant = t
                        break
    except Exception as e:
        print(f"Error finding tenant: {e}")
        return

    if not veda_tenant:
        print("❌ Veda tenant not found.")
        return

    print(f"✅ Selected Tenant: {veda_tenant.name} (Schema: {veda_tenant.schema_name})")
    
    # Get domain
    domain = Domain.objects.filter(tenant=veda_tenant).first()
    if domain:
        print(f"   Domain: {domain.domain}")

    # 2. List Users
    User = get_user_model()
    
    with schema_context(veda_tenant.schema_name):
        print(f"\n--- Users in {veda_tenant.schema_name} ---")
        
        # Students
        students = User.objects.filter(user_type='STUDENT').order_by('email')[:5]
        if students.exists():
            print("\n🎓 Students (First 5):")
            for s in students:
                # Reset password to ensure access
                s.set_password('School@123')
                s.save()
                print(f"   - Email: {s.email}, Password: School@123")
        else:
            print("\n🎓 No students found.")

        # Parents
        parents = User.objects.filter(user_type='PARENT').order_by('email')[:5]
        if parents.exists():
            print("\n👨‍👩‍👧‍👦 Parents (First 5):")
            for p in parents:
                # Reset password to ensure access
                p.set_password('School@123')
                p.save()
                print(f"   - Email: {p.email}, Password: School@123")
        else:
            print("\n👨‍👩‍👧‍👦 No parents found.")

if __name__ == '__main__':
    find_veda_users()
