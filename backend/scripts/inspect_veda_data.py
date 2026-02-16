import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.staff.models import StaffMember
from apps.students.models import Student

User = get_user_model()

def inspect_user(email):
    print(f"\n--- Inspecting {email} ---")
    try:
        user = User.objects.get(email=email)
        print(f"User found: ID={user.id}, Type={user.user_type}")
        
        # Check reverse relationships
        try:
            print(f"Linked Staff Profile: {user.staff_profile}")
        except:
            print("Linked Staff Profile: None")
            
        try:
            print(f"Linked Student Profile: {user.student_profile}")
        except:
            print("Linked Student Profile: None")
            
    except User.DoesNotExist:
        print("User NOT found.")

def find_profiles(email):
    print(f"\n--- Searching Profiles for {email} ---")
    staff = StaffMember.objects.filter(email=email)
    print(f"Staff Members with email {email}: {staff.count()}")
    for s in staff:
        print(f" - Staff ID: {s.id}, User ID: {s.user_id}")

    students = Student.objects.filter(email=email)
    print(f"Students with email {email}: {students.count()}")
    for s in students:
        print(f" - Student ID: {s.id}, User ID: {s.user_id}")

print("INSPECTING VEDA DATA")
inspect_user('teacher@veda.com')
find_profiles('teacher@veda.com')

inspect_user('student@veda.com')
find_profiles('student@veda.com')
