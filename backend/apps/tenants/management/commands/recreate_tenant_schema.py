"""
Management command to drop and recreate a tenant schema.
"""

from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from apps.tenants.models import School


class Command(BaseCommand):
    help = 'Drop and recreate a tenant schema'

    def add_arguments(self, parser):
        parser.add_argument(
            'subdomain',
            type=str,
            help='Tenant subdomain (e.g., demo, veda)'
        )
        parser.add_argument(
            '--yes',
            action='store_true',
            help='Skip confirmation prompt'
        )

    def handle(self, *args, **options):
        subdomain = options['subdomain']
        skip_confirm = options.get('yes', False)
        
        try:
            # Get tenant
            tenant = School.objects.get(subdomain=subdomain)
            self.stdout.write(f"\n{'='*80}")
            self.stdout.write(f"Tenant: {tenant.name} ({tenant.subdomain})")
            self.stdout.write(f"Schema: {tenant.schema_name}")
            self.stdout.write(f"{'='*80}\n")
            
            # Confirm
            if not skip_confirm:
                confirm = input(f"⚠️  This will DELETE ALL DATA in {tenant.schema_name}. Continue? (yes/no): ")
                if confirm.lower() != 'yes':
                    self.stdout.write(self.style.WARNING('❌ Operation cancelled'))
                    return
            
            if connection.vendor == 'postgresql':
                # Drop schema
                self.stdout.write(f"\n🗑️  Dropping schema: {tenant.schema_name}...")
                with connection.cursor() as cursor:
                    cursor.execute(f'DROP SCHEMA IF EXISTS "{tenant.schema_name}" CASCADE')
                self.stdout.write(self.style.SUCCESS(f'✅ Schema dropped'))
                
                # Create schema
                self.stdout.write(f"\n📦 Creating schema: {tenant.schema_name}...")
                with connection.cursor() as cursor:
                    cursor.execute(f'CREATE SCHEMA "{tenant.schema_name}"')
                self.stdout.write(self.style.SUCCESS(f'✅ Schema created'))
                
                # Switch to tenant schema
                with connection.cursor() as cursor:
                    cursor.execute(f'SET search_path TO "{tenant.schema_name}"')
                
                # Run migrations
                self.stdout.write(f"\n🔄 Running migrations on {tenant.schema_name}...")
                call_command('migrate', '--database=default', verbosity=1)
                
                # Switch back to public
                with connection.cursor() as cursor:
                    cursor.execute('SET search_path TO "public"')
                
                self.stdout.write(f"\n{'='*80}")
                self.stdout.write(self.style.SUCCESS(f'✅ SUCCESS! Schema {tenant.schema_name} recreated!'))
                self.stdout.write(f"{'='*80}\n")
                self.stdout.write(f"\n📝 Next steps:")
                self.stdout.write(f"  1. Import data: python manage.py import_tenant_data {subdomain}")
                self.stdout.write(f"  2. Test login: {tenant.name}")
                self.stdout.write(f"\n")
                
            else:
                self.stdout.write(self.style.ERROR('❌ This command only works with PostgreSQL'))
                
        except School.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'❌ Tenant not found: {subdomain}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error: {str(e)}'))
            import traceback
            traceback.print_exc()
