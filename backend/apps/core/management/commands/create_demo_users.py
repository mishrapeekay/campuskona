from django.core.management.base import BaseCommand
from django.db import transaction
from apps.authentication.models import User
from apps.students.models import Student, StudentParent
from apps.staff.models import StaffMember
from datetime import date

class Command(BaseCommand):
    help = 'Create demo student and parent users'

    def handle(self, *args, **kwargs):
        try:
            with transaction.atomic():
                # 1. Create Student User
                self.stdout.write("Creating Student User...")
                student_email = "student@demo.com"
                
                # Check if phone exists
                if User.objects.filter(phone='9000000001').exists():
                     self.stdout.write("User with phone 9000000001 already exists.")
                
                student_user, created = User.objects.get_or_create(
                    email=student_email,
                    defaults={
                        'first_name': 'Rahul',
                        'last_name': 'Sharma',
                        'phone': '9000000001',
                        'user_type': 'STUDENT',
                        'is_active': True,
                        'date_of_birth': date(2010, 5, 15),
                        'gender': 'M'
                    }
                )
                if created:
                    student_user.set_password("student123")
                    student_user.save()
                    self.stdout.write(self.style.SUCCESS(f"✅ Created student user: {student_email} / student123"))
                else:
                    self.stdout.write(f"ℹ️ Student user already exists: {student_email}")

                # 2. Create Student Profile (Required for portal access)
                if not hasattr(student_user, 'student_profile'):
                    self.stdout.write("Creating Student Profile...")
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
                        father_phone="9000000003",
                        mother_name="Priya Sharma",
                        mother_phone="9000000004",
                        emergency_contact_number="9000000005",
                        admission_status='ACTIVE',
                        admission_number="ADM-DEMO-2025-001"
                    )
                    self.stdout.write(self.style.SUCCESS("✅ Created student profile linked to user"))

                # 3. Create Parent User
                self.stdout.write("\nCreating Parent User...")
                parent_email = "parent@demo.com"
                parent_user, created = User.objects.get_or_create(
                    email=parent_email,
                    defaults={
                        'first_name': 'Rajesh',
                        'last_name': 'Sharma',
                        'phone': '9000000002',
                        'user_type': 'PARENT',
                        'is_active': True
                    }
                )
                if created:
                    parent_user.set_password("parent123")
                    parent_user.save()
                    self.stdout.write(self.style.SUCCESS(f"✅ Created parent user: {parent_email} / parent123"))
                else:
                    self.stdout.write(f"ℹ️ Parent user already exists: {parent_email}")

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
                        self.stdout.write(self.style.SUCCESS("✅ Linked parent to student"))

                # 5. Create Teacher User
                self.stdout.write("\nCreating Teacher User...")
                teacher_email = "teacher@demo.com"
                teacher_user, created = User.objects.get_or_create(
                    email=teacher_email,
                    defaults={
                        'first_name': 'Amit',
                        'last_name': 'Verma',
                        'phone': '9000000006',
                        'user_type': 'TEACHER',
                        'is_active': True,
                        'date_of_birth': date(1985, 8, 20),
                        'gender': 'M'
                    }
                )
                if created:
                    teacher_user.set_password("teacher123")
                    teacher_user.save()
                    self.stdout.write(self.style.SUCCESS(f"✅ Created teacher user: {teacher_email} / teacher123"))
                else:
                    self.stdout.write(f"ℹ️ Teacher user already exists: {teacher_email}")

                # 6. Create Staff Profile
                if not hasattr(teacher_user, 'staff_profile'):
                    self.stdout.write("Creating Staff Profile...")
                    StaffMember.objects.create(
                        user=teacher_user,
                        first_name=teacher_user.first_name,
                        last_name=teacher_user.last_name,
                        date_of_birth=teacher_user.date_of_birth,
                        gender=teacher_user.gender,
                        email=teacher_email,
                        phone_number=teacher_user.phone,
                        joining_date=date.today(),
                        designation='TEACHER',
                        department='Science',
                        employment_type='PERMANENT',
                        employment_status='ACTIVE',
                        current_address_line1="456 Teacher Road",
                        current_city="Mumbai",
                        current_state="Maharashtra",
                        current_pincode="400002",
                        permanent_address_line1="456 Teacher Road",
                        permanent_city="Mumbai",
                        permanent_state="Maharashtra",
                        permanent_pincode="400002",
                        emergency_contact_name="Sunita Verma",
                        emergency_contact_number="9000000007",
                        emergency_contact_relation="WIFE",
                        employee_id="EMP-DEMO-2025-001"
                    )
                    self.stdout.write(self.style.SUCCESS("✅ Created staff profile linked to user"))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error: {str(e)}"))
            import traceback
            traceback.print_exc()
