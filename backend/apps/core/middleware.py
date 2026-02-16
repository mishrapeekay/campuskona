from django_prometheus.middleware import PrometheusAfterMiddleware, PrometheusBeforeMiddleware
import logging

class TenantPrometheusBeforeMiddleware(PrometheusBeforeMiddleware):
    """
    Standard Prometheus before-middleware.
    """
    pass

class TenantPrometheusAfterMiddleware(PrometheusAfterMiddleware):
    """
    Adds tenant-awareness to Prometheus metrics by adding a 'tenant' label.
    """
    def label_from_request(self, request):
        labels = super().label_from_request(request)
        
        # Determine tenant schema name
        tenant_name = "public"
        if hasattr(request, 'tenant') and request.tenant:
            tenant_name = request.tenant.schema_name
            
        # Add tenant to existing labels
        # labels is a list of [('method', 'GET'), ('view', '...'), ...]
        labels.append(('tenant', tenant_name))
        return labels
