import os, sys, django

def get_tenant_info():
    sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    django.setup()
    
    from apps.tenants.models import School, Domain
    
    for school in School.objects.all():
        domain = Domain.objects.filter(tenant=school).first()
        domain_name = domain.domain if domain else "NO_DOMAIN"
        # The frontend usually takes the part before the first dot as the subdomain, or the domain model has a subdomain field?
        print(f"School: {school.name}, Schema: {school.schema_name}, Domain: {domain_name}")
        
get_tenant_info()
