"""
Create sample students directly in Veda schema for testing.
"""

from django.core.management.base import BaseCommand
from django.db import connection
from apps.tenants.models import School
from apps.authentication.models import User
from apps.students.models import Student
from datetime import date


class Command(BaseCommand):
    help = 'Create sample students in Veda schema'

    def handle(self, *args, **options):
        try:
            # Get Veda school
            school = School.objects.get(subdomain='veda')
            self.stdout.write(f"Found school: {school.name}")
            self.stdout.write(f"Schema: {school.schema_name}")
            
            # Switch to tenant schema
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{school.schema_name}"')
            self.stdout.write(self.style.SUCCESS(f'✅ Switched to schema: {school.schema_name}'))
            
            # Create sample students
            students_data = [
                {'first_name': 'Raj', 'last_name': 'Kumar', 'gender': 'M'},
                {'first_name': 'Priya', 'last_name': 'Sharma', 'gender': 'F'},
                {'first_name': 'Amit', 'last_name': 'Patel', 'gender': 'M'},
                {'first_name': 'Sneha', 'last_name': 'Gupta', 'gender': 'F'},
                {'first_name': 'Vikram', 'last_name': 'Singh', 'gender': 'M'},
            ]
            
            created_count = 0
            for idx, data in enumerate(students_data, 1):
                adm_no = f"VV2024{str(idx).zfill(4)}"
                email = f"{adm_no.lower()}@vedavidyalaya.edu.in"
                
                # Check if already exists
                if Student.objects.filter(admission_number=adm_no).exists():
                    self.stdout.write(f"  ⏭️  Skipped {adm_no} (already exists)")
                    continue
                
                try:
                    # Create user in PUBLIC schema
                    with connection.cursor() as cursor:
                        cursor.execute('SET search_path TO "public"')
                    
                    user, user_created = User.objects.get_or_create(
                        email=email,
                        defaults={
                            'first_name': data['first_name'],
                            'last_name': data['last_name'],
                            'phone': f"99{str(idx).zfill(8)}",
                            'user_type': 'STUDENT'
                        }
                    )
                    if user_created:
                        user.set_password('Veda@123')
                        user.save()
                    
                    # Switch back to tenant schema
                    with connection.cursor() as cursor:
                        cursor.execute(f'SET search_path TO "{school.schema_name}"')
                    
                    # Create student
                    student = Student.objects.create(
                        user=user,
                        admission_number=adm_no,
                        first_name=data['first_name'],
                        last_name=data['last_name'],
                        admission_status='ACTIVE',
                        admission_date=date(2024, 4, 1),
                        date_of_birth=date(2015, 1, 1),
                        gender=data['gender'],
                        email=email,
                        emergency_contact_number='9999999999',
                        father_name='Father Name',
                        father_phone='9999999999',
                        mother_name='Mother Name',
                        current_address_line1='Gwalior',
                        current_city='Gwalior',
                        current_state='MP',
                        current_pincode='474001',
                        permanent_address_line1='Gwalior',
                        permanent_city='Gwalior',
                        permanent_state='MP',
                        permanent_pincode='474001'
                    )
                    
                    created_count += 1
                    self.stdout.write(f"  ✓ Created: {data['first_name']} {data['last_name']} ({adm_no})")
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  ❌ Failed to create {adm_no}: {str(e)}"))
            
            # Switch back to public
            with connection.cursor() as cursor:
                cursor.execute('SET search_path TO "public"')
            
            self.stdout.write(f"\n{'='*80}")
            self.stdout.write(self.style.SUCCESS(f'✅ Created {created_count} students in Veda schema!'))
            self.stdout.write(f"Total students in Veda: {Student.objects.count()}")
            self.stdout.write(f"{'='*80}\n")
            
        except School.DoesNotExist:
            self.stdout.write(self.style.ERROR('❌ Veda school not found'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {str(e)}'))
            import traceback
            traceback.print_exc()
