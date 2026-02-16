import os
import django
import sys
import json

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
import django
from django.conf import settings

# Must configure settings BEFORE setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.base")

django.setup()

import logging
logging.basicConfig(level=logging.DEBUG)
logging.getLogger('django').setLevel(logging.DEBUG)

# We need to manually setup to override settings?
# Actually, calling django.setup() loads settings from env.
# To override, we must modify settings AFTER django.setup()? No, settings are immutable?
# No, we can modify them if we use configure() but that's for standalone.
# We are using base.py.

# Alternative: We can mock it or just remove it from base.py temporarily?
# Or rely on run_command to output traceback if we fix stdout?

# Let's try to capture stdout better first.
# Wait, I am running python mobile_verify.py.
# If I use `settings.configure(...)` instead of `os.environ...` I can control it.
# But base.py is complex.

# Let's try patching INSTALLED_APPS after setup?
# Django apps are loaded during setup. Post-setup modification is hard.

# I will modify config/settings/base.py temporarily to comment out drf_spectacular.



from django.test import Client
from django.contrib.auth import get_user_model
from apps.tenants.models import School, Domain, Subscription
from django.utils import timezone
from django.core.management import call_command

User = get_user_model()

def verify_mobile_flow():
    print("\nVerifying Mobile Login Flow Simulation...")
    
    # 1. Setup Tenant
    tenant_subdomain = "mobiletest"
    print(f"DTO: Checking/Creating tenant '{tenant_subdomain}'...")
    
    try:
        # Clean up previous run
        School.objects.filter(subdomain=tenant_subdomain).delete()
        print("   - Cleaned up old test tenant")
    except:
        pass

    try:
        # Cleanup user from previous runs (User is shared)
        User.objects.filter(email="mobile@user.com").delete()
        print("   - Cleaned up old test user")
    except:
        pass

    try:
        # Create Subscription dependency
        sub, _ = Subscription.objects.get_or_create(
            name="MobileTestPlan",
            defaults={
                "price_monthly": 0,
                "price_yearly": 0,
                "tier": "PREMIUM",
                "max_students": 10
            }
        )

        tenant = School.objects.create(
            schema_name=f"test_{tenant_subdomain}",
            subdomain=tenant_subdomain,
            name="Mobile Test School",
            code="MOBTEST001",
            email=f"admin@{tenant_subdomain}.com",
            subscription=sub,
            subscription_start_date=timezone.now().date(),
            subscription_end_date=timezone.now().date() + timezone.timedelta(days=365)
        )
        # Create user INSIDE the tenant schema
        # We need to switch schema context for user creation
        from django_tenants.utils import schema_context
        
        # Create unique user for this run
        import time
        timestamp = int(time.time())
        user_email = f"mobile_{timestamp}@user.com"
        user_phone = f"9{str(timestamp)[1:]}" # Ensure 10 digits
        
        with schema_context(tenant.schema_name):
            user = User.objects.create_user(
                email=user_email,
                password="password123",
                user_type="STUDENT", # Testing Student login
                first_name="Mobile",
                last_name="Student",
                phone=user_phone
            )
            print(f"   - User '{user_email}' created in tenant schema")

    except Exception as e:
        print(f"Setup Failed: {e}")
        return

    # 2. Simulate Mobile Request
    print("\nSimulating Login Request with Headers...")
    c = Client()
    
    # HEADER KEY: Django test client expects 'HTTP_ERROR_KEY' for custom headers to end up in request.META
    # But request.headers access handles the translation.
    # We pass HTTP_X_TENANT_SUBDOMAIN -> X-Tenant-Subdomain
    
    login_payload = {
        "email": user_email,
        "password": "password123"
    }

    try:
        response = c.post(
            '/api/v1/auth/login/', 
            data=login_payload, 
            content_type='application/json',
            HTTP_X_TENANT_SUBDOMAIN=tenant_subdomain,
            SERVER_NAME='localhost'  # Add proper SERVER_NAME
        )
        
        print(f"   - Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("Login Successful!")
            data = response.json()
            if 'access' in data and 'refresh' in data:
                print("Tokens received")
            else:
                print(f"Tokens missing in response: {data.keys()}")
                
            # verify user data
            if 'user' in data:
                print(f"User returned: {data['user']['email']}")
            
            # 3. Simulate Authenticated Request (e.g. Profile)
            print("\nSimulating Authenticated Request (Status Check)...")
            auth_headers = {
                'HTTP_X_TENANT_SUBDOMAIN': tenant_subdomain,
                'HTTP_AUTHORIZATION': f"Bearer {data['access']}"
            }
            # Assuming /auth/users/me/ or similar exists. Checking standard Djoser/SimpleJWT
            # Using a safe known endpoint from urls.py inspection needed.
            # We see 'api/v1/health/' in urls.py? No, 'api/v1/auth/' includes 'apps.authentication.urls'.
            # I'll try /api/v1/auth/users/me/ (common djoser) or just accept login as proof.
            # Let's inspect urls.py output first to be sure.
        else:
            print(f"Login Failed: {response.content.decode()}")

    except Exception as e:
        print(f"Request Error: {e}")

    # Cleanup
    print("\nCleaning up...")
    try:
        tenant.delete(force_drop=True)
        print("Tenant deleted")
    except Exception as e:
        print(f"⚠️ Cleanup warning: {e}")

if __name__ == "__main__":
    verify_mobile_flow()
