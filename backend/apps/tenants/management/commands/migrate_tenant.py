"""
Management command to run migrations on a specific tenant schema.
"""

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from apps.tenants.models import School


class Command(BaseCommand):
    help = 'Run migrations on a specific tenant schema'

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
            self.stdout.write(f"Found tenant: {tenant.name} ({tenant.subdomain})")
            self.stdout.write(f"Schema: {tenant.schema_name}")
            
            # Switch to tenant schema
            if connection.vendor == 'postgresql':
                with connection.cursor() as cursor:
                    cursor.execute(f'SET search_path TO "{tenant.schema_name}"')
                    self.stdout.write(self.style.SUCCESS(f'[OK] Switched to schema: {tenant.schema_name}'))

                # Run migrations
                self.stdout.write(f"\n[RUNNING] Running migrations on {tenant.schema_name}...")
                call_command('migrate', '--database=default', verbosity=2)

                # Switch back to public
                with connection.cursor() as cursor:
                    cursor.execute('SET search_path TO "public"')
                    self.stdout.write(self.style.SUCCESS(f'[OK] Switched back to public schema'))

                self.stdout.write(self.style.SUCCESS(f'\n[SUCCESS] Migrations completed for {tenant.name}!'))
            else:
                self.stdout.write(self.style.ERROR('[ERROR] This command only works with PostgreSQL'))

        except School.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'[ERROR] Tenant not found: {subdomain}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERROR] Error: {str(e)}'))
            import traceback
            traceback.print_exc()
