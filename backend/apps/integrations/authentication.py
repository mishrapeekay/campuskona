from rest_framework import authentication
from rest_framework import exceptions
from .models import IntegrationCredential
from django.conf import settings

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class IntegrationAuthentication(authentication.BaseAuthentication):
    """
    Authentication for 3rd party integrations using Client ID + API Key.
    """
    def authenticate(self, request):
        client_id = request.headers.get('X-Integration-Client-Id')
        api_key = request.headers.get('X-Integration-Api-Key')

        if not client_id or not api_key:
            return None

        try:
            # Assumes TenantManager forces correct schema context before this runs,
            # which might be tricky if using standard middleware.
            # But normally auth runs after TenantMiddleware.
            credential = IntegrationCredential.objects.get(
                client_id=client_id, 
                is_active=True
            )
        except IntegrationCredential.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid Client Credentials')

        # Verify API Key
        # EncryptedCharField returns string on access?
        if str(credential.api_key) != api_key:
            raise exceptions.AuthenticationFailed('Invalid API Key')

        # IP Whitelist Check
        if credential.allowed_ips:
            client_ip = get_client_ip(request)
            if client_ip not in credential.allowed_ips:
                raise exceptions.AuthenticationFailed(f'IP {client_ip} not authorized')

        # We return a dummy user or actual system user. 
        # For now return None user but with Auth object populated.
        # This requires custom permission classes to handle `request.auth` being the credential.
        return (None, credential)
