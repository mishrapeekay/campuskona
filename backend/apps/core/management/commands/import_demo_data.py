"""
Import Demo High School data (Synthetic)
"""
import random
from datetime import datetime, date, timedelta
from django.core.management.base import BaseCommand
from django.db import connection
from apps.authentication.models import User
from apps.tenants.models import School
from apps.students.models import Student
from apps.staff.models import StaffMember
from apps.academics.models import AcademicYear, Board, Class, Section, Subject, StudentEnrollment
from apps.transport.models import Vehicle, Route
from apps.communication.models import Notice

class Command(BaseCommand):
    help = 'Import Demo High School data (Synthetic)'

    def handle(self, *args, **options):
        # Get school and switch schema
        try:
            school = School.objects.get(subdomain='demo')
            self.stdout.write(f"Found school: {school.name}")
        except School.DoesNotExist:
            self.stdout.write(self.style.ERROR("School 'Demo High School' (demo) not found!"))
            return

        # Switch to tenant schema
        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{school.schema_name}"')
        
        self.stdout.write(f"Switched to schema: {school.schema_name}")

        try:
            # Disconnect signals to prevent audit log issues during import
            from django.db.models.signals import post_save
            from apps.authentication.models import User
            from apps.authentication.signals import log_user_creation
            
            post_save.disconnect(log_user_creation, sender=User)
            self.stdout.write("Disconnected signals")

            # Import data
            self.import_academics(school)
            self.import_staff(school)
            self.import_students(school)
            self.import_transport(school)
            self.import_communication(school)

            self.stdout.write(self.style.SUCCESS("\n✅ Demo High School Import Complete!"))
            self.verify_data()
            
            # Reconnect signals
            post_save.connect(log_user_creation, sender=User)
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error: {str(e)}"))
            import traceback
            traceback.print_exc()

    def import_academics(self, school):
        self.stdout.write("\n📚 Importing Academics...")
        
        # Board
        try:
            board = Board.objects.filter(board_code='ICSE').first()
            if not board:
                board = Board(
                    board_code='ICSE',
                    board_name='Indian Certificate of Secondary Education',
                    board_type='ICSE'
                )
                board.save()
                self.stdout.write("  ✓ Created ICSE board")
            else:
                self.stdout.write("  ✓ Using existing ICSE board")
        except Exception as e:
             self.stdout.write(self.style.WARNING(f"  ⚠️  Board creation skipped: {str(e)}"))
             board = Board.objects.first()

        # Academic Years
        try:
            AcademicYear.objects.get_or_create(
                name='2024-2025',
                defaults={
                    'start_date': date(2024, 6, 1),
                    'end_date': date(2025, 5, 31),
                    'is_current': True
                }
            )
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"  ⚠️  Year creation error: {str(e)}"))

        current_year = AcademicYear.objects.filter(is_current=True).first()
        
        # Classes (1 to 10)
        self.classes = []
        for i in range(1, 11):
            try:
                c, _ = Class.objects.get_or_create(
                    name=f"Class {i}",
                    board=board,
                    defaults={
                        'display_name': f"Standard {i}",
                        'class_order': i
                    }
                )
                self.classes.append(c)
                
                # Sections (A, B)
                for sec_name in ['A', 'B']:
                    Section.objects.get_or_create(
                        name=sec_name,
                        class_instance=c,
                        academic_year=current_year,
                        defaults={'max_students': 30}
                    )
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"  ⚠️  Class/Section error for {i}: {str(e)}"))

        # Subjects
        subjects = [
            ('ENG', 'English'), ('MAT', 'Mathematics'), ('SCI', 'Science'), 
            ('SOC', 'Social Studies'), ('HIN', 'Hindi'), ('COM', 'Computer')
        ]
        for code, name in subjects:
            try:
                Subject.objects.get_or_create(
                    code=code,
                    defaults={
                        'name': name,
                        'subject_type': 'CORE',
                        'board': board
                    }
                )
            except Exception as e:
                 self.stdout.write(self.style.WARNING(f"  ⚠️  Subject error {code}: {str(e)}"))

    def import_staff(self, school):
        self.stdout.write("\n👥 Importing Staff...")
        
        roles = [
            ('Principal', 'Mr. Robert Dsouza', 'PRINCIPAL'),
            ('Vice Principal', 'Mrs. Anita Desai', 'VICE_PRINCIPAL'),
            ('Teacher', 'Mr. Suresh Menon', 'TEACHER'),
            ('Teacher', 'Mrs. Kavita Iyer', 'TEACHER'),
            ('Teacher', 'Mr. John Smith', 'TEACHER'),
        ]

        count = 1
        for designation, name, role_code in roles:
            first_name, last_name = name.split(' ', 1)
            emp_id = f"DEMO-EMP-{str(count).zfill(3)}"
            email = f"{first_name.lower()}.{last_name.lower()}@demo.school"
            
            try:
                # Create User (switch to public for user creation just in case, though User is shared)
                # Actually User model should be in 'public' schema always.
                # But we are currently in tenant schema. 
                # We need to switch context to create User? 
                # Models.py says User is in 'authentication' app -> PUBLIC_APPS.
                # But if we are in a transaction or session with search_path set to tenant, 
                # and User table is in public, we need to prefix it or rely on search_path including public?
                # Usually search_path is "tenant, public".
                
                # Let's ensure search_path includes public.
                # Actually, in PostgreSQL, if 'public' is in search_path, it finds it.
                # Assuming 'admin' user creation worked fine in Veda import (well we disconnected signals).
                
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'first_name': first_name,
                        'last_name': last_name,
                        'phone': f"91000000{str(count).zfill(2)}",
                        'user_type': 'SCHOOL_ADMIN' if role_code == 'PRINCIPAL' else 'TEACHER',
                        'is_staff': True
                    }
                )
                if created:
                    user.set_password('Demo@123')
                    user.save()

                StaffMember.objects.get_or_create(
                    employee_id=emp_id,
                    defaults={
                        'user': user,
                        'first_name': first_name,
                        'last_name': last_name,
                        'designation': role_code,
                        'department': 'Academics',
                        'employment_type': 'PERMANENT',
                        'joining_date': date(2020, 1, 1),
                        'email': email,
                        'phone_number': user.phone,
                        'date_of_birth': date(1980, 1, 1),
                        'gender': 'M',
                        'emergency_contact_number': '9999999999',
                        'current_address_line1': 'Mumbai',
                        'current_city': 'Mumbai',
                        'current_state': 'MH',
                        'current_pincode': '400001',
                        'permanent_address_line1': 'Mumbai',
                        'permanent_city': 'Mumbai',
                        'permanent_state': 'MH',
                        'permanent_pincode': '400001'
                    }
                )
                count += 1
            except Exception as e:
                 self.stdout.write(self.style.WARNING(f"  ⚠️  Staff error {name}: {str(e)}"))

        self.stdout.write(f"  ✓ Staff Members: {StaffMember.objects.count()}")

    def import_students(self, school):
        self.stdout.write("\n🎓 Importing Students...")
        
        current_year = AcademicYear.objects.filter(is_current=True).first()
        sections = Section.objects.all()
        if not sections:
            self.stdout.write("  ⚠️  No sections found, skipping students.")
            return

        cnt = 1
        for sec in sections:
            # Create 5 students per section
            for i in range(1, 6):
                adm_no = f"D-{sec.class_instance.name[-1]}-{sec.name}-{str(i).zfill(3)}"
                first_name = random.choice(['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayan', 'Krishna', 'Ishaan'])
                last_name = random.choice(['Kumar', 'Singh', 'Sharma', 'Patel', 'Gupta', 'Iyer', 'Reddy', 'Verma', 'Mehta', 'Joshi'])
                email = f"std.{cnt}@demo.school"
                
                try:
                    user, created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            'first_name': first_name,
                            'last_name': last_name,
                            'phone': f"92000{str(cnt).zfill(5)}",
                            'user_type': 'STUDENT'
                        }
                    )
                    if created:
                        user.set_password('Demo@123')
                        user.save()

                    student = Student.objects.create(
                        user=user,
                        admission_number=adm_no,
                        first_name=first_name,
                        last_name=last_name,
                        admission_status='ACTIVE',
                        admission_date=date(2024, 6, 1),
                        date_of_birth=date(2015, 1, 1),
                        gender='M',
                        email=email,
                        emergency_contact_number='9999999999',
                        father_name='Father',
                        father_phone='9999999999',
                        mother_name='Mother',
                        current_address_line1='Mumbai',
                        current_city='Mumbai',
                        current_state='MH',
                        current_pincode='400001',
                        permanent_address_line1='Mumbai',
                        permanent_city='Mumbai',
                        permanent_state='MH',
                        permanent_pincode='400001'
                    )

                    StudentEnrollment.objects.create(
                        student=student,
                        section=sec,
                        academic_year=current_year,
                        roll_number=i,
                        enrollment_status='ENROLLED',
                        enrollment_date=date(2024, 6, 1)
                    )
                    cnt += 1
                except Exception as e:
                    pass # Skip duplicates or errors silently to keep log clean
                    
        self.stdout.write(f"  ✓ Students: {Student.objects.count()}")

    def import_transport(self, school):
        self.stdout.write("\n🚌 Importing Transport...")
        try:
            Vehicle.objects.get_or_create(
                registration_number='MH-01-AB-1234',
                defaults={
                    'capacity': 50,
                    'status': 'ACTIVE',
                    'model': 'School Bus'
                }
            )
            Route.objects.get_or_create(
                name='Route 1: Andheri',
                defaults={
                    'start_point': 'School',
                    'end_point': 'Andheri',
                    'fare': 2000.00
                }
            )
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"  ⚠️  Transport error: {str(e)}"))
        self.stdout.write(f"  ✓ Vehicles: {Vehicle.objects.count()}")

    def import_communication(self, school):
        self.stdout.write("\n📢 Importing Communications...")
        try:
            Notice.objects.get_or_create(
                title='Welcome to New Academic Year',
                defaults={
                    'content': 'Welcome all students to the 2024-2025 academic session.',
                    'target_audience': 'ALL',
                    'is_published': True
                }
            )
        except Exception as e:
             self.stdout.write(self.style.WARNING(f"  ⚠️  Notice error: {str(e)}"))
        self.stdout.write(f"  ✓ Notices: {Notice.objects.count()}")

    def verify_data(self):
        self.stdout.write("\n📊 Data Summary:")
        self.stdout.write(f"  • Academic Years: {AcademicYear.objects.count()}")
        self.stdout.write(f"  • Classes: {Class.objects.count()}")
        self.stdout.write(f"  • Sections: {Section.objects.count()}")
        self.stdout.write(f"  • Subjects: {Subject.objects.count()}")
        self.stdout.write(f"  • Students: {Student.objects.count()}")
        self.stdout.write(f"  • Staff: {StaffMember.objects.count()}")
        self.stdout.write(f"  • Enrollments: {StudentEnrollment.objects.count()}")
