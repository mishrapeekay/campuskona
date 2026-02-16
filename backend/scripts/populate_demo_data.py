"""
Comprehensive Demo Data Population
===================================
This script populates the Demo High School with:
- Academic structure (boards, classes, sections, subjects)
- All user roles with proper credentials
- Sample students, teachers, staff
- Relationships and enrollments
- Sample data for all modules
"""

import os
import django
from django.db import connection
from datetime import date, datetime, timedelta, time
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.tenants.models import School
from apps.authentication.models import User
from django.contrib.auth.hashers import make_password

# Schema context
SCHEMA_NAME = 'school_demo'
SUBDOMAIN = 'demo'

def set_schema_context():
    """Set the database schema context"""
    with connection.cursor() as cursor:
        cursor.execute(f'SET search_path TO "{SCHEMA_NAME}", public')
    connection.schema_name = SCHEMA_NAME

def create_academic_structure():
    """Create boards, classes, sections, subjects"""
    print("\n" + "="*60)
    print("STEP 1: Creating Academic Structure")
    print("="*60)
    
    set_schema_context()
    
    from apps.academics.models import AcademicYear, Board, Class, Section, Subject, ClassSubject
    
    # Academic Year
    academic_year, _ = AcademicYear.objects.get_or_create(
        name='2025-2026',
        defaults={
            'start_date': date(2025, 4, 1),
            'end_date': date(2026, 3, 31),
            'is_current': True
        }
    )
    print(f"✅ Academic Year: {academic_year.name}")
    
    # Board
    board, _ = Board.objects.get_or_create(
        board_code='CBSE',
        defaults={
            'board_name': 'Central Board of Secondary Education',
            'board_type': 'CBSE',
            'is_active': True
        }
    )
    print(f"✅ Board: {board.board_name}")
    
    # Classes (1-12)
    classes_data = []
    for i in range(1, 13):
        class_obj, _ = Class.objects.get_or_create(
            name=f'Class {i}',
            defaults={
                'display_name': f'{i}th Standard' if i > 3 else f'{i}st/nd/rd Standard',
                'class_order': i,
                'board': board,
                'is_active': True
            }
        )
        classes_data.append(class_obj)
    print(f"✅ Created {len(classes_data)} classes (1-12)")
    
    # Sections for each class
    sections_data = []
    section_names = ['A', 'B', 'C']
    for class_obj in classes_data[:10]:  # Sections for classes 1-10
        for sec_name in section_names:
            section, _ = Section.objects.get_or_create(
                class_instance=class_obj,
                name=sec_name,
                academic_year=academic_year,
                defaults={
                    'max_students': 40,
                    'room_number': f'{class_obj.class_order}{sec_name}',
                    'is_active': True
                }
            )
            sections_data.append(section)
    print(f"✅ Created {len(sections_data)} sections")
    
    # Subjects
    subjects_list = [
        ('ENG', 'English', 'CORE', False, False),
        ('HIN', 'Hindi', 'CORE', False, False),
        ('MAT', 'Mathematics', 'CORE', False, False),
        ('SCI', 'Science', 'CORE', False, True),
        ('SST', 'Social Studies', 'CORE', False, False),
        ('PHY', 'Physics', 'CORE', False, True),
        ('CHE', 'Chemistry', 'CORE', False, True),
        ('BIO', 'Biology', 'CORE', False, True),
        ('CS', 'Computer Science', 'ELECTIVE', True, True),
        ('PE', 'Physical Education', 'CORE', False, False),
        ('ART', 'Art & Craft', 'ELECTIVE', True, False),
    ]
    
    subjects_data = []
    for code, name, sub_type, is_optional, has_practical in subjects_list:
        subject, _ = Subject.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'subject_type': sub_type,
                'board': board,
                'is_optional': is_optional,
                'has_practical': has_practical,
                'is_active': True
            }
        )
        subjects_data.append(subject)
    print(f"✅ Created {len(subjects_data)} subjects")
    
    return {
        'academic_year': academic_year,
        'board': board,
        'classes': classes_data,
        'sections': sections_data,
        'subjects': subjects_data
    }

