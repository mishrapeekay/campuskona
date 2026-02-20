import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.tenants.models import School
from django.contrib.auth import get_user_model
from django_tenants.utils import schema_context

User = get_user_model()

def find_veda_accounts():
    # Try all schemas
    schools = School.objects.all()
    for school in schools:
        with schema_context(school.schema_name):
            try:
                # Check for the admin user
                admin = User.objects.filter(email='admin@veda.com').first()
                if admin:
                    print(f"Found admin in schema: {school.schema_name}")
                    
                    print("\n--- STAFF ---")
                    staff = User.objects.filter(user_type__in=['TEACHER', 'STAFF'])[:5]
                    for s in staff:
                        print(f"{s.user_type}: {s.email}")
                        
                    print("\n--- STUDENTS ---")
                    students = User.objects.filter(user_type='STUDENT')[:5]
                    for s in students:
                        print(f"STUDENT: {s.email}")
                        
                    print("\n--- PARENTS ---")
                    parents = User.objects.filter(user_type='PARENT')[:5]
                    for p in parents:
                        print(f"PARENT: {p.email}")
                        
                    print("\n--- ALL USERS ---")
                    for u in User.objects.all()[:15]:
                        print(f"{u.user_type}: {u.email}")
            except Exception as e:
                pass

find_veda_accounts()
