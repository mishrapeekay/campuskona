from django_tenants.middleware.main import TenantMainMiddleware
from django.db import connection
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from apps.tenants.models import School, Domain

# URL paths that bypass tenant resolution (public endpoints)
TENANT_EXEMPT_PATHS = [
    '/api/v1/tenants/public/',
]

# Hostnames that use public schema (local development)
LOCAL_HOSTNAMES = [
    'localhost',
    '127.0.0.1',
    '10.0.2.2',       # Android emulator
    '0.0.0.0',
    'testserver',    # Django test client
]


class TenantHeaderMiddleware(TenantMainMiddleware):
    """
    Custom middleware that checks for 'X-Tenant-Subdomain' header.
    If present, it resolves the tenant using the School.subdomain field.
    If not, it falls back to the standard domain-based resolution.

    Public endpoints listed in TENANT_EXEMPT_PATHS bypass tenant resolution
    and use the public schema instead.

    Local development hostnames (localhost, 127.0.0.1, etc.) use public schema
    by default and rely on the X-Tenant-Subdomain header for tenant context.
    """
    def get_public_tenant(self):
        """Get or create the public tenant object."""
        try:
            # Try to get the public tenant by schema_name
            from django.conf import settings
            public_schema_name = getattr(settings, 'PUBLIC_SCHEMA_NAME', 'public')
            return School.objects.get(schema_name=public_schema_name)
        except School.DoesNotExist:
            # If public tenant doesn't exist, create a minimal one
            # This should only happen during initial setup
            from apps.tenants.models import Subscription
            from django.utils import timezone
            
            # Get or create a default subscription for the public tenant
            subscription, _ = Subscription.objects.get_or_create(
                name='Public',
                defaults={
                    'description': 'Public schema subscription',
                    'max_students': 0,
                    'max_teachers': 0,
                    'max_staff': 0,
                    'price_monthly': 0,
                    'price_yearly': 0,
                    'tier': 'BASIC',
                    'is_active': True,
                }
            )
            
            public_tenant = School(
                schema_name='public',
                name='Public',
                code='PUBLIC',
                subdomain='public',
                email='admin@schoolmgmt.com',
                phone='0000000000',
                address='N/A',
                city='N/A',
                state='N/A',
                pincode='000000',
                subscription=subscription,
                subscription_start_date=timezone.now().date(),
                subscription_end_date=timezone.now().date() + timezone.timedelta(days=36500),  # 100 years
            )
            public_tenant.save(verbosity=0)
            return public_tenant

    def process_request(self, request):
        # Allow OPTIONS requests (CORS preflight) to pass through without tenant resolution
        if request.method == 'OPTIONS':
            return None

        # Allow public endpoints to bypass tenant resolution
        if any(request.path.startswith(path) for path in TENANT_EXEMPT_PATHS):
            # Set to public tenant object instead of None
            request.tenant = self.get_public_tenant()
            connection.set_schema_to_public()
            return None

        # 1. Check for the custom header
        # Frontend sends 'X-Tenant-Subdomain', Django converts to 'HTTP_X_TENANT_SUBDOMAIN'
        # But request.headers provides a nicer interface.
        subdomain = request.headers.get('X-Tenant-Subdomain')

        if subdomain:
            try:
                # Find the tenant (School) directly by subdomain
                tenant = School.objects.get(subdomain__iexact=subdomain)

                request.tenant = tenant

                # Set the schema in the database connection
                connection.set_tenant(request.tenant)

                # Setup URL routing (important if you have per-tenant URL_CONFS)
                self.setup_url_routing(request)

                return None  # Success

            except School.DoesNotExist:
                pass

        # 2. For local development hosts, use public schema when no header is provided
        hostname = request.get_host().split(':')[0]
        if hostname in LOCAL_HOSTNAMES:
            # Set to public tenant object instead of None
            request.tenant = self.get_public_tenant()
            connection.set_schema_to_public()
            return None

        # 3. Fallback to standard domain-based resolution (production)
        return super().process_request(request)


# Paths that bypass subscription enforcement (auth, health, public API)
SUBSCRIPTION_EXEMPT_PREFIXES = [
    '/admin/',
    '/health/',
    '/api/schema',
    '/api/docs',
    '/api/redoc',
    '/api/v1/auth/',
    '/api/v1/tenants/public/',
    '/metrics',
]


class SubscriptionEnforcementMiddleware:
    """
    Middleware that enforces subscription validity on all tenant API requests.

    Blocks requests (HTTP 402) when:
    - The tenant's subscription has expired (subscription_end_date < today)
    - The tenant's school is marked inactive (is_active=False)

    Grace period: Super admins (is_superuser) bypass enforcement for
    management/recovery operations. Auth endpoints are always exempt.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only enforce on API paths; skip exempt prefixes
        if not request.path.startswith('/api/'):
            return self.get_response(request)

        if any(request.path.startswith(p) for p in SUBSCRIPTION_EXEMPT_PREFIXES):
            return self.get_response(request)

        # Only enforce on tenant-scoped requests (not public schema)
        tenant = getattr(request, 'tenant', None)
        if tenant is None or getattr(tenant, 'schema_name', 'public') == 'public':
            return self.get_response(request)

        # Skip for super admins performing management actions
        user = getattr(request, 'user', None)
        if user and user.is_authenticated and user.is_superuser:
            return self.get_response(request)

        # 1. Hard block on inactive schools
        if not getattr(tenant, 'is_active', True):
            return JsonResponse(
                {
                    'error': 'school_inactive',
                    'detail': 'This school account has been deactivated. Please contact support.',
                },
                status=402,
            )

        # 2. Hard block on expired subscriptions
        end_date = getattr(tenant, 'subscription_end_date', None)
        if end_date and end_date < timezone.now().date():
            days_expired = (timezone.now().date() - end_date).days
            return JsonResponse(
                {
                    'error': 'subscription_expired',
                    'detail': 'Your subscription expired {} day{} ago. Please renew to continue.'.format(
                        days_expired, 's' if days_expired != 1 else ''
                    ),
                    'expired_on': end_date.isoformat(),
                    'renew_url': '/api/v1/tenants/renew/',
                },
                status=402,
            )

        return self.get_response(request)
