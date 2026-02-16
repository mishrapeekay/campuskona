
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.tenants.models import School
from apps.academics.models import Class
from apps.core.db_router import switch_to_tenant_schema

def inspect():
    try:
        school = School.objects.get(subdomain='veda')
        switch_to_tenant_schema(school)
        print(f"--- Classes in {school.schema_name} ---")
        for c in Class.objects.all():
            print(f"Order: {c.class_order}, Name: {c.name}, ID: {c.id}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect()
