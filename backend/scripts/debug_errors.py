import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.transport.models import Vehicle, Route, TransportAllocation
from apps.students.models import Student
from django.contrib.auth import get_user_model

User = get_user_model()

def debug_transport(tenant):
    print(f"\n[{tenant.upper()}] Debugging Transport Stats...")
    
    # 1. Switch Schema
    with connection.cursor() as cursor:
        cursor.execute(f"SET search_path to {tenant}, public")
    connection.schema_name = tenant
    
    try:
        print(" - Counting Vehicles...")
        v_count = Vehicle.objects.count()
        print(f"   Vehicles: {v_count}")
        
        print(" - Counting Active Routes...")
        r_count = Route.objects.filter(is_active=True).count()
        print(f"   Routes: {r_count}")
        
        print(" - Counting Allocations...")
        a_count = TransportAllocation.objects.filter(is_active=True).count()
        print(f"   Allocations: {a_count}")
        
    except Exception as e:
        print(f"❌ TRANSPORT ERROR: {e}")

def debug_student(tenant, email):
    print(f"\n[{tenant.upper()}] Debugging Student {email}...")
    
    # Switch schema is redundant if done above but good for safety
    with connection.cursor() as cursor:
        cursor.execute(f"SET search_path to {tenant}, public")
        
    try:
        user = User.objects.get(email=email)
        print(f" - User ID: {user.id} | Type: {user.user_type}")
        
        student = Student.objects.get(user=user)
        print(f" - Student ID: {student.id}")
        print(f" - Is Deleted: {student.is_deleted}")
        
        # Simulate ViewSet Queryset Logic
        queryset = Student.objects.all()
        filtered = queryset.filter(id=student.id)
        if filtered.exists():
            print(" - Queryset can find student by ID.")
        else:
            print(" - Queryset CANNOT find student by ID (Empty).")
            
        filtered_del = Student.objects.filter(is_deleted=False).filter(id=student.id)
        if filtered_del.exists():
             print(" - Queryset + SoftDelete check passed.")
        else:
             print(" - Queryset + SoftDelete check FAILED.")
             
    except Exception as e:
         print(f"❌ STUDENT ERROR: {e}")

if __name__ == "__main__":
    debug_transport('veda')
    debug_student('veda', 'student@veda.com')
    
    debug_transport('demo')
    debug_student('demo', 'student@demo.com')
