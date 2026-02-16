"""
Management command to add performance indexes to all tenant schemas.

Usage:
    python manage.py add_performance_indexes
"""

from django.core.management.base import BaseCommand
from django.db import connection
from apps.tenants.models import School


class Command(BaseCommand):
    help = 'Add performance indexes to all tenant schemas'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant',
            type=str,
            help='Specific tenant schema to add indexes to (optional)',
        )

    def handle(self, *args, **options):
        tenant_slug = options.get('tenant')

        # Indexes to create
        indexes = [
            {
                'name': 'idx_students_enrollment',
                'sql': 'CREATE INDEX IF NOT EXISTS idx_students_enrollment ON students_student(enrollment_number);',
                'table': 'students_student',
                'description': 'Student enrollment number lookup',
            },
            {
                'name': 'idx_attendance_date_student',
                'sql': 'CREATE INDEX IF NOT EXISTS idx_attendance_date_student ON attendance_attendance(date, student_id);',
                'table': 'attendance_attendance',
                'description': 'Attendance date and student composite',
            },
            {
                'name': 'idx_finance_status_due',
                'sql': 'CREATE INDEX IF NOT EXISTS idx_finance_status_due ON finance_feepayment(status, due_date);',
                'table': 'finance_feepayment',
                'description': 'Fee payment status and due date',
            },
        ]

        if tenant_slug:
            # Add indexes to specific tenant
            try:
                tenant = School.objects.get(slug=tenant_slug)
                self._add_indexes_to_tenant(tenant, indexes)
            except School.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Tenant "{tenant_slug}" not found'))
                return
        else:
            # Add indexes to all tenants
            tenants = School.objects.filter(is_active=True)
            self.stdout.write(self.style.SUCCESS(f'Found {tenants.count()} active tenants'))

            for tenant in tenants:
                self._add_indexes_to_tenant(tenant, indexes)

        self.stdout.write(self.style.SUCCESS('[DONE] Performance indexes added successfully'))

    def _add_indexes_to_tenant(self, tenant, indexes):
        """Add indexes to a specific tenant schema."""
        self.stdout.write(f'\nProcessing tenant: {tenant.name} ({tenant.schema_name})')

        with connection.cursor() as cursor:
            # Switch to tenant schema
            cursor.execute(f'SET search_path TO {tenant.schema_name}')

            for index in indexes:
                try:
                    # Check if table exists
                    cursor.execute(f"""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables
                            WHERE table_schema = '{tenant.schema_name}'
                            AND table_name = '{index['table']}'
                        );
                    """)
                    table_exists = cursor.fetchone()[0]

                    if not table_exists:
                        self.stdout.write(self.style.WARNING(
                            f'  [!] Table {index["table"]} does not exist, skipping...'
                        ))
                        continue

                    # Create index
                    cursor.execute(index['sql'])
                    self.stdout.write(self.style.SUCCESS(
                        f'  [OK] {index["name"]}: {index["description"]}'
                    ))

                except Exception as e:
                    self.stdout.write(self.style.ERROR(
                        f'  [ERROR] Failed to create {index["name"]}: {str(e)}'
                    ))

            # Reset search path
            cursor.execute('SET search_path TO public')
