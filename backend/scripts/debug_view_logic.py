import os
import django
from django.db import connection
from django.test import RequestFactory
from unittest.mock import Mock

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.students.models import Student
from django.contrib.auth import get_user_model
from rest_framework.request import Request # Wrapper

User = get_user_model()

def test_view_logic(tenant, email, role):
    print(f"\n--- Testing {role} View Logic for {tenant} ({email}) ---")
    
    with connection.cursor() as cursor:
        cursor.execute(f"SET search_path to {tenant}, public")
    connection.schema_name = tenant
    
    try:
        user = User.objects.get(email=email)
        print(f"User ID: {user.id}")
        
        # Prepare Request
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        request.query_params = {}
        
        # Mock ViewSet instance
        viewset = Mock()
        viewset.request = request
        viewset.request.user = user
        viewset.request.query_params = {}
        
        # LOGIC REPLICATION FROM VIEW
        queryset = Student.objects.filter(is_deleted=False)
        
        if role == 'STUDENT':
             print("Applying STUDENT logic...")
             student_id = None
             try:
                 print(" - Trying user.student_profile...")
                 # Note: This might fail if user object cached from different schema context?
                 # But here we are in 'veda' context.
                 if hasattr(user, 'student_profile'):
                     student_id = user.student_profile.id
                     print(f"   > Found via attribute: {student_id}")
                 else:
                     print(f"   > Attribute not found.")
             except Exception as e:
                 print(f"   > Attribute access error: {e}")
                 
             if not student_id:
                 print(" - Trying manual lookup...")
                 try:
                     s = Student.objects.get(user_id=user.id)
                     student_id = s.id
                     print(f"   > Found via query: {student_id}")
                 except Exception as e:
                     print(f"   > Query error: {e}")
            
             if student_id:
                 queryset = queryset.filter(id=student_id)
                 print(f" - Filtered by ID: {queryset.count()} results")
             else:
                 queryset = queryset.none()
                 print(" - No student ID found, returning none.")
                 
        elif role == 'PARENT':
             print("Applying PARENT logic...")
             # ORIGINAL (BROKEN)
             # qs_orig = queryset.filter(student_parents__parent=user)
             # print(f" - Original Logic Count: {qs_orig.count()}") 
             
             # NEW (PROPOSED)
             try:
                qs_new = queryset.filter(parent_links__parent=user)
                print(f" - New Logic (parent_links) Count: {qs_new.count()}")
                for s in qs_new:
                    print(f"   > Found Child: {s.first_name}")
             except Exception as e:
                print(f"   > New Logic Error: {e}")

    except Exception as e:
        print(f"CRITICAL: {e}")

if __name__ == "__main__":
    test_view_logic('veda', 'student@veda.com', 'STUDENT')
    test_view_logic('veda', 'parent@veda.com', 'PARENT')
