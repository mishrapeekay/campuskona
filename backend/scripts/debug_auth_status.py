
import os
import django
from django.db import connection
from django.conf import settings

def run():
    print("🔍 Checking User and Token status...")
    
    from apps.authentication.models import User
    from rest_framework.authtoken.models import Token
    from apps.tenants.models import School
    
    # Check Demo Admin
    email = 'admin@school.com'
    try:
        user = User.objects.get(email=email)
        print(f"✅ User found: {user.email}")
        print(f"   - Active: {user.is_active}")
        print(f"   - Staff: {user.is_staff}")
        print(f"   - Superuser: {user.is_superuser}")
        print(f"   - ID: {user.id}")
        
        token = Token.objects.filter(user=user).first()
        if token:
            print(f"✅ Token exists: {token.key[:10]}...")
        else:
            print(f"❌ NO TOKEN for {email}")
            
    except User.DoesNotExist:
        print(f"❌ User NOT FOUND: {email}")

    print("-" * 50)

    # Check Veda Admin
    email = 'admin@vedavidyalaya.edu.in'
    try:
        user = User.objects.get(email=email)
        print(f"✅ User found: {user.email}")
        print(f"   - Active: {user.is_active}")
        print(f"   - Staff: {user.is_staff}")
        print(f"   - Superuser: {user.is_superuser}")
        print(f"   - ID: {user.id}")
        
        token = Token.objects.filter(user=user).first()
        if token:
            print(f"✅ Token exists: {token.key[:10]}...")
        else:
            print(f"❌ NO TOKEN for {email}")
            
    except User.DoesNotExist:
        print(f"❌ User NOT FOUND: {email}")

    print("-" * 50)
    
    # Check if we can switch schema and find students
    try:
        tenant = School.objects.get(subdomain='demo')
        print(f"Found tenant: {tenant.name}")
        
        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{tenant.schema_name}"')
            print(f"Switched to {tenant.schema_name}")
            
            # Count students
            # Note: We must use raw SQL or carefully use model to avoid double-switching if model also switches
            cursor.execute('SELECT count(*) FROM students')
            count = cursor.fetchone()[0]
            print(f"✅ Student count in {tenant.schema_name}: {count}")
            
            # Switch back
            cursor.execute('SET search_path TO "public"')
            
    except Exception as e:
        print(f"❌ Schema check failed: {e}")

if __name__ == '__main__':
    run()
