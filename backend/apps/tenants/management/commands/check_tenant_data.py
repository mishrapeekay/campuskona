"""
Management command to check tenant schema and data.
"""

from django.core.management.base import BaseCommand
from django.db import connection
from apps.tenants.models import School


class Command(BaseCommand):
    help = 'Check tenant schema and data'

    def add_arguments(self, parser):
        parser.add_argument(
            'subdomain',
            type=str,
            help='Tenant subdomain (e.g., demo, veda)'
        )

    def handle(self, *args, **options):
        subdomain = options['subdomain']
        
        try:
            # Get tenant
            tenant = School.objects.get(subdomain=subdomain)
            self.stdout.write(f"\n{'='*80}")
            self.stdout.write(f"Tenant: {tenant.name}")
            self.stdout.write(f"Subdomain: {tenant.subdomain}")
            self.stdout.write(f"Schema: {tenant.schema_name}")
            self.stdout.write(f"{'='*80}\n")
            
            if connection.vendor == 'postgresql':
                # Check if schema exists
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT schema_name 
                        FROM information_schema.schemata 
                        WHERE schema_name = %s
                    """, [tenant.schema_name])
                    schema_exists = cursor.fetchone()
                    
                    if schema_exists:
                        self.stdout.write(self.style.SUCCESS(f'✅ Schema exists: {tenant.schema_name}'))
                    else:
                        self.stdout.write(self.style.ERROR(f'❌ Schema does NOT exist: {tenant.schema_name}'))
                        return
                
                # Switch to tenant schema
                with connection.cursor() as cursor:
                    cursor.execute(f'SET search_path TO "{tenant.schema_name}"')
                
                # Check for students table
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT COUNT(*) 
                        FROM information_schema.tables 
                        WHERE table_schema = %s AND table_name = 'students'
                    """, [tenant.schema_name])
                    table_exists = cursor.fetchone()[0]
                    
                    if table_exists:
                        self.stdout.write(self.style.SUCCESS('✅ Students table exists'))
                    else:
                        self.stdout.write(self.style.ERROR('❌ Students table does NOT exist'))
                        return
                
                # Count students
                with connection.cursor() as cursor:
                    cursor.execute('SELECT COUNT(*) FROM students')
                    count = cursor.fetchone()[0]
                    self.stdout.write(f"\n📊 Student count: {count}")
                    
                    if count > 0:
                        # Show sample
                        cursor.execute('SELECT id, first_name, last_name, admission_number FROM students LIMIT 5')
                        students = cursor.fetchall()
                        self.stdout.write(f"\n📝 Sample students:")
                        for student in students:
                            self.stdout.write(f"  - {student[1]} {student[2]} ({student[3]})")
                    else:
                        self.stdout.write(self.style.WARNING('\n⚠️  No students found in schema'))
                
                # Switch back to public
                with connection.cursor() as cursor:
                    cursor.execute('SET search_path TO "public"')
                
                self.stdout.write(f"\n{'='*80}\n")
                
            else:
                self.stdout.write(self.style.ERROR('❌ This command only works with PostgreSQL'))
                
        except School.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'❌ Tenant not found: {subdomain}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {str(e)}'))
            import traceback
            traceback.print_exc()
