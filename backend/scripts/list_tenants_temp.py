
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.tenants.models import School, Domain

print("--- Active Tenants ---")
schools = School.objects.all()
for school in schools:
    domains = Domain.objects.filter(school=school)
    domain_names = ", ".join([d.domain for d in domains])
    print(f"Name: {school.name}")
    print(f"Subdomain: {school.subdomain}")
    print(f"Domains: {domain_names}")
    print(f"Created: {school.created_at}")
    print("-------------------")
