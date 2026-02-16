from rest_framework.throttling import SimpleRateThrottle
import logging

logger = logging.getLogger(__name__)

class TenantRateThrottle(SimpleRateThrottle):
    """
    Limits the rate of API calls per tenant.
    This ensures that one tenant cannot overwhelm the system and affect others.
    """
    scope = 'tenant'

    def get_cache_key(self, request, view):
        if not hasattr(request, 'tenant') or not request.tenant:
            # Fallback to IP address if tenant is not identified
            return self.cache_format % {
                'scope': self.scope,
                'ident': self.get_ident(request)
            }
        
        # Identification is based on the tenant schema name
        ident = f"tenant_{request.tenant.schema_name}"
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }

class TenantUserRateThrottle(SimpleRateThrottle):
    """
    Limits the rate of API calls per user within a specific tenant.
    This provides a secondary layer of protection against a single user 
    consuming all resources allocated to a tenant.
    """
    scope = 'tenant_user'

    def get_cache_key(self, request, view):
        if not hasattr(request, 'tenant') or not request.tenant:
            return None # Fallback to standard UserRateThrottle
        
        tenant_ident = f"tenant_{request.tenant.schema_name}"
        
        if request.user.is_authenticated:
            user_ident = f"user_{request.user.pk}"
        else:
            user_ident = f"anon_{self.get_ident(request)}"
            
        ident = f"{tenant_ident}_{user_ident}"
        
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
