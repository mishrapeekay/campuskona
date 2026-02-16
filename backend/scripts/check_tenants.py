#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.tenants.models import School

print("=" * 60)
print("AVAILABLE TENANTS")
print("=" * 60)

schools = School.objects.all()
for school in schools:
    print(f"\nSchool: {school.name}")
    print(f"  Subdomain: {school.subdomain}")
    print(f"  Schema: {school.schema_name}")
    print(f"  Active: {school.is_active}")
    
print("\n" + "=" * 60)
print(f"Total Tenants: {schools.count()}")
print("=" * 60)
