"""
Complete Demo Tenant Setup Command
===================================
This management command creates a fully functional demo tenant with:
- Complete academic structure (classes 1-12)
- All user roles with realistic data
- Sample students across multiple classes
- Fee structures and sample payments
- Attendance records
- Exam schedules and sample marks
- Library books and issues
- Transport routes and allocations
- Communication notices and events

Usage: python manage.py setup_complete_demo
"""

from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.contrib.auth.hashers import make_password
from datetime import date, timedelta, time
from decimal import Decimal
import random
import uuid


class Command(BaseCommand):
    help = 'Setup complete demo tenant with all modules populated'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Reset existing demo data before creating new',
        )
        parser.add_argument(
            '--students-per-section',
            type=int,
            default=10,
            help='Number of students per section (default: 10)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n' + '='*70))
        self.stdout.write(self.style.SUCCESS(' COMPLETE DEMO TENANT SETUP'))
        self.stdout.write(self.style.SUCCESS('='*70 + '\n'))

        self.students_per_section = options['students_per_section']
        self.credentials = []

        try:
            # Import models
            self._import_models()

            # Setup steps
            self._setup_subscription()
            self._setup_school()
            self._setup_schema()
            self._setup_academic_structure()
            self._setup_admin_users()
            self._setup_teachers()
            self._setup_support_staff()
            self._setup_students_and_parents()
            self._assign_class_teachers()
            self._setup_fee_structure()
            self._setup_sample_fees_and_payments()
            self._setup_attendance_data()
            self._setup_exam_structure()
            self._setup_sample_marks()
            self._setup_library()
            self._setup_transport()
            self._setup_communication()
            self._setup_timetable()

            # Print summary
            self._print_summary()

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n ERROR: {str(e)}'))
            import traceback
            traceback.print_exc()

    def _import_models(self):
        """Import all required models"""
        from apps.tenants.models import School, Subscription, TenantConfig
        from apps.authentication.models import User
        from apps.academics.models import (
            AcademicYear, Board, Class, Section, Subject,
            ClassSubject, StudentEnrollment, StudentSubject
        )
        from apps.staff.models import StaffMember
        from apps.students.models import Student, StudentParent
        from apps.finance.models import (
            FeeCategory, FeeStructure, StudentFee, Payment, PaymentAllocation
        )
        from apps.attendance.models import (
            StudentAttendance, StaffAttendance, Holiday, AttendancePeriod
        )
        from apps.examinations.models import (
            GradeScale, Grade, ExamType, Examination,
            ExamSchedule, StudentMark
        )
        from apps.library.models import Category, Author, Book, BookIssue
        from apps.transport.models import Vehicle, Driver, Route, Stop, TransportAllocation
        from apps.communication.models import Notice, Event
        from apps.timetable.models import TimeSlot, ClassTimetable

        # Store references
        self.School = School
        self.Subscription = Subscription
        self.TenantConfig = TenantConfig
        self.User = User
        self.AcademicYear = AcademicYear
        self.Board = Board
        self.Class = Class
        self.Section = Section
        self.Subject = Subject
        self.ClassSubject = ClassSubject
        self.StudentEnrollment = StudentEnrollment
        self.StudentSubject = StudentSubject
        self.StaffMember = StaffMember
        self.Student = Student
        self.StudentParent = StudentParent
        self.FeeCategory = FeeCategory
        self.FeeStructure = FeeStructure
        self.StudentFee = StudentFee
        self.Payment = Payment
        self.PaymentAllocation = PaymentAllocation
        self.StudentAttendance = StudentAttendance
        self.StaffAttendance = StaffAttendance
        self.Holiday = Holiday
        self.AttendancePeriod = AttendancePeriod
        self.GradeScale = GradeScale
        self.Grade = Grade
        self.ExamType = ExamType
        self.Examination = Examination
        self.ExamSchedule = ExamSchedule
        self.StudentMark = StudentMark
        self.Category = Category
        self.Author = Author
        self.Book = Book
        self.BookIssue = BookIssue
        self.Vehicle = Vehicle
        self.Driver = Driver
        self.Route = Route
        self.Stop = Stop
        self.TransportAllocation = TransportAllocation
        self.Notice = Notice
        self.Event = Event
        self.TimeSlot = TimeSlot
        self.ClassTimetable = ClassTimetable

        self.stdout.write(' Models imported successfully')

    def _setup_subscription(self):
        """Create subscription plan"""
        self.stdout.write('\n Step 1: Setting up subscription plan...')

        self.subscription, created = self.Subscription.objects.get_or_create(
            name='Professional Plan',
            defaults={
                'description': 'Full-featured professional plan for schools',
                'max_students': 5000,
                'max_teachers': 200,
                'max_staff': 100,
                'price_monthly': Decimal('9999.00'),
                'price_yearly': Decimal('99999.00'),
                'currency': 'INR',
                'features': {
                    'modules': ['students', 'staff', 'academics', 'attendance',
                               'examinations', 'finance', 'library', 'transport',
                               'communication', 'timetable', 'reports'],
                    'mobile_app': True,
                    'parent_portal': True,
                    'sms_notifications': True,
                    'email_notifications': True,
                    'api_access': True,
                    'custom_reports': True,
                    'data_export': True,
                },
                'is_active': True,
                'is_trial': False,
            }
        )
        self.stdout.write(self.style.SUCCESS(f'   Subscription: {self.subscription.name}'))

    def _setup_school(self):
        """Create demo school"""
        self.stdout.write('\n Step 2: Creating demo school...')

        # Delete existing demo school
        self.School.objects.filter(subdomain='demo').delete()

        self.school = self.School.objects.create(
            name='Demo International School',
            code='DEMOIS2026',
            schema_name='school_demo',
            subdomain='demo',
            email='admin@demointernational.edu',
            phone='9876543210',
            address='123 Education Avenue, Knowledge Park',
            city='Mumbai',
            state='Maharashtra',
            country='India',
            pincode='400001',
            primary_board='CBSE',
            supported_boards=['CBSE', 'ICSE'],
            primary_color='#1976D2',
            secondary_color='#FF5722',
            subscription=self.subscription,
            subscription_start_date=date.today(),
            subscription_end_date=date.today() + timedelta(days=365),
            is_active=True,
            auto_create_schema=False,
            settings={
                'school_timing': {'start': '08:00', 'end': '14:30'},
                'fee_collection_day': 10,
                'attendance_cutoff': '09:30',
            }
        )
        self.stdout.write(self.style.SUCCESS(f'   School: {self.school.name}'))
        self.stdout.write(f'   Subdomain: {self.school.subdomain}')

    def _setup_schema(self):
        """Create database schema"""
        self.stdout.write('\n Step 3: Setting up database schema...')

        with connection.cursor() as cursor:
            cursor.execute(f'CREATE SCHEMA IF NOT EXISTS "{self.school.schema_name}"')
            cursor.execute(f'SET search_path TO "{self.school.schema_name}", public')

        connection.schema_name = self.school.schema_name
        self.stdout.write(self.style.SUCCESS(f'   Schema: {self.school.schema_name}'))

    def _setup_academic_structure(self):
        """Create academic year, board, classes, sections, subjects"""
        self.stdout.write('\n Step 4: Creating academic structure...')

        # Academic Year
        self.academic_year, _ = self.AcademicYear.objects.get_or_create(
            name='2025-2026',
            defaults={
                'start_date': date(2025, 4, 1),
                'end_date': date(2026, 3, 31),
                'is_current': True
            }
        )

        # Board
        self.board, _ = self.Board.objects.get_or_create(
            board_code='CBSE',
            defaults={
                'board_name': 'Central Board of Secondary Education',
                'board_type': 'CBSE',
                'is_active': True
            }
        )

        # Classes (1-12)
        self.classes = []
        class_names = {
            1: 'Class 1', 2: 'Class 2', 3: 'Class 3', 4: 'Class 4', 5: 'Class 5',
            6: 'Class 6', 7: 'Class 7', 8: 'Class 8', 9: 'Class 9', 10: 'Class 10',
            11: 'Class 11', 12: 'Class 12'
        }

        for order, name in class_names.items():
            class_obj, _ = self.Class.objects.get_or_create(
                name=name,
                defaults={
                    'display_name': f'{order}th Standard' if order > 3 else f'{["1st", "2nd", "3rd"][order-1]} Standard',
                    'class_order': order,
                    'board': self.board,
                    'is_active': True
                }
            )
            self.classes.append(class_obj)

        # Sections (A, B, C for classes 1-10; A, B for 11-12)
        self.sections = []
        for class_obj in self.classes[:10]:
            for sec_name in ['A', 'B', 'C']:
                section, _ = self.Section.objects.get_or_create(
                    class_instance=class_obj,
                    name=sec_name,
                    academic_year=self.academic_year,
                    defaults={
                        'max_students': 40,
                        'room_number': f'{class_obj.class_order}{sec_name}',
                        'is_active': True
                    }
                )
                self.sections.append(section)

        for class_obj in self.classes[10:]:
            for sec_name in ['A', 'B']:
                section, _ = self.Section.objects.get_or_create(
                    class_instance=class_obj,
                    name=sec_name,
                    academic_year=self.academic_year,
                    defaults={
                        'max_students': 40,
                        'room_number': f'{class_obj.class_order}{sec_name}',
                        'is_active': True
                    }
                )
                self.sections.append(section)

        # Subjects
        subjects_data = [
            ('ENG', 'English', 'CORE', False, False, 100, 0),
            ('HIN', 'Hindi', 'CORE', False, False, 100, 0),
            ('MAT', 'Mathematics', 'CORE', False, False, 100, 0),
            ('SCI', 'Science', 'CORE', False, True, 80, 20),
            ('SST', 'Social Studies', 'CORE', False, False, 100, 0),
            ('PHY', 'Physics', 'CORE', False, True, 70, 30),
            ('CHE', 'Chemistry', 'CORE', False, True, 70, 30),
            ('BIO', 'Biology', 'CORE', False, True, 70, 30),
            ('CS', 'Computer Science', 'ELECTIVE', True, True, 70, 30),
            ('PE', 'Physical Education', 'CORE', False, True, 30, 70),
            ('ART', 'Art & Craft', 'ELECTIVE', True, True, 0, 100),
            ('MUS', 'Music', 'ELECTIVE', True, True, 0, 100),
            ('EVS', 'Environmental Studies', 'CORE', False, False, 100, 0),
        ]

        self.subjects = []
        for code, name, sub_type, is_optional, has_practical, theory, practical in subjects_data:
            subject, _ = self.Subject.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'subject_type': sub_type,
                    'board': self.board,
                    'is_optional': is_optional,
                    'has_practical': has_practical,
                    'theory_max_marks': theory,
                    'practical_max_marks': practical,
                    'is_active': True
                }
            )
            self.subjects.append(subject)

        self.stdout.write(self.style.SUCCESS(f'   Academic Year: {self.academic_year.name}'))
        self.stdout.write(f'   Classes: {len(self.classes)}')
        self.stdout.write(f'   Sections: {len(self.sections)}')
        self.stdout.write(f'   Subjects: {len(self.subjects)}')

    def _setup_admin_users(self):
        """Create administrative users"""
        self.stdout.write('\n Step 5: Creating administrative users...')

        # Super Admin (in public schema)
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO public')

        super_admin, created = self.User.objects.get_or_create(
            email='superadmin@schoolmgmt.com',
            defaults={
                'first_name': 'Platform',
                'last_name': 'Administrator',
                'phone': '9000000001',
                'user_type': 'SUPER_ADMIN',
                'is_superuser': True,
                'is_staff': True,
                'is_active': True,
                'password': make_password('SuperAdmin@123')
            }
        )
        self.credentials.append(('Super Admin', 'superadmin@schoolmgmt.com', 'SuperAdmin@123'))

        # Back to tenant schema
        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{self.school.schema_name}", public')
        connection.schema_name = self.school.schema_name

        # School Admin
        school_admin, created = self.User.objects.get_or_create(
            email='admin@demo.com',
            defaults={
                'first_name': 'School',
                'last_name': 'Administrator',
                'phone': '9876543210',
                'user_type': 'SCHOOL_ADMIN',
                'is_staff': False,
                'is_active': True,
                'password': make_password('Admin@123')
            }
        )
        self.credentials.append(('School Admin', 'admin@demo.com', 'Admin@123'))

        # Accountant
        accountant, created = self.User.objects.get_or_create(
            email='accountant@demo.com',
            defaults={
                'first_name': 'Mohan',
                'last_name': 'Sharma',
                'phone': '9876543299',
                'user_type': 'ACCOUNTANT',
                'is_active': True,
                'password': make_password('Accountant@123')
            }
        )
        if created:
            self.StaffMember.objects.create(
                user=accountant,
                employee_id='EMP050',
                first_name='Mohan',
                last_name='Sharma',
                designation='ACCOUNTANT',
                employment_type='PERMANENT',
                joining_date=date(2022, 1, 1),
                date_of_birth=date(1980, 5, 15),
                gender='M',
                phone_number='9876543299',
                email='accountant@demo.com',
                emergency_contact_name='Mrs. Sharma',
                emergency_contact_number='9876543298',
                emergency_contact_relation='Spouse',
                current_address_line1='Finance Block',
                current_city='Mumbai',
                current_state='Maharashtra',
                current_pincode='400001',
                permanent_address_line1='Finance Block',
                permanent_city='Mumbai',
                permanent_state='Maharashtra',
                permanent_pincode='400001',
            )
        self.credentials.append(('Accountant', 'accountant@demo.com', 'Accountant@123'))

        self.stdout.write(self.style.SUCCESS(f'   Created admin users'))

    def _setup_teachers(self):
        """Create principal, vice principal, and teachers"""
        self.stdout.write('\n Step 6: Creating teaching staff...')

        self.teachers = []

        # Principal
        principal_user, created = self.User.objects.get_or_create(
            email='principal@demo.com',
            defaults={
                'first_name': 'Dr. Rajesh',
                'last_name': 'Kumar',
                'phone': '9876543211',
                'user_type': 'PRINCIPAL',
                'is_active': True,
                'password': make_password('Principal@123')
            }
        )
        if created:
            self.principal = self.StaffMember.objects.create(
                user=principal_user,
                employee_id='EMP001',
                first_name='Dr. Rajesh',
                last_name='Kumar',
                designation='PRINCIPAL',
                employment_type='PERMANENT',
                joining_date=date(2015, 1, 1),
                date_of_birth=date(1970, 5, 15),
                gender='M',
                phone_number='9876543211',
                email='principal@demo.com',
                qualification='Ph.D. in Education',
                emergency_contact_name='Mrs. Kumar',
                emergency_contact_number='9876543212',
                emergency_contact_relation='Spouse',
                current_address_line1='Principal Bungalow',
                current_city='Mumbai',
                current_state='Maharashtra',
                current_pincode='400001',
                permanent_address_line1='Principal Bungalow',
                permanent_city='Mumbai',
                permanent_state='Maharashtra',
                permanent_pincode='400001',
            )
        self.credentials.append(('Principal', 'principal@demo.com', 'Principal@123'))

        # Vice Principal
        vp_user, created = self.User.objects.get_or_create(
            email='viceprincipal@demo.com',
            defaults={
                'first_name': 'Mrs. Priya',
                'last_name': 'Sharma',
                'phone': '9876543215',
                'user_type': 'TEACHER',
                'is_active': True,
                'password': make_password('VicePrincipal@123')
            }
        )
        if created:
            self.StaffMember.objects.create(
                user=vp_user,
                employee_id='EMP002',
                first_name='Mrs. Priya',
                last_name='Sharma',
                designation='VICE_PRINCIPAL',
                employment_type='PERMANENT',
                joining_date=date(2018, 6, 1),
                date_of_birth=date(1975, 8, 20),
                gender='F',
                phone_number='9876543215',
                email='viceprincipal@demo.com',
                qualification='M.Ed.',
                emergency_contact_name='Mr. Sharma',
                emergency_contact_number='9876543216',
                emergency_contact_relation='Spouse',
                current_address_line1='VP Quarters',
                current_city='Mumbai',
                current_state='Maharashtra',
                current_pincode='400001',
                permanent_address_line1='VP Quarters',
                permanent_city='Mumbai',
                permanent_state='Maharashtra',
                permanent_pincode='400001',
            )
        self.credentials.append(('Vice Principal', 'viceprincipal@demo.com', 'VicePrincipal@123'))

        # Class Teachers (one for demo)
        teacher_names = [
            ('Amit', 'Verma', 'M'), ('Sneha', 'Patel', 'F'), ('Rahul', 'Singh', 'M'),
            ('Kavita', 'Desai', 'F'), ('Vikram', 'Reddy', 'M'), ('Anjali', 'Mehta', 'F'),
            ('Suresh', 'Nair', 'M'), ('Pooja', 'Gupta', 'F'), ('Manoj', 'Joshi', 'M'),
            ('Deepa', 'Iyer', 'F'), ('Arun', 'Pillai', 'M'), ('Meera', 'Rao', 'F'),
        ]

        for idx, (first, last, gender) in enumerate(teacher_names):
            teacher_user, created = self.User.objects.get_or_create(
                email=f'teacher{idx+1}@demo.com',
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'phone': f'98765432{20+idx}',
                    'user_type': 'TEACHER',
                    'is_active': True,
                    'password': make_password('Teacher@123')
                }
            )
            if created:
                teacher = self.StaffMember.objects.create(
                    user=teacher_user,
                    employee_id=f'EMP{10+idx:03d}',
                    first_name=first,
                    last_name=last,
                    designation='TEACHER',
                    employment_type='PERMANENT',
                    joining_date=date(2020 + (idx % 4), 1, 1),
                    date_of_birth=date(1985 + idx, 1, 15),
                    gender=gender,
                    phone_number=f'98765432{20+idx}',
                    email=f'teacher{idx+1}@demo.com',
                    qualification='B.Ed.',
                    emergency_contact_name=f'{last} Family',
                    emergency_contact_number=f'98765432{40+idx}',
                    emergency_contact_relation='Family',
                    current_address_line1=f'Teacher Quarters {idx+1}',
                    current_city='Mumbai',
                    current_state='Maharashtra',
                    current_pincode='400002',
                    permanent_address_line1=f'Teacher Quarters {idx+1}',
                    permanent_city='Mumbai',
                    permanent_state='Maharashtra',
                    permanent_pincode='400002',
                )
                self.teachers.append(teacher)

        self.credentials.append(('Teacher (Sample)', 'teacher1@demo.com', 'Teacher@123'))
        self.stdout.write(self.style.SUCCESS(f'   Created {len(self.teachers) + 2} teaching staff'))

    def _setup_support_staff(self):
        """Create non-teaching support staff"""
        self.stdout.write('\n Step 7: Creating support staff...')

        support_staff = [
            ('librarian@demo.com', 'Lakshmi', 'Nair', 'LIBRARIAN', 'Librarian@123', 'EMP040'),
            ('transport@demo.com', 'Sunil', 'Patil', 'TRANSPORT_MANAGER', 'Transport@123', 'EMP041'),
            ('sports@demo.com', 'Coach Ravi', 'Kumar', 'TEACHER', 'Sports@123', 'EMP042'),
        ]

        for email, first, last, user_type, password, emp_id in support_staff:
            user, created = self.User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'phone': f'987654{random.randint(1000, 9999)}',
                    'user_type': user_type,
                    'is_active': True,
                    'password': make_password(password)
                }
            )
            if created:
                designation = 'LIBRARIAN' if 'librarian' in email else (
                    'TRANSPORT_INCHARGE' if 'transport' in email else 'SPORTS_COACH'
                )
                self.StaffMember.objects.create(
                    user=user,
                    employee_id=emp_id,
                    first_name=first,
                    last_name=last,
                    designation=designation,
                    employment_type='PERMANENT',
                    joining_date=date(2021, 1, 1),
                    date_of_birth=date(1982, 6, 15),
                    gender='M' if 'Ravi' in first or 'Sunil' in first else 'F',
                    phone_number=user.phone,
                    email=email,
                    emergency_contact_name='Family',
                    emergency_contact_number=f'987654{random.randint(1000, 9999)}',
                    emergency_contact_relation='Family',
                    current_address_line1='Staff Quarters',
                    current_city='Mumbai',
                    current_state='Maharashtra',
                    current_pincode='400003',
                    permanent_address_line1='Staff Quarters',
                    permanent_city='Mumbai',
                    permanent_state='Maharashtra',
                    permanent_pincode='400003',
                )
            self.credentials.append((user_type.replace('_', ' ').title(), email, password))

        self.stdout.write(self.style.SUCCESS(f'   Created {len(support_staff)} support staff'))

    def _setup_students_and_parents(self):
        """Create students and their parent accounts"""
        self.stdout.write('\n Step 8: Creating students and parents...')

        first_names_m = ['Aarav', 'Arjun', 'Vihaan', 'Aditya', 'Reyansh', 'Kabir', 'Shaurya',
                        'Ayaan', 'Krishna', 'Rudra', 'Atharv', 'Vivaan', 'Dhruv', 'Aryan']
        first_names_f = ['Diya', 'Ananya', 'Isha', 'Saanvi', 'Myra', 'Aanya', 'Navya',
                        'Kiara', 'Avni', 'Zara', 'Riya', 'Pari', 'Aisha', 'Priya']
        last_names = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Desai', 'Mehta',
                     'Gupta', 'Joshi', 'Nair', 'Iyer', 'Rao', 'Pillai', 'Shah', 'Verma']

        self.students = []
        student_count = 0

        # Create students for first 3 sections only (Class 1-A, 1-B, 1-C) for demo
        demo_sections = self.sections[:3]

        for section in demo_sections:
            for i in range(self.students_per_section):
                gender = random.choice(['M', 'F'])
                first_name = random.choice(first_names_m if gender == 'M' else first_names_f)
                last_name = random.choice(last_names)
                student_count += 1

                # Create student user
                student_user, created = self.User.objects.get_or_create(
                    email=f'student{student_count}@demo.com',
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name,
                        'phone': '',
                        'user_type': 'STUDENT',
                        'is_active': True,
                        'password': make_password('Student@123')
                    }
                )

                if created:
                    # Create student record
                    student = self.Student.objects.create(
                        user=student_user,
                        first_name=first_name,
                        last_name=last_name,
                        admission_number=f'DEMO2026{student_count:04d}',
                        admission_date=date(2025, 4, 1),
                        admission_status='ACTIVE',
                        gender=gender,
                        date_of_birth=date(2015, random.randint(1, 12), random.randint(1, 28)),
                        blood_group=random.choice(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-']),
                        emergency_contact_number=f'98765{random.randint(10000, 99999)}',
                        email=f'student{student_count}@demo.com',
                        current_address_line1=f'{student_count}, Student Colony',
                        current_city='Mumbai',
                        current_state='Maharashtra',
                        current_pincode='400010',
                        permanent_address_line1=f'{student_count}, Student Colony',
                        permanent_city='Mumbai',
                        permanent_state='Maharashtra',
                        permanent_pincode='400010',
                        father_name=f'Mr. {last_name}',
                        father_phone=f'98765{random.randint(10000, 99999)}',
                        mother_name=f'Mrs. {last_name}',
                        mother_phone=f'98765{random.randint(10000, 99999)}',
                        category=random.choice(['GENERAL', 'OBC', 'SC', 'ST']),
                        religion=random.choice(['HINDU', 'MUSLIM', 'CHRISTIAN', 'SIKH', 'OTHER'])
                    )

                    # Create enrollment
                    self.StudentEnrollment.objects.create(
                        student=student,
                        section=section,
                        academic_year=self.academic_year,
                        enrollment_date=date(2025, 4, 1),
                        roll_number=i + 1,
                        enrollment_status='ENROLLED',
                        is_active=True
                    )

                    # Create parent
                    parent_user, parent_created = self.User.objects.get_or_create(
                        email=f'parent{student_count}@demo.com',
                        defaults={
                            'first_name': f'{last_name}',
                            'last_name': 'Parent',
                            'phone': f'98765{random.randint(10000, 99999)}',
                            'user_type': 'PARENT',
                            'is_active': True,
                            'password': make_password('Parent@123')
                        }
                    )

                    if parent_created:
                        self.StudentParent.objects.create(
                            student=student,
                            parent=parent_user,
                            relation='FATHER',
                            is_primary_contact=True,
                            is_emergency_contact=True
                        )

                    self.students.append(student)

        self.credentials.append(('Student (Sample)', 'student1@demo.com', 'Student@123'))
        self.credentials.append(('Parent (Sample)', 'parent1@demo.com', 'Parent@123'))
        self.stdout.write(self.style.SUCCESS(f'   Created {len(self.students)} students with parents'))

    def _assign_class_teachers(self):
        """Assign teachers as class teachers to sections"""
        self.stdout.write('\n Step 9: Assigning class teachers...')

        for idx, section in enumerate(self.sections[:len(self.teachers)]):
            if idx < len(self.teachers):
                section.class_teacher = self.teachers[idx]
                section.save()

        self.stdout.write(self.style.SUCCESS(f'   Assigned {min(len(self.teachers), len(self.sections))} class teachers'))

    def _setup_fee_structure(self):
        """Create fee categories and structures"""
        self.stdout.write('\n Step 10: Setting up fee structure...')

        # Fee Categories
        categories = [
            ('TUI', 'Tuition Fee', 'Monthly tuition charges', True),
            ('ADM', 'Admission Fee', 'One-time admission fee', True),
            ('EXM', 'Examination Fee', 'Annual examination charges', True),
            ('LIB', 'Library Fee', 'Library access and books', False),
            ('TRN', 'Transport Fee', 'School bus service', False),
            ('LAB', 'Lab Fee', 'Science lab usage', False),
            ('SPT', 'Sports Fee', 'Sports facilities', False),
            ('COM', 'Computer Fee', 'Computer lab usage', False),
        ]

        self.fee_categories = []
        for code, name, desc, mandatory in categories:
            cat, _ = self.FeeCategory.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'description': desc,
                    'is_mandatory': mandatory,
                    'is_active': True
                }
            )
            self.fee_categories.append(cat)

        # Fee Structures for first class only (demo)
        amounts = {
            'TUI': Decimal('3000.00'),
            'ADM': Decimal('5000.00'),
            'EXM': Decimal('1500.00'),
            'LIB': Decimal('500.00'),
            'TRN': Decimal('1500.00'),
            'LAB': Decimal('800.00'),
            'SPT': Decimal('600.00'),
            'COM': Decimal('700.00'),
        }

        for cat in self.fee_categories:
            self.FeeStructure.objects.get_or_create(
                academic_year=self.academic_year,
                class_obj=self.classes[0],  # Class 1
                fee_category=cat,
                defaults={
                    'amount': amounts.get(cat.code, Decimal('500.00')),
                    'frequency': 'MONTHLY' if cat.code == 'TUI' else 'ANNUALLY',
                    'due_day': 10,
                    'late_fee': Decimal('50.00') if cat.is_mandatory else Decimal('0'),
                    'is_active': True
                }
            )

        self.stdout.write(self.style.SUCCESS(f'   Created {len(self.fee_categories)} fee categories'))
        self.stdout.write(f'   Created fee structures for Class 1')

    def _setup_sample_fees_and_payments(self):
        """Create sample student fees and payments"""
        self.stdout.write('\n Step 11: Creating sample fees and payments...')

        fee_structures = self.FeeStructure.objects.filter(
            academic_year=self.academic_year,
            class_obj=self.classes[0]
        )

        payment_count = 0
        for student in self.students[:5]:  # Only first 5 students
            for fs in fee_structures[:3]:  # Only first 3 fee types
                student_fee, created = self.StudentFee.objects.get_or_create(
                    student=student,
                    fee_structure=fs,
                    academic_year=self.academic_year,
                    defaults={
                        'amount': fs.amount,
                        'discount_amount': Decimal('0'),
                        'final_amount': fs.amount,
                        'due_date': date(2025, 4, 10),
                        'status': 'PAID' if random.random() > 0.3 else 'PENDING',
                        'paid_amount': fs.amount if random.random() > 0.3 else Decimal('0'),
                    }
                )

                if created and student_fee.status == 'PAID':
                    payment = self.Payment.objects.create(
                        student=student,
                        receipt_number=f'RCP{payment_count+1:06d}',
                        amount=fs.amount,
                        payment_method=random.choice(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']),
                        payment_date=date(2025, 4, random.randint(5, 10)),
                        status='COMPLETED',
                        remarks='Demo payment'
                    )
                    self.PaymentAllocation.objects.create(
                        payment=payment,
                        student_fee=student_fee,
                        allocated_amount=fs.amount
                    )
                    payment_count += 1

        self.stdout.write(self.style.SUCCESS(f'   Created sample fees and {payment_count} payments'))

    def _setup_attendance_data(self):
        """Create sample attendance records"""
        self.stdout.write('\n Step 12: Creating sample attendance data...')

        # Holidays
        holidays = [
            ('Republic Day', date(2026, 1, 26), 'NATIONAL'),
            ('Holi', date(2025, 3, 14), 'REGIONAL'),
            ('Independence Day', date(2025, 8, 15), 'NATIONAL'),
            ('Gandhi Jayanti', date(2025, 10, 2), 'NATIONAL'),
            ('Diwali', date(2025, 10, 20), 'REGIONAL'),
            ('Christmas', date(2025, 12, 25), 'NATIONAL'),
        ]

        for name, hdate, htype in holidays:
            self.Holiday.objects.get_or_create(
                name=name,
                date=hdate,
                defaults={
                    'holiday_type': htype,
                    'academic_year': self.academic_year,
                    'description': f'{name} holiday'
                }
            )

        # Sample attendance for last 5 working days
        today = date.today()
        for day_offset in range(5):
            attendance_date = today - timedelta(days=day_offset + 1)
            if attendance_date.weekday() < 6:  # Mon-Sat
                for student in self.students[:10]:
                    status = random.choices(
                        ['PRESENT', 'ABSENT', 'LATE'],
                        weights=[0.85, 0.1, 0.05]
                    )[0]

                    self.StudentAttendance.objects.get_or_create(
                        student=student,
                        date=attendance_date,
                        defaults={
                            'status': status,
                            'check_in_time': time(8, 30) if status == 'PRESENT' else (
                                time(9, 45) if status == 'LATE' else None
                            ),
                            'remarks': 'Auto-generated demo data'
                        }
                    )

        self.stdout.write(self.style.SUCCESS(f'   Created holidays and attendance records'))

    def _setup_exam_structure(self):
        """Create exam types, grade scales, and examinations"""
        self.stdout.write('\n Step 13: Setting up examination structure...')

        # Grade Scale
        grade_scale, _ = self.GradeScale.objects.get_or_create(
            name='CBSE Standard',
            defaults={
                'board': self.board,
                'academic_year': self.academic_year,
                'is_active': True
            }
        )

        # Grades
        grades_data = [
            ('A1', 91, 100, 10.0, 'Outstanding'),
            ('A2', 81, 90, 9.0, 'Excellent'),
            ('B1', 71, 80, 8.0, 'Very Good'),
            ('B2', 61, 70, 7.0, 'Good'),
            ('C1', 51, 60, 6.0, 'Average'),
            ('C2', 41, 50, 5.0, 'Below Average'),
            ('D', 33, 40, 4.0, 'Pass'),
            ('E', 0, 32, 0.0, 'Fail'),
        ]

        for name, min_marks, max_marks, points, desc in grades_data:
            self.Grade.objects.get_or_create(
                grade_scale=grade_scale,
                grade_name=name,
                defaults={
                    'min_percentage': min_marks,
                    'max_percentage': max_marks,
                    'grade_points': Decimal(str(points)),
                    'description': desc
                }
            )

        # Exam Types
        exam_types_data = [
            ('FA1', 'Formative Assessment 1', 'FORMATIVE', 20),
            ('FA2', 'Formative Assessment 2', 'FORMATIVE', 20),
            ('SA1', 'Summative Assessment 1', 'SUMMATIVE', 80),
            ('FA3', 'Formative Assessment 3', 'FORMATIVE', 20),
            ('FA4', 'Formative Assessment 4', 'FORMATIVE', 20),
            ('SA2', 'Summative Assessment 2', 'SUMMATIVE', 80),
        ]

        self.exam_types = []
        for code, name, etype, weightage in exam_types_data:
            et, _ = self.ExamType.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'exam_type': etype,
                    'weightage': weightage,
                    'board': self.board,
                    'is_active': True
                }
            )
            self.exam_types.append(et)

        # Create one examination (FA1)
        self.examination, _ = self.Examination.objects.get_or_create(
            name='FA1 - April 2025',
            exam_type=self.exam_types[0],
            academic_year=self.academic_year,
            defaults={
                'start_date': date(2025, 4, 15),
                'end_date': date(2025, 4, 20),
                'status': 'COMPLETED',
                'description': 'First Formative Assessment'
            }
        )
        self.examination.classes.set([self.classes[0]])  # Class 1 only

        # Create exam schedules
        core_subjects = [s for s in self.subjects if s.code in ['ENG', 'HIN', 'MAT', 'EVS']]
        for idx, subject in enumerate(core_subjects):
            self.ExamSchedule.objects.get_or_create(
                examination=self.examination,
                subject=subject,
                class_obj=self.classes[0],
                defaults={
                    'exam_date': date(2025, 4, 15 + idx),
                    'start_time': time(9, 0),
                    'end_time': time(11, 0),
                    'max_marks': 20,
                    'passing_marks': 7,
                    'room_number': '1A'
                }
            )

        self.stdout.write(self.style.SUCCESS(f'   Created grade scale, exam types, and examination'))

    def _setup_sample_marks(self):
        """Create sample marks for students"""
        self.stdout.write('\n Step 14: Creating sample marks...')

        exam_schedules = self.ExamSchedule.objects.filter(examination=self.examination)
        marks_count = 0

        for student in self.students[:10]:
            for schedule in exam_schedules:
                marks = random.randint(8, 20)  # 8-20 out of 20
                self.StudentMark.objects.get_or_create(
                    student=student,
                    exam_schedule=schedule,
                    defaults={
                        'theory_marks': Decimal(str(marks)),
                        'practical_marks': Decimal('0'),
                        'total_marks': Decimal(str(marks)),
                        'is_absent': False,
                        'remarks': 'Auto-generated'
                    }
                )
                marks_count += 1

        self.stdout.write(self.style.SUCCESS(f'   Created {marks_count} mark entries'))

    def _setup_library(self):
        """Create library catalog"""
        self.stdout.write('\n Step 15: Setting up library...')

        # Categories
        categories_data = ['Fiction', 'Non-Fiction', 'Science', 'Mathematics',
                          'History', 'Geography', 'Language', 'Reference']
        categories = []
        for name in categories_data:
            cat, _ = self.Category.objects.get_or_create(
                name=name,
                defaults={'description': f'{name} books'}
            )
            categories.append(cat)

        # Authors
        authors_data = ['R.K. Narayan', 'Rabindranath Tagore', 'Premchand',
                       'Ruskin Bond', 'Sudha Murthy', 'APJ Abdul Kalam']
        authors = []
        for name in authors_data:
            parts = name.split()
            author, _ = self.Author.objects.get_or_create(
                first_name=parts[0],
                last_name=' '.join(parts[1:]) if len(parts) > 1 else '',
            )
            authors.append(author)

        # Books
        books_data = [
            ('Malgudi Days', 'ISBN001', categories[0], authors[0], 10),
            ('Gitanjali', 'ISBN002', categories[0], authors[1], 5),
            ('Godan', 'ISBN003', categories[0], authors[2], 8),
            ('The Blue Umbrella', 'ISBN004', categories[0], authors[3], 12),
            ('Wise and Otherwise', 'ISBN005', categories[1], authors[4], 7),
            ('Wings of Fire', 'ISBN006', categories[1], authors[5], 15),
            ('NCERT Science 6', 'ISBN007', categories[2], None, 50),
            ('NCERT Maths 6', 'ISBN008', categories[3], None, 50),
        ]

        for title, isbn, category, author, copies in books_data:
            book, _ = self.Book.objects.get_or_create(
                isbn=isbn,
                defaults={
                    'title': title,
                    'category': category,
                    'author': author,
                    'total_copies': copies,
                    'available_copies': copies,
                    'publication_year': random.randint(2015, 2024),
                }
            )

        self.stdout.write(self.style.SUCCESS(f'   Created {len(categories_data)} categories, '
                                            f'{len(authors_data)} authors, {len(books_data)} books'))

    def _setup_transport(self):
        """Create transport routes and vehicles"""
        self.stdout.write('\n Step 16: Setting up transport...')

        # Vehicles
        vehicles_data = [
            ('MH01AB1234', 'School Bus 1', 'BUS', 40),
            ('MH01CD5678', 'School Bus 2', 'BUS', 40),
            ('MH01EF9012', 'Mini Bus', 'MINI_BUS', 20),
        ]

        vehicles = []
        for reg, name, vtype, capacity in vehicles_data:
            vehicle, _ = self.Vehicle.objects.get_or_create(
                registration_number=reg,
                defaults={
                    'vehicle_name': name,
                    'vehicle_type': vtype,
                    'seating_capacity': capacity,
                    'is_active': True
                }
            )
            vehicles.append(vehicle)

        # Drivers
        drivers_data = [
            ('Ramesh', 'Kumar', 'DL12345678'),
            ('Suresh', 'Singh', 'DL23456789'),
            ('Mahesh', 'Verma', 'DL34567890'),
        ]

        drivers = []
        for first, last, license_no in drivers_data:
            driver, _ = self.Driver.objects.get_or_create(
                license_number=license_no,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'phone': f'98765{random.randint(10000, 99999)}',
                    'license_expiry': date(2026, 12, 31),
                    'is_active': True
                }
            )
            drivers.append(driver)

        # Routes
        routes_data = [
            ('Route 1 - North Mumbai', vehicles[0], drivers[0]),
            ('Route 2 - South Mumbai', vehicles[1], drivers[1]),
            ('Route 3 - Central Mumbai', vehicles[2], drivers[2]),
        ]

        for name, vehicle, driver in routes_data:
            route, _ = self.Route.objects.get_or_create(
                name=name,
                defaults={
                    'vehicle': vehicle,
                    'driver': driver,
                    'start_time': time(7, 0),
                    'end_time': time(7, 45),
                    'is_active': True
                }
            )

            # Stops
            for i in range(5):
                self.Stop.objects.get_or_create(
                    route=route,
                    name=f'{name} - Stop {i+1}',
                    defaults={
                        'sequence': i + 1,
                        'pickup_time': time(7, i*10),
                        'address': f'Stop {i+1} Address'
                    }
                )

        self.stdout.write(self.style.SUCCESS(f'   Created {len(vehicles_data)} vehicles, '
                                            f'{len(drivers_data)} drivers, {len(routes_data)} routes'))

    def _setup_communication(self):
        """Create notices and events"""
        self.stdout.write('\n Step 17: Setting up communication...')

        # Notices
        notices_data = [
            ('Welcome to New Academic Year', 'Welcome all students and parents to academic year 2025-26!', 'GENERAL'),
            ('Parent-Teacher Meeting', 'PTM scheduled for April 25, 2025. All parents are requested to attend.', 'ACADEMIC'),
            ('Fee Payment Reminder', 'April fees are due by 10th. Please pay on time.', 'FINANCIAL'),
            ('Sports Day Announcement', 'Annual Sports Day on May 15, 2025. Participation is mandatory.', 'EVENT'),
        ]

        admin_user = self.User.objects.get(email='admin@demo.com')
        for title, content, ntype in notices_data:
            self.Notice.objects.get_or_create(
                title=title,
                defaults={
                    'content': content,
                    'notice_type': ntype,
                    'publish_date': date.today(),
                    'expiry_date': date.today() + timedelta(days=30),
                    'is_published': True,
                    'created_by': admin_user
                }
            )

        # Events
        events_data = [
            ('Parent-Teacher Meeting', date(2025, 4, 25), date(2025, 4, 25), 'MEETING'),
            ('Annual Sports Day', date(2025, 5, 15), date(2025, 5, 15), 'SPORTS'),
            ('Science Exhibition', date(2025, 6, 10), date(2025, 6, 11), 'ACADEMIC'),
            ('Annual Day Celebration', date(2025, 12, 15), date(2025, 12, 15), 'CULTURAL'),
        ]

        for title, start, end, etype in events_data:
            self.Event.objects.get_or_create(
                title=title,
                defaults={
                    'description': f'{title} - All are welcome!',
                    'start_date': start,
                    'end_date': end,
                    'event_type': etype,
                    'location': 'School Auditorium',
                    'is_published': True,
                    'created_by': admin_user
                }
            )

        self.stdout.write(self.style.SUCCESS(f'   Created {len(notices_data)} notices and {len(events_data)} events'))

    def _setup_timetable(self):
        """Create sample timetable"""
        self.stdout.write('\n Step 18: Setting up timetable...')

        # Time slots
        slots = [
            ('Period 1', time(8, 0), time(8, 45)),
            ('Period 2', time(8, 45), time(9, 30)),
            ('Period 3', time(9, 30), time(10, 15)),
            ('Break', time(10, 15), time(10, 45)),
            ('Period 4', time(10, 45), time(11, 30)),
            ('Period 5', time(11, 30), time(12, 15)),
            ('Lunch', time(12, 15), time(13, 0)),
            ('Period 6', time(13, 0), time(13, 45)),
            ('Period 7', time(13, 45), time(14, 30)),
        ]

        time_slots = []
        for name, start, end in slots:
            ts, _ = self.TimeSlot.objects.get_or_create(
                name=name,
                defaults={
                    'start_time': start,
                    'end_time': end,
                    'is_break': 'Break' in name or 'Lunch' in name
                }
            )
            time_slots.append(ts)

        self.stdout.write(self.style.SUCCESS(f'   Created {len(time_slots)} time slots'))

    def _print_summary(self):
        """Print credentials summary"""
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS(' DEMO TENANT SETUP COMPLETE!'))
        self.stdout.write('='*70)

        self.stdout.write('\n CREDENTIALS:')
        self.stdout.write('-'*70)
        self.stdout.write(f'{"ROLE":<25} {"EMAIL":<30} {"PASSWORD":<15}')
        self.stdout.write('-'*70)

        for role, email, password in self.credentials:
            self.stdout.write(f'{role:<25} {email:<30} {password:<15}')

        self.stdout.write('\n' + '='*70)
        self.stdout.write(f' School: {self.school.name}')
        self.stdout.write(f' Subdomain: {self.school.subdomain}')
        self.stdout.write(f' Schema: {self.school.schema_name}')
        self.stdout.write(f' Students: {len(self.students)}')
        self.stdout.write(f' Teachers: {len(self.teachers) + 2}')
        self.stdout.write('='*70)
        self.stdout.write('\nYou can now test with these credentials!')
        self.stdout.write('Web: http://demo.localhost:3000')
        self.stdout.write('API: http://localhost:8000/api/v1/')
        self.stdout.write('='*70 + '\n')
