from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def test_tenant(request):
    """Test endpoint to verify tenant resolution"""
    tenant_subdomain = request.META.get('HTTP_X_TENANT_SUBDOMAIN', 'NOT SET')
    tenant_obj = getattr(request, 'tenant', None)
    
    return Response({
        'header_subdomain': tenant_subdomain,
        'resolved_tenant': {
            'name': tenant_obj.name if tenant_obj else None,
            'subdomain': tenant_obj.subdomain if tenant_obj else None,
            'schema': tenant_obj.schema_name if tenant_obj else None,
        } if tenant_obj else None,
        'message': 'Tenant resolution test'
    })
