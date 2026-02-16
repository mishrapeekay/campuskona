
import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.base")
django.setup()

import logging
logging.basicConfig(level=logging.DEBUG)
logging.getLogger('django').setLevel(logging.DEBUG)

from django.test import Client
from apps.tenants.models import School, Domain
from django.contrib.auth import get_user_model
from django_tenants.utils import schema_context

User = get_user_model()

def run():
    print("Running Repro...")
    c = Client()
    tenant_subdomain = "mobiletest"
    
    # Ensure tenant exists (it should from previous run if not deleted)
    # But clean up first to be sure
    try:
        School.objects.filter(subdomain=tenant_subdomain).delete()
        print("Cleaned up.")
    except Exception as e:
        print(e)
        
    try:
        # Create minimal tenant (no migrations needed if we just test Public schema logic? 
        # But auth logic checks tenant schema too.
        # We need migrations for tenant.
        # This basically duplicates verify but simplified.
        from django.core.management import call_command
        
        # We can't easily skip migrations if we need tenant context.
        # But maybe we can verify if Public User Login works?
        # If public login works, then issue is Tenant.
        pass
    except Exception:
        pass

    # Try to verify using EXISTING tenant from previous run?
    # Previous run deleted it at the end.
    
    # Let's just create a user in PUBLIC schema and LOGIN.
    # If the error is in the View/Serializer generally, it should fail even for public user?
    # Or is it specific to Tenant user?
    # The error was "duplicate key... mobile@user.com".
    # And 500 happened.
    
    import time
    ts = int(time.time())
    email = f"repro_{ts}@test.com"
    phone = f"9{str(ts)[1:]}"
    
    # Create Tenant if missing
    try:
        from apps.tenants.models import School, Domain, Subscription
        from django.utils import timezone
        
        # Create subscription if missing
        sub, _ = Subscription.objects.get_or_create(name="ReproPlan", defaults={"price_monthly":0, "price_yearly":0})
        
        # Create School (This triggers migrations!)
        # We suppressed stdout? No.
        # But we need it for the 500 error reproduction.
        
        # Check if exists
        if not School.objects.filter(subdomain=tenant_subdomain).exists():
            print("Creating tenant (this might take time)...")
            tenant = School.objects.create(
                schema_name=f"test_{tenant_subdomain}",
                subdomain=tenant_subdomain,
                name="Repro School",
                code=f"REPRO{ts}",
                email=f"admin@{tenant_subdomain}.com",
                subscription=sub,
                subscription_start_date=timezone.now().date(),
                subscription_end_date=timezone.now().date() + timezone.timedelta(days=365)
            )
            Domain.objects.get_or_create(domain=tenant_subdomain, tenant=tenant, is_primary=True)
            print("Tenant created.")
            
        # Create user in Tenant Schema
        with schema_context(f"test_{tenant_subdomain}"):
             User.objects.filter(email=email).delete() # Cleanup in schema
             User.objects.create_user(email=email, password="password", user_type="STUDENT", phone=phone)
             print("User created in tenant.")

    except Exception as e:
        print(f"Tenant setup failed: {e}")

    # Login with Header
    resp = c.post(
        '/api/v1/auth/login/', 
        data={'email': email, 'password': 'password'},
        **{'HTTP_X_TENANT_SUBDOMAIN': tenant_subdomain}
    )
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.content.decode()}")
    if resp.status_code != 200:
        pass # print(f"Response: {resp.content.decode()}")

if __name__ == "__main__":
    run()
