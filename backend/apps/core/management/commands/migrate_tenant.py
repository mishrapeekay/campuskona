"""
Management command to run migrations for a specific tenant schema.

Usage:
    python manage.py migrate_tenant --schema_name=school_demo
    python manage.py migrate_tenant --all
"""

import logging
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from psycopg2 import sql as psycopg2_sql

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Run migrations for a specific tenant schema or all tenant schemas'

    def add_arguments(self, parser):
        parser.add_argument(
            '--schema_name',
            type=str,
            help='Schema name to migrate (e.g., school_demo)',
        )
        parser.add_argument(
            '--all',
            action='store_true',
            help='Migrate all tenant schemas',
        )

    def handle(self, *args, **options):
        schema_name = options.get('schema_name')
        migrate_all = options.get('all')

        if not schema_name and not migrate_all:
            self.stderr.write(
                self.style.ERROR('Provide --schema_name=<name> or --all')
            )
            return

        if migrate_all:
            self._migrate_all_tenants()
        else:
            self._migrate_schema(schema_name)

    def _migrate_all_tenants(self):
        """Migrate all active tenant schemas."""
        from apps.tenants.models import School

        schools = School.objects.filter(is_active=True)
        total = schools.count()
        self.stdout.write(f"Migrating {total} tenant schemas...")

        for i, school in enumerate(schools, 1):
            self.stdout.write(f"  [{i}/{total}] {school.schema_name}...")
            self._migrate_schema(school.schema_name)

        self.stdout.write(self.style.SUCCESS(f"Completed migration for {total} tenants."))

    def _migrate_schema(self, schema_name):
        """Run tenant-app migrations within a specific schema."""
        from apps.core.db_router import TenantDatabaseRouter

        if connection.vendor != 'postgresql':
            self.stderr.write(self.style.WARNING('Schema migration only works with PostgreSQL'))
            return

        # Verify schema exists
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT schema_name FROM information_schema.schemata WHERE schema_name = %s",
                [schema_name]
            )
            if not cursor.fetchone():
                self.stderr.write(
                    self.style.ERROR(f"Schema '{schema_name}' does not exist")
                )
                return

        # Switch to tenant schema
        with connection.cursor() as cursor:
            cursor.execute(
                psycopg2_sql.SQL('SET search_path TO {}, "public"').format(
                    psycopg2_sql.Identifier(schema_name)
                )
            )

        try:
            # Run migrations for each tenant app
            tenant_apps = list(TenantDatabaseRouter.TENANT_APPS)
            for app_label in tenant_apps:
                try:
                    call_command(
                        'migrate',
                        app_label=app_label,
                        database='default',
                        verbosity=0,
                        interactive=False,
                    )
                except Exception as e:
                    logger.warning(
                        "Migration failed for app '%s' in schema '%s': %s",
                        app_label, schema_name, e
                    )

            self.stdout.write(
                self.style.SUCCESS(f"    Migrated schema: {schema_name}")
            )

        finally:
            # Reset to public schema
            with connection.cursor() as cursor:
                cursor.execute('SET search_path TO "public"')
