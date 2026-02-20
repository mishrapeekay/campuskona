import os
import sys
import django

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from django_tenants.utils import schema_context

User = get_user_model()

def print_users():
    with schema_context('tenant_veda_v9'):
        print("\n=== VEDA9 Live Tenant Users ===")
        
        teacher = User.objects.filter(user_type='TEACHER').first()
        if teacher:
            print(f"Teacher: {teacher.email} ({teacher.first_name} {teacher.last_name})")
            
        student = User.objects.filter(user_type='STUDENT').first()
        if student:
            print(f"Student: {student.email} ({student.first_name} {student.last_name})")
            
        parent = User.objects.filter(user_type='PARENT').first()
        if parent:
            print(f"Parent: {parent.email} ({parent.first_name} {parent.last_name})")
            
print_users()