def create_users_and_staff(academic_data):
    """Create all user accounts and staff profiles"""
    print("\n" + "="*60)
    print("STEP 2: Creating Users & Staff Profiles")
    print("="*60)
    
    set_schema_context()
    
    from apps.staff.models import StaffMember
    
    users_created = []
    
    # 1. Super Admin (in public schema)
    with connection.cursor() as cursor:
        cursor.execute('SET search_path TO public')
    
    super_admin, created = User.objects.get_or_create(
        email='superadmin@schoolmgmt.com',
        defaults={
            'username': 'superadmin',
            'first_name': 'Super',
            'last_name': 'Admin',
            'user_type': 'SUPER_ADMIN',
            'is_superuser': True,
            'is_staff': True,
            'is_active': True,
            'password': make_password('SuperAdmin@123')
        }
    )
    if created:
        print(f"✅ Super Admin: {super_admin.email} / SuperAdmin@123")
        users_created.append(('Super Admin', super_admin.email, 'SuperAdmin@123'))
    
    # Back to tenant schema
    set_schema_context()
    
    # 2. School Admin
    school_admin, created = User.objects.get_or_create(
        email='admin@demo.com',
        defaults={
            'username': 'schooladmin',
            'first_name': 'School',
            'last_name': 'Administrator',
            'user_type': 'SCHOOL_ADMIN',
            'is_staff': True,
            'is_active': True,
            'password': make_password('Admin@123')
        }
    )
    if created:
        print(f"✅ School Admin: {school_admin.email} / Admin@123")
        users_created.append(('School Admin', school_admin.email, 'Admin@123'))
    
    # 3. Principal
    principal_user, created = User.objects.get_or_create(
        email='principal@demo.com',
        defaults={
            'username': 'principal',
            'first_name': 'Dr. Rajesh',
            'last_name': 'Kumar',
            'user_type': 'TEACHER',
            'is_active': True,
            'password': make_password('Principal@123')
        }
    )
    if created:
        principal_staff = StaffMember.objects.create(
            user=principal_user,
            first_name='Dr. Rajesh',
            last_name='Kumar',
            designation='PRINCIPAL',
            employment_type='PERMANENT',
            date_of_joining=date(2020, 1, 1),
            date_of_birth=date(1975, 5, 15),
            gender='M',
            phone_number='9876543210',
            emergency_contact_number='9876543211',
            current_address_line1='Principal Residence',
            current_city='Mumbai',
            current_state='Maharashtra',
            current_pincode='400001',
            permanent_address_line1='Principal Residence',
            permanent_city='Mumbai',
            permanent_state='Maharashtra',
            permanent_pincode='400001',
            is_active=True
        )
        print(f"✅ Principal: {principal_user.email} / Principal@123")
        users_created.append(('Principal', principal_user.email, 'Principal@123'))
    
    # 4. Vice Principal
    vice_principal_user, created = User.objects.get_or_create(
        email='viceprincipal@demo.com',
        defaults={
            'username': 'viceprincipal',
            'first_name': 'Mrs. Priya',
            'last_name': 'Sharma',
            'user_type': 'TEACHER',
            'is_active': True,
            'password': make_password('VicePrincipal@123')
        }
    )
    if created:
        vice_principal_staff = StaffMember.objects.create(
            user=vice_principal_user,
            first_name='Mrs. Priya',
            last_name='Sharma',
            designation='VICE_PRINCIPAL',
            employment_type='PERMANENT',
            date_of_joining=date(2021, 6, 1),
            date_of_birth=date(1980, 8, 20),
            gender='F',
            phone_number='9876543220',
            emergency_contact_number='9876543221',
            current_address_line1='VP Residence',
            current_city='Mumbai',
            current_state='Maharashtra',
            current_pincode='400002',
            permanent_address_line1='VP Residence',
            permanent_city='Mumbai',
            permanent_state='Maharashtra',
            permanent_pincode='400002',
            is_active=True
        )
        print(f"✅ Vice Principal: {vice_principal_user.email} / VicePrincipal@123")
        users_created.append(('Vice Principal', vice_principal_user.email, 'VicePrincipal@123'))
    
    # 5. Class Teachers (one for each section)
    teachers = []
    teacher_names = [
        ('Amit', 'Verma', 'M'), ('Sneha', 'Patel', 'F'), ('Rahul', 'Singh', 'M'),
        ('Kavita', 'Desai', 'F'), ('Vikram', 'Reddy', 'M'), ('Anjali', 'Mehta', 'F'),
        ('Suresh', 'Nair', 'M'), ('Pooja', 'Gupta', 'F'), ('Manoj', 'Joshi', 'M'),
        ('Deepa', 'Iyer', 'F')
    ]
    
    for idx, (first, last, gender) in enumerate(teacher_names[:10]):
        teacher_user, created = User.objects.get_or_create(
            email=f'teacher{idx+1}@demo.com',
            defaults={
                'username': f'teacher{idx+1}',
                'first_name': first,
                'last_name': last,
                'user_type': 'TEACHER',
                'is_active': True,
                'password': make_password('Teacher@123')
            }
        )
        if created:
            teacher_staff = StaffMember.objects.create(
                user=teacher_user,
                first_name=first,
                last_name=last,
                designation='TEACHER',
                employment_type='PERMANENT',
                date_of_joining=date(2022 + (idx % 3), 1, 1),
                date_of_birth=date(1985 + idx, 1, 15),
                gender=gender,
                phone_number=f'98765432{30+idx}',
                emergency_contact_number=f'98765432{40+idx}',
                current_address_line1=f'Teacher Residence {idx+1}',
                current_city='Mumbai',
                current_state='Maharashtra',
                current_pincode='400003',
                permanent_address_line1=f'Teacher Residence {idx+1}',
                permanent_city='Mumbai',
                permanent_state='Maharashtra',
                permanent_pincode='400003',
                is_active=True
            )
            teachers.append(teacher_staff)
            if idx == 0:
                print(f"✅ Teacher 1: {teacher_user.email} / Teacher@123")
                users_created.append(('Teacher (Sample)', teacher_user.email, 'Teacher@123'))
    
    print(f"✅ Created {len(teachers)} teachers total")
    
    # 6. Sports Teacher
    sports_user, created = User.objects.get_or_create(
        email='sports@demo.com',
        defaults={
            'username': 'sportsteacher',
            'first_name': 'Coach',
            'last_name': 'Ravi',
            'user_type': 'TEACHER',
            'is_active': True,
            'password': make_password('Sports@123')
        }
    )
    if created:
        sports_staff = StaffMember.objects.create(
            user=sports_user,
            first_name='Coach',
            last_name='Ravi',
            designation='TEACHER',
            employment_type='PERMANENT',
            date_of_joining=date(2023, 1, 1),
            date_of_birth=date(1988, 3, 10),
            gender='M',
            phone_number='9876543250',
            emergency_contact_number='9876543251',
            current_address_line1='Sports Complex',
            current_city='Mumbai',
            current_state='Maharashtra',
            current_pincode='400004',
            permanent_address_line1='Sports Complex',
            permanent_city='Mumbai',
            permanent_state='Maharashtra',
            permanent_pincode='400004',
            is_active=True
        )
        print(f"✅ Sports Teacher: {sports_user.email} / Sports@123")
        users_created.append(('Sports Teacher', sports_user.email, 'Sports@123'))
    
    # 7. Librarian
    librarian_user, created = User.objects.get_or_create(
        email='librarian@demo.com',
        defaults={
            'username': 'librarian',
            'first_name': 'Mrs. Lakshmi',
            'last_name': 'Nair',
            'user_type': 'LIBRARIAN',
            'is_active': True,
            'password': make_password('Librarian@123')
        }
    )
    if created:
        librarian_staff = StaffMember.objects.create(
            user=librarian_user,
            first_name='Mrs. Lakshmi',
            last_name='Nair',
            designation='LIBRARIAN',
            employment_type='PERMANENT',
            date_of_joining=date(2022, 7, 1),
            date_of_birth=date(1982, 11, 5),
            gender='F',
            phone_number='9876543260',
            emergency_contact_number='9876543261',
            current_address_line1='Library Staff Quarters',
            current_city='Mumbai',
            current_state='Maharashtra',
            current_pincode='400005',
            permanent_address_line1='Library Staff Quarters',
            permanent_city='Mumbai',
            permanent_state='Maharashtra',
            permanent_pincode='400005',
            is_active=True
        )
        print(f"✅ Librarian: {librarian_user.email} / Librarian@123")
        users_created.append(('Librarian', librarian_user.email, 'Librarian@123'))
    
    # 8. Transport Incharge
    transport_user, created = User.objects.get_or_create(
        email='transport@demo.com',
        defaults={
            'username': 'transport',
            'first_name': 'Mr. Sunil',
            'last_name': 'Patil',
            'user_type': 'TRANSPORT',
            'is_active': True,
            'password': make_password('Transport@123')
        }
    )
    if created:
        transport_staff = StaffMember.objects.create(
            user=transport_user,
            first_name='Mr. Sunil',
            last_name='Patil',
            designation='TRANSPORT_INCHARGE',
            employment_type='PERMANENT',
            date_of_joining=date(2023, 4, 1),
            date_of_birth=date(1978, 6, 25),
            gender='M',
            phone_number='9876543270',
            emergency_contact_number='9876543271',
            current_address_line1='Transport Office',
            current_city='Mumbai',
            current_state='Maharashtra',
            current_pincode='400006',
            permanent_address_line1='Transport Office',
            permanent_city='Mumbai',
            permanent_state='Maharashtra',
            permanent_pincode='400006',
            is_active=True
        )
        print(f"✅ Transport Incharge: {transport_user.email} / Transport@123")
        users_created.append(('Transport Incharge', transport_user.email, 'Transport@123'))
    
    return {
        'users_created': users_created,
        'teachers': teachers,
        'principal': principal_staff if 'principal_staff' in locals() else None,
        'librarian': librarian_staff if 'librarian_staff' in locals() else None,
        'transport': transport_staff if 'transport_staff' in locals() else None
    }

