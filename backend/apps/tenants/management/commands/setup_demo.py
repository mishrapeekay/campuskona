"""
Django Management Command to Setup Demo Tenant
"""
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.contrib.auth.hashers import make_password
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Setup comprehensive demo tenant with all user roles'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n' + '='*70))
        self.stdout.write(self.style.SUCCESS(' DEMO TENANT SETUP'))
        self.stdout.write(self.style.SUCCESS('='*70 + '\n'))

        try:
            # Import models
            from apps.tenants.models import School, Subscription
            from apps.authentication.models import User
            from apps.academics.models import AcademicYear, Board, Class, Section, Subject
            from apps.staff.models import StaffMember
            from apps.students.models import Student, StudentParent
            from apps.academics.models import StudentEnrollment

            # Step 1: Create subscription
            self.stdout.write('Step 1: Creating subscription...')
            subscription, _ = Subscription.objects.get_or_create(
                name='Professional Plan',
                defaults={
                    'description': 'Full-featured plan',
                    'max_students': 2000,
                    'max_teachers': 100,
                    'max_staff': 50,
                    'price_monthly': 9999.00,
                    'price_yearly': 99999.00,
                    'currency': 'INR',
                    'is_active': True,
                }
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Subscription: {subscription.name}'))

            # Step 2: Create school
            self.stdout.write('\nStep 2: Creating school...')
            School.objects.filter(subdomain='demo').delete()
            
            school = School.objects.create(
                name='Demo High School',
                code='DEMO2026',
                schema_name='school_demo',
                subdomain='demo',
                email='admin@demohighschool.edu',
                phone='9876543210',
                address='123 Education Street',
                city='Mumbai',
                state='Maharashtra',
                country='India',
                pincode='400001',
                primary_board='CBSE',
                supported_boards=['CBSE'],
                subscription=subscription,
                subscription_start_date=date.today(),
                subscription_end_date=date.today() + timedelta(days=365),
                is_active=True,
                auto_create_schema=True  # Let django-tenants handle schema creation
            )
            self.stdout.write(self.style.SUCCESS(f'✅ School: {school.name} ({school.subdomain})'))

            # Step 3: Create Domain record
            self.stdout.write('\nStep 3: Setting up domain...')
            from apps.tenants.models import Domain
            Domain.objects.get_or_create(
                domain='demo.localhost',
                tenant=school,
                defaults={'is_primary': True}
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Domain created'))

            # Step 3b: Migrate schema
            self.stdout.write('\nStep 3b: Migrating tenant schema...')
            from django.core.management import call_command
            call_command('migrate_schemas', schema_name=school.schema_name, interactive=False, verbosity=1)
            
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{school.schema_name}", public')
            
            connection.schema_name = school.schema_name
            self.stdout.write(self.style.SUCCESS(f'✅ Schema initialized'))

            # Step 4: Create academic structure
            self.stdout.write('\nStep 4: Creating academic structure...')
            
            from apps.academics.models import AcademicYear, Board, Class, Section, Subject
            academic_year, _ = AcademicYear.objects.get_or_create(
                name='2025-2026',
                defaults={
                    'start_date': date(2025, 4, 1),
                    'end_date': date(2026, 3, 31),
                    'is_current': True
                }
            )
            
            board, _ = Board.objects.get_or_create(
                board_code='CBSE',
                defaults={
                    'board_name': 'Central Board of Secondary Education',
                    'board_type': 'CBSE',
                    'is_active': True
                }
            )
            
            # Create classes 1-10
            classes = []
            for i in range(1, 11):
                class_obj, _ = Class.objects.get_or_create(
                    name=f'Class {i}',
                    defaults={
                        'display_name': f'{i}th Standard',
                        'class_order': i,
                        'board': board,
                        'is_active': True
                    }
                )
                classes.append(class_obj)
            
            # Create sections A, B, C for classes 1-5
            sections = []
            for class_obj in classes[:5]:
                for sec_name in ['A', 'B', 'C']:
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
                    sections.append(section)
            
            # Create subjects
            subjects_data = [
                ('ENG', 'English', 'CORE'),
                ('MAT', 'Mathematics', 'CORE'),
                ('SCI', 'Science', 'CORE'),
                ('SST', 'Social Studies', 'CORE'),
                ('HIN', 'Hindi', 'LANGUAGE'),
            ]
            
            for code, name, sub_type in subjects_data:
                Subject.objects.get_or_create(
                    code=code,
                    defaults={
                        'name': name,
                        'subject_type': sub_type,
                        'board': board,
                        'is_active': True
                    }
                )
            
            self.stdout.write(self.style.SUCCESS(f'✅ Academic structure created'))
            self.stdout.write(f'   - Academic Year: {academic_year.name}')
            self.stdout.write(f'   - Classes: {len(classes)}')
            self.stdout.write(f'   - Sections: {len(sections)}')
            self.stdout.write(f'   - Subjects: {len(subjects_data)}')

            # Step 5: Create users
            self.stdout.write('\nStep 5: Creating user accounts...')
            
            credentials = []
            
            # School Admin
            admin_user, _ = User.objects.get_or_create(
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
            credentials.append(('School Admin', 'admin@demo.com', 'Admin@123'))

            # Principal
            principal_user, _ = User.objects.get_or_create(
                email='principal@demo.com',
                defaults={
                    'first_name': 'Dr. Rajesh',
                    'last_name': 'Kumar',
                    'phone': '9876543211',
                    'user_type': 'TEACHER',
                    'is_active': True,
                    'password': make_password('Principal@123')
                }
            )
            
            StaffMember.objects.update_or_create(
                user=principal_user,
                defaults={
                    'employee_id': 'EMP001',
                    'first_name': 'Dr. Rajesh',
                    'last_name': 'Kumar',
                    'designation': 'PRINCIPAL',
                    'employment_type': 'PERMANENT',
                    'joining_date': date(2020, 1, 1),
                    'date_of_birth': date(1975, 5, 15),
                    'gender': 'M',
                    'phone_number': '9876543211',
                    'email': 'principal@demo.com',
                    'emergency_contact_name': 'Mrs. Kumar',
                    'emergency_contact_number': '9876543212',
                    'emergency_contact_relation': 'Spouse',
                    'current_address_line1': 'Principal Residence',
                    'current_city': 'Mumbai',
                    'current_state': 'Maharashtra',
                    'current_pincode': '400001',
                    'permanent_address_line1': 'Principal Residence',
                    'permanent_city': 'Mumbai',
                    'permanent_state': 'Maharashtra',
                    'permanent_pincode': '400001',
                }
            )
            credentials.append(('Principal', 'principal@demo.com', 'Principal@123'))

            # Vice Principal
            vp_user, _ = User.objects.get_or_create(
                email='viceprincipal@demo.com',
                defaults={
                    'first_name': 'Priya',
                    'last_name': 'Sharma',
                    'phone': '9876543215',
                    'user_type': 'TEACHER',
                    'is_active': True,
                    'password': make_password('VicePrincipal@123')
                }
            )
            
            StaffMember.objects.update_or_create(
                user=vp_user,
                defaults={
                    'employee_id': 'EMP015',
                    'first_name': 'Priya',
                    'last_name': 'Sharma',
                    'designation': 'VICE_PRINCIPAL',
                    'employment_type': 'PERMANENT',
                    'joining_date': date(2021, 6, 1),
                    'date_of_birth': date(1980, 8, 20),
                    'gender': 'F',
                    'phone_number': '9876543215',
                    'email': 'viceprincipal@demo.com',
                    'emergency_contact_name': 'Mr. Sharma',
                    'emergency_contact_number': '9876543216',
                    'emergency_contact_relation': 'Spouse',
                    'current_address_line1': 'VP Residence',
                    'current_city': 'Mumbai',
                    'current_state': 'Maharashtra',
                    'current_pincode': '400001',
                    'permanent_address_line1': 'VP Residence',
                    'permanent_city': 'Mumbai',
                    'permanent_state': 'Maharashtra',
                    'permanent_pincode': '400001',
                }
            )
            credentials.append(('Vice Principal', 'viceprincipal@demo.com', 'VicePrincipal@123'))

            # Sports Teacher
            sports_user, _ = User.objects.get_or_create(
                email='sports@demo.com',
                defaults={
                    'first_name': 'Coach',
                    'last_name': 'Ravi',
                    'phone': '9876543218',
                    'user_type': 'TEACHER',
                    'is_active': True,
                    'password': make_password('Sports@123')
                }
            )
            
            StaffMember.objects.update_or_create(
                user=sports_user,
                defaults={
                    'employee_id': 'EMP018',
                    'first_name': 'Coach',
                    'last_name': 'Ravi',
                    'designation': 'SPORTS_COACH',
                    'employment_type': 'PERMANENT',
                    'joining_date': date(2023, 1, 1),
                    'date_of_birth': date(1988, 3, 10),
                    'gender': 'M',
                    'phone_number': '9876543218',
                    'email': 'sports@demo.com',
                    'emergency_contact_name': 'Mrs. Ravi',
                    'emergency_contact_number': '9876543219',
                    'emergency_contact_relation': 'Spouse',
                    'current_address_line1': 'Sports Complex',
                    'current_city': 'Mumbai',
                    'current_state': 'Maharashtra',
                    'current_pincode': '400001',
                    'permanent_address_line1': 'Sports Complex',
                    'permanent_city': 'Mumbai',
                    'permanent_state': 'Maharashtra',
                    'permanent_pincode': '400001',
                }
            )
            credentials.append(('Sports Teacher', 'sports@demo.com', 'Sports@123'))

            # Teacher
            teacher_user, _ = User.objects.get_or_create(
                email='teacher@demo.com',
                defaults={
                    'first_name': 'Amit',
                    'last_name': 'Verma',
                    'phone': '9876543220',
                    'user_type': 'TEACHER',
                    'is_active': True,
                    'password': make_password('Teacher@123')
                }
            )
            
            teacher_staff, _ = StaffMember.objects.update_or_create(
                user=teacher_user,
                defaults={
                    'employee_id': 'EMP002',
                    'first_name': 'Amit',
                    'last_name': 'Verma',
                    'designation': 'TEACHER',
                    'employment_type': 'PERMANENT',
                    'joining_date': date(2022, 1, 1),
                    'date_of_birth': date(1985, 3, 10),
                    'gender': 'M',
                    'phone_number': '9876543220',
                    'email': 'teacher@demo.com',
                    'emergency_contact_name': 'Mrs. Verma',
                    'emergency_contact_number': '9876543221',
                    'emergency_contact_relation': 'Spouse',
                    'current_address_line1': 'Teacher Residence',
                    'current_city': 'Mumbai',
                    'current_state': 'Maharashtra',
                    'current_pincode': '400002',
                    'permanent_address_line1': 'Teacher Residence',
                    'permanent_city': 'Mumbai',
                    'permanent_state': 'Maharashtra',
                    'permanent_pincode': '400002',
                }
            )
            # Assign as class teacher
            if sections:
                sections[0].class_teacher = teacher_staff
                sections[0].save()
            credentials.append(('Teacher', 'teacher@demo.com', 'Teacher@123'))

            # Librarian
            librarian_user, _ = User.objects.get_or_create(
                email='librarian@demo.com',
                defaults={
                    'first_name': 'Lakshmi',
                    'last_name': 'Nair',
                    'phone': '9876543230',
                    'user_type': 'LIBRARIAN',
                    'is_active': True,
                    'password': make_password('Librarian@123')
                }
            )
            
            StaffMember.objects.update_or_create(
                user=librarian_user,
                defaults={
                    'employee_id': 'EMP003',
                    'first_name': 'Lakshmi',
                    'last_name': 'Nair',
                    'designation': 'LIBRARIAN',
                    'employment_type': 'PERMANENT',
                    'joining_date': date(2022, 7, 1),
                    'date_of_birth': date(1982, 11, 5),
                    'gender': 'F',
                    'phone_number': '9876543230',
                    'email': 'librarian@demo.com',
                    'emergency_contact_name': 'Mr. Nair',
                    'emergency_contact_number': '9876543231',
                    'emergency_contact_relation': 'Spouse',
                    'current_address_line1': 'Library Quarters',
                    'current_city': 'Mumbai',
                    'current_state': 'Maharashtra',
                    'current_pincode': '400003',
                    'permanent_address_line1': 'Library Quarters',
                    'permanent_city': 'Mumbai',
                    'permanent_state': 'Maharashtra',
                    'permanent_pincode': '400003',
                }
            )
            credentials.append(('Librarian', 'librarian@demo.com', 'Librarian@123'))

            # Transport
            transport_user, _ = User.objects.get_or_create(
                email='transport@demo.com',
                defaults={
                    'first_name': 'Sunil',
                    'last_name': 'Patil',
                    'phone': '9876543240',
                    'user_type': 'TRANSPORT_MANAGER',
                    'is_active': True,
                    'password': make_password('Transport@123')
                }
            )
            
            StaffMember.objects.update_or_create(
                user=transport_user,
                defaults={
                    'employee_id': 'EMP004',
                    'first_name': 'Sunil',
                    'last_name': 'Patil',
                    'designation': 'TRANSPORT_INCHARGE',
                    'employment_type': 'PERMANENT',
                    'joining_date': date(2023, 4, 1),
                    'date_of_birth': date(1978, 6, 25),
                    'gender': 'M',
                    'phone_number': '9876543240',
                    'email': 'transport@demo.com',
                    'emergency_contact_name': 'Mrs. Patil',
                    'emergency_contact_number': '9876543241',
                    'emergency_contact_relation': 'Spouse',
                    'current_address_line1': 'Transport Office',
                    'current_city': 'Mumbai',
                    'current_state': 'Maharashtra',
                    'current_pincode': '400004',
                    'permanent_address_line1': 'Transport Office',
                    'permanent_city': 'Mumbai',
                    'permanent_state': 'Maharashtra',
                    'permanent_pincode': '400004',
                }
            )
            credentials.append(('Transport', 'transport@demo.com', 'Transport@123'))

            # Student
            student_user, _ = User.objects.get_or_create(
                email='student@demo.com',
                defaults={
                    'first_name': 'Aarav',
                    'last_name': 'Sharma',
                    'phone': '9876543250',
                    'user_type': 'STUDENT',
                    'is_active': True,
                    'password': make_password('Student@123')
                }
            )
            
            student, _ = Student.objects.update_or_create(
                user=student_user,
                defaults={
                    'first_name': 'Aarav',
                    'last_name': 'Sharma',
                    'admission_number': 'DEMO20260001',
                    'admission_date': date(2025, 4, 1),
                    'admission_status': 'ACTIVE',
                    'gender': 'M',
                    'date_of_birth': date(2015, 1, 15),
                    'blood_group': 'A+',
                    'emergency_contact_number': '9876543251',
                    'email': 'student@demo.com',
                    'current_address_line1': 'Student Colony',
                    'current_city': 'Mumbai',
                    'current_state': 'Maharashtra',
                    'current_pincode': '400010',
                    'permanent_address_line1': 'Student Colony',
                    'permanent_city': 'Mumbai',
                    'permanent_state': 'Maharashtra',
                    'permanent_pincode': '400010',
                    'father_name': 'Sharma Father',
                    'father_phone': '9876543252',
                    'mother_name': 'Sharma Mother',
                    'mother_phone': '9876543253',
                    'category': 'GENERAL',
                    'religion': 'HINDU'
                }
            )
            
            # Create enrollment
            if sections:
                StudentEnrollment.objects.get_or_create(
                    student=student,
                    academic_year=academic_year,
                    defaults={
                        'section': sections[0],
                        'enrollment_date': date(2025, 4, 1),
                        'roll_number': 1,
                        'enrollment_status': 'ENROLLED',
                        'is_active': True
                    }
                )
            
            credentials.append(('Student', 'student@demo.com', 'Student@123'))

            # Parent
            parent_user, _ = User.objects.get_or_create(
                email='parent@demo.com',
                defaults={
                    'first_name': 'Sharma',
                    'last_name': 'Parent',
                    'phone': '9876543260',
                    'user_type': 'PARENT',
                    'is_active': True,
                    'password': make_password('Parent@123')
                }
            )
            
            StudentParent.objects.get_or_create(
                student=student,
                parent=parent_user,
                defaults={
                    'relation': 'FATHER',
                    'is_primary_contact': True,
                    'is_emergency_contact': True
                }
            )
            credentials.append(('Parent', 'parent@demo.com', 'Parent@123'))

            self.stdout.write(self.style.SUCCESS(f'✅ Created {len(credentials)} user accounts'))

            # Print credentials
            self.stdout.write('\n' + '='*70)
            self.stdout.write(self.style.SUCCESS(' CREDENTIALS SUMMARY'))
            self.stdout.write('='*70)
            self.stdout.write(f'\n{"ROLE":<20} {"EMAIL":<30} {"PASSWORD":<20}')
            self.stdout.write('-'*70)
            for role, email, password in credentials:
                self.stdout.write(f'{role:<20} {email:<30} {password:<20}')
            
            self.stdout.write('\n' + '='*70)
            self.stdout.write(self.style.SUCCESS(' ✅ DEMO TENANT SETUP COMPLETE!'))
            self.stdout.write('='*70)
            self.stdout.write(f'\nSubdomain: demo')
            self.stdout.write(f'Schema: school_demo')
            self.stdout.write(f'\nYou can now test with these credentials!')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error: {str(e)}'))
            import traceback
            traceback.print_exc()
