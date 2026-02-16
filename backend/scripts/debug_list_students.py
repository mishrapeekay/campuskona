
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import django
from django.db import connection

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.authentication.models import User
from apps.students.models import Student
from apps.tenants.models import Tenant, Domain

def list_students():
    print("--- Listing Tenants ---")
    tenants = Tenant.objects.all()
    for t in tenants:
        print(f"Tenant: {t.name} ({t.schema_name})")
        
        # Switch to tenant schema
        connection.set_tenant(t)
        
        print(f"  Students in {t.name}:")
        students = Student.objects.all()
        if not students.exists():
            print("    No students found.")
        
        for s in students:
            print(f"    - Name: {s.first_name} {s.last_name}")
            print(f"      User Email: {s.user.email}")
            print(f"      Student ID: {s.id}")
            print(f"      Admission No: {s.admission_number}")
            print(f"      User ID: {s.user.id}")
            print("")

if __name__ == "__main__":
    try:
        from django_tenants.utils import schema_context
        # We need to iterate over tenants
        tenants = Tenant.objects.exclude(schema_name='public')
        for tenant in tenants:
             with schema_context(tenant.schema_name):
                 print(f"--- Tenant: {tenant.name} ({tenant.schema_name}) ---")
                 students = Student.objects.all()
                 for s in students:
                     print(f"User: {s.user.email}, StudentID: {s.id}")
    except Exception as e:
        print(f"Error: {e}")
        # Fallback for non-django-tenants setup (if any)
