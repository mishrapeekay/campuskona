import os
import django
import random
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.staff.models import StaffMember
from apps.students.models import Student, StudentParent
from apps.academics.models import Class, Section, StudentEnrollment, AcademicYear, Board
from django.db import connection

User = get_user_model()

def fix_teacher(email, academic_year):
    print(f"\n Fixing Teacher {email}...")
    try:
        user = User.objects.get(email=email)
        
        # Check if staff profile exists
        if StaffMember.objects.filter(user=user).exists():
             staff = StaffMember.objects.get(user=user)
             print(f" - Staff profile already exists: {staff.employee_id}")
        else:
            # Create Staff Member
            staff = StaffMember.objects.create(
                user=user,
                first_name=user.first_name or "Teacher",
                last_name=user.last_name or "Test",
                email=email,
                phone_number="9876543210",
                date_of_birth=date(1985, 1, 1),
                
                department="Academics", 
                designation="SENIOR_TEACHER",
                employment_type="PERMANENT",
                employment_status="ACTIVE",
                joining_date=date.today(),
                gender="M",
                
                # Address
                current_address_line1="123 School Lane",
                current_city="Metropolis",
                current_state="MP",
                current_pincode="462001",
                permanent_address_line1="123 School Lane",
                permanent_city="Metropolis",
                permanent_state="MP",
                permanent_pincode="462001",
                
                # Emergency
                emergency_contact_name="Spouse",
                emergency_contact_number="9876543211",
                emergency_contact_relation="SPOUSE"
            )
            print(f" - Created StaffMember: {staff.employee_id}")
        
        # Assign as class teacher
        section = Section.objects.filter(academic_year=academic_year).first()
        if section:
            section.class_teacher = staff
            section.save()
            print(f" - Assigned as Class Teacher for {section}")
            
    except User.DoesNotExist:
        print(" - User not found!")
    except Exception as e:
        print(f" - Error fixing teacher: {e}")

def fix_student(email, academic_year, board):
    print(f"\n Fixing Student {email}...")
    try:
        user = User.objects.get(email=email)
        
        if Student.objects.filter(user=user).exists():
            print(" - Student profile already exists.")
            student = Student.objects.get(user=user)
        else:
            # Create Student
            student = Student.objects.create(
                user=user,
                admission_number=f"ADM-{random.randint(1000, 9999)}",
                first_name=user.first_name or "Student",
                last_name=user.last_name or "Test",
                email=email,
                date_of_birth=date(2010, 1, 1),
                gender="M",
                admission_status="ACTIVE",
                admission_date=date.today(),
                student_aadhar_number=f"123456789{random.randint(100,999)}" # Mock aadhar if required
            )
            print(f" - Created Student: {student.admission_number}")
        
        # Enroll in a class
        class_obj = Class.objects.filter(board=board).first()
        if not class_obj:
            class_obj = Class.objects.create(
                name="10",
                display_name="Class 10",
                class_order=10,
                board=board
            )
            print(f" - Created Class 10")
        
        # Find or create section
        section = Section.objects.filter(class_instance=class_obj, academic_year=academic_year).first()
        if not section:
             section = Section.objects.create(
                 class_instance=class_obj,
                 academic_year=academic_year,
                 name="A",
                 max_students=40
             )
             print(f" - Created Section A")
        
        # Check active enrollment
        if not StudentEnrollment.objects.filter(student=student, is_active=True).exists():
            enrollment = StudentEnrollment.objects.create(
                student=student,
                section=section,
                academic_year=academic_year,
                roll_number=str(random.randint(1, 100)),
                is_active=True,
                enrollment_date=date.today(),
                enrollment_status='ENROLLED'
            )
            print(f" - Enrolled in {class_obj.display_name} - {section.name}")
        else:
            print(f" - Already enrolled.")

    except User.DoesNotExist:
        print(" - User not found!")
    except Exception as e:
        print(f" - Error fixing student: {e}")

def fix_parent(parent_email, student_email):
    print(f"\n Fixing Parent {parent_email} linking to {student_email}...")
    try:
        parent_user = User.objects.get(email=parent_email)
        student_user = User.objects.get(email=student_email)
        
        try:
            student = Student.objects.get(user=student_user)
        except Student.DoesNotExist:
            print(" - Student profile not found, cannot link.")
            return

        if StudentParent.objects.filter(parent=parent_user, student=student).exists():
            print(" - Link already exists.")
            return
            
        StudentParent.objects.create(
            student=student,
            parent=parent_user,
            relation="FATHER",
            is_primary_contact=True
        )
        print(" - Linked Parent to Student.")
        
    except User.DoesNotExist:
        print(" - User(s) not found.")
    except Exception as e:
        print(f" - Error fixing parent: {e}")


def run_fixes(tenant_name):
    print(f"\n[{tenant_name.upper()}] Running fixes...")
    
    with connection.cursor() as cursor:
        cursor.execute(f"SET search_path to {tenant_name}, public")
    
    connection.schema_name = tenant_name
    
    board, _ = Board.objects.get_or_create(
        board_type="CBSE",
        defaults={"board_name": "Central Board", "board_code": "CBSE"}
    )
    
    ay, _ = AcademicYear.objects.get_or_create(
        name="2025-2026",
        defaults={
            "start_date": date(2025, 4, 1),
            "end_date": date(2026, 3, 31),
            "is_current": True
        }
    )
    
    fix_teacher(f'teacher@{tenant_name}.com', ay)
    fix_student(f'student@{tenant_name}.com', ay, board)
    fix_parent(f'parent@{tenant_name}.com', f'student@{tenant_name}.com')

if __name__ == "__main__":
    run_fixes('veda')
    run_fixes('demo')
