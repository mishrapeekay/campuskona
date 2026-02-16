import os
import sys
import django
from django.test import RequestFactory
from django.db import connection

# Setup Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.tenants.middleware import TenantHeaderMiddleware
from apps.tenants.models import School

def verify_header_middleware():
    print("Running Header Middleware Verification...")

    # 1. Create a dummy tenant if it doesn't exist
    tenant_name = "test_header_tenant"
    try:
        tenant = School.objects.get(schema_name=tenant_name)
        print(f"✅ Found existing tenant: {tenant.schema_name}")
    except School.DoesNotExist:
        print(f"DTO Creating new tenant: {tenant_name}")
        from django.utils import timezone
        
        # Ensure subscription exists
        from apps.tenants.models import Subscription
        sub, _ = Subscription.objects.get_or_create(
             name='Basic Verif Plan',
             defaults={
                'price_monthly': 0, 
                'price_yearly': 0,
                'tier': 'BASIC'
             }
        )

        tenant = School(
            schema_name=tenant_name,
            name="Test Header School",
            subdomain="testheader", # The value we will send in header
            email="test@header.com",
            subscription=sub,
            subscription_start_date=timezone.now().date(),
            subscription_end_date=timezone.now().date() + timezone.timedelta(days=365),
            auto_create_schema=False
        )
        tenant.save() # This triggers schema creation
        print(f"✅ Created tenant with subdomain: {tenant.subdomain}")

    # 2. Mock a request with the header
    factory = RequestFactory()
    request = factory.get('/api/v1/students/', HTTP_X_TENANT_SUBDOMAIN='testheader')
    
    # 3. Process with Middleware
    middleware = TenantHeaderMiddleware(get_response=lambda r: None)
    
    try:
        middleware.process_request(request)
        
        # 4. Check if tenant was set on request
        if hasattr(request, 'tenant') and request.tenant.subdomain == 'testheader':
            print(f"✅ Middleware successfully set request.tenant to: {request.tenant.subdomain}")
        else:
            print(f"❌ Middleware FAILED. request.tenant is: {getattr(request, 'tenant', 'None')}")

        # 5. Check database connection schema
        if connection.schema_name == tenant_name:
             print(f"✅ Database connection switched to schema: {connection.schema_name}")
        else:
             print(f"❌ Database connection schema mismatch: {connection.schema_name} (Expected: {tenant_name})")

    except Exception as e:
        print(f"❌ Middleware Error: {e}")
        import traceback
        traceback.print_exc()
        
    # Cleanup (Optional - strictly we should leave it for manual checking, but keeping it clean is nice)
    # tenant.delete(keep_parents=False) # Keep it for manual check if needed

if __name__ == "__main__":
    verify_header_middleware()