def create_students_and_parents(academic_data):
    """Create sample students and parent accounts"""
    print("\n" + "="*60)
    print("STEP 3: Creating Students & Parents")
    print("="*60)
    
    set_schema_context()
    
    from apps.students.models import Student, StudentParent
    from apps.academics.models import StudentEnrollment
    
    students_created = []
    parents_created = []
    
    # Create 5 students per section (first 3 sections only for demo)
    sections = academic_data['sections'][:3]  # Class 1-A, 1-B, 1-C
    
    student_names = [
        ('Aarav', 'Sharma', 'M'), ('Diya', 'Patel', 'F'), ('Arjun', 'Kumar', 'M'),
        ('Ananya', 'Singh', 'F'), ('Vihaan', 'Reddy', 'M'), ('Isha', 'Desai', 'F'),
        ('Aditya', 'Mehta', 'M'), ('Saanvi', 'Gupta', 'F'), ('Reyansh', 'Joshi', 'M'),
        ('Myra', 'Nair', 'F'), ('Kabir', 'Verma', 'M'), ('Aanya', 'Iyer', 'F'),
        ('Shaurya', 'Rao', 'M'), ('Navya', 'Pillai', 'F'), ('Ayaan', 'Shah', 'M')
    ]
    
    for idx, (first, last, gender) in enumerate(student_names):
        section = sections[idx % 3]
        
        # Create student user
        student_user, created = User.objects.get_or_create(
            email=f'student{idx+1}@demo.com',
            defaults={
                'username': f'student{idx+1}',
                'first_name': first,
                'last_name': last,
                'user_type': 'STUDENT',
                'is_active': True,
                'password': make_password('Student@123')
            }
        )
        
        if created:
            # Create student profile
            student = Student.objects.create(
                user=student_user,
                first_name=first,
                last_name=last,
                admission_number=f'DEMO2026{str(idx+1).zfill(4)}',
                admission_date=date(2025, 4, 1),
                admission_status='ACTIVE',
                gender=gender,
                date_of_birth=date(2015, 1 + (idx % 12), 1 + (idx % 28)),
                blood_group=random.choice(['A+', 'B+', 'O+', 'AB+']),
                phone_number='',
                emergency_contact_number=f'98765{str(43300 + idx).zfill(5)}',
                email=f'student{idx+1}@demo.com',
                current_address_line1=f'{idx+1}, Student Colony',
                current_city='Mumbai',
                current_state='Maharashtra',
                current_pincode='400010',
                permanent_address_line1=f'{idx+1}, Student Colony',
                permanent_city='Mumbai',
                permanent_state='Maharashtra',
                permanent_pincode='400010',
                father_name=f'{last} Father',
                father_phone=f'98765{str(44000 + idx).zfill(5)}',
                mother_name=f'{last} Mother',
                mother_phone=f'98765{str(45000 + idx).zfill(5)}',
                category='GENERAL',
                religion='HINDU'
            )
            
            # Create enrollment
            enrollment = StudentEnrollment.objects.create(
                student=student,
                section=section,
                academic_year=academic_data['academic_year'],
                enrollment_date=date(2025, 4, 1),
                roll_number=idx + 1,
                enrollment_status='ENROLLED',
                is_active=True
            )
            
            # Create parent user
            parent_user, parent_created = User.objects.get_or_create(
                email=f'parent{idx+1}@demo.com',
                defaults={
                    'username': f'parent{idx+1}',
                    'first_name': f'{last}',
                    'last_name': 'Parent',
                    'user_type': 'PARENT',
                    'is_active': True,
                    'password': make_password('Parent@123')
                }
            )
            
            if parent_created:
                # Link parent to student
                StudentParent.objects.create(
                    student=student,
                    parent=parent_user,
                    relation='FATHER',
                    is_primary_contact=True,
                    is_emergency_contact=True
                )
                
                if idx == 0:
                    parents_created.append(('Parent (Sample)', parent_user.email, 'Parent@123'))
            
            if idx == 0:
                students_created.append(('Student (Sample)', student_user.email, 'Student@123'))
    
    print(f"✅ Created {len(student_names)} students with enrollments")
    print(f"✅ Created {len(student_names)} parent accounts")
    
    return {
        'students_created': students_created,
        'parents_created': parents_created
    }

