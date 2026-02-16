import os
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import transaction
from apps.authentication.models import User
from apps.students.models import Student, StudentParent
from datetime import date

def create_demo_users():
    try:
        with transaction.atomic():
            # 1. Create Student User
            print("Creating Student User...")
            student_email = "student@demo.com"
            student_user, created = User.objects.get_or_create(
                email=student_email,
                defaults={
                    'first_name': 'Rahul',
                    'last_name': 'Sharma',
                    'phone': '9876543210',
                    'user_type': 'STUDENT',
                    'is_active': True,
                    'date_of_birth': date(2010, 5, 15),
                    'gender': 'M'
                }
            )
            if created:
                student_user.set_password("student123")
                student_user.save()
                print(f"✅ Created student user: {student_email} / student123")
            else:
                print(f"ℹ️ Student user already exists: {student_email}")

            # 2. Create Student Profile (Required for portal access)
            if not hasattr(student_user, 'student_profile'):
                print("Creating Student Profile...")
                Student.objects.create(
                    user=student_user,
                    first_name=student_user.first_name,
                    last_name=student_user.last_name,
                    date_of_birth=student_user.date_of_birth,
                    gender=student_user.gender,
                    email=student_email,
                    phone_number=student_user.phone,
                    admission_date=date.today(),
                    current_address_line1="123 Student Lane",
                    current_city="Mumbai",
                    current_state="Maharashtra",
                    current_pincode="400001",
                    permanent_address_line1="123 Student Lane",
                    permanent_city="Mumbai",
                    permanent_state="Maharashtra",
                    permanent_pincode="400001",
                    father_name="Rajesh Sharma",
                    father_phone="9876543211",
                    mother_name="Priya Sharma",
                    mother_phone="9876543212",
                    emergency_contact_number="9876543211"
                )
                print("✅ Created student profile linked to user")

            # 3. Create Parent User
            print("\nCreating Parent User...")
            parent_email = "parent@demo.com"
            parent_user, created = User.objects.get_or_create(
                email=parent_email,
                defaults={
                    'first_name': 'Rajesh',
                    'last_name': 'Sharma',
                    'phone': '9876543211',
                    'user_type': 'PARENT',
                    'is_active': True
                }
            )
            if created:
                parent_user.set_password("parent123")
                parent_user.save()
                print(f"✅ Created parent user: {parent_email} / parent123")
            else:
                print(f"ℹ️ Parent user already exists: {parent_email}")

            # 4. Link Parent to Student
            if hasattr(student_user, 'student_profile'):
                student = student_user.student_profile
                if not StudentParent.objects.filter(student=student, parent=parent_user).exists():
                    StudentParent.objects.create(
                        student=student,
                        parent=parent_user,
                        relation='FATHER',
                        is_primary_contact=True
                    )
                    print("✅ Linked parent to student")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_demo_users()