def assign_class_teachers(academic_data, staff_data):
    """Assign teachers to sections"""
    print("\n" + "="*60)
    print("STEP 4: Assigning Class Teachers")
    print("="*60)
    
    set_schema_context()
    
    from apps.academics.models import Section
    
    teachers = staff_data['teachers']
    sections = academic_data['sections'][:len(teachers)]
    
    for idx, section in enumerate(sections):
        if idx < len(teachers):
            section.class_teacher = teachers[idx]
            section.save()
    
    print(f"✅ Assigned {len(sections)} class teachers")

def print_credentials_summary(user_data, student_data):
    """Print all created credentials"""
    print("\n" + "="*70)
    print(" 📋 CREDENTIALS SUMMARY")
    print("="*70)
    
    all_credentials = []
    all_credentials.extend(user_data['users_created'])
    all_credentials.extend(student_data['students_created'])
    all_credentials.extend(student_data['parents_created'])
    
    print("\n{:<25} {:<35} {:<20}".format("ROLE", "EMAIL", "PASSWORD"))
    print("-" * 80)
    for role, email, password in all_credentials:
        print("{:<25} {:<35} {:<20}".format(role, email, password))
    
    print("\n" + "="*70)
    print(f" ✅ Total Accounts Created: {len(all_credentials)}")
    print("="*70)

def main():
    """Main execution"""
    print("\n" + "="*70)
    print(" DEMO DATA POPULATION - COMPREHENSIVE SETUP")
    print("="*70)
    
    try:
        # Create academic structure
        academic_data = create_academic_structure()
        
        # Create users and staff
        staff_data = create_users_and_staff(academic_data)
        
        # Create students and parents
        student_data = create_students_and_parents(academic_data)
        
        # Assign class teachers
        assign_class_teachers(academic_data, staff_data)
        
        # Print summary
        print_credentials_summary(staff_data, student_data)
        
        print("\n" + "="*70)
        print(" ✅ DEMO DATA POPULATION COMPLETE!")
        print("="*70)
        print("\nYou can now:")
        print("1. Test all user logins with the credentials above")
        print("2. Access dashboards for each role")
        print("3. Test mobile app with these credentials")
        print("\nSubdomain: demo")
        print("Example: Login with teacher1@demo.com / Teacher@123")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
