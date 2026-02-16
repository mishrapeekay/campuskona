"""
Management command to create test users for all dashboard types
for both 'veda' and 'demo' tenants.
"""
from django.core.management.base import BaseCommand
from django.db import connection
from apps.authentication.models import User
from apps.tenants.models import School
from datetime import date


class Command(BaseCommand):
    help = 'Create test users for all dashboard types (Teacher, Student, Parent, Librarian, Transport Manager) for veda and demo tenants'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant',
            type=str,
            help='Specific tenant subdomain (veda or demo). If not provided, creates for both.',
        )

    def handle(self, *args, **options):
        specific_tenant = options.get('tenant')

        # Define users to create for each tenant
        users_config = [
            {
                'user_type': 'TEACHER',
                'email_suffix': 'teacher',
                'first_name': 'Test',
                'last_name': 'Teacher',
                'password': 'Teacher@123',
                'phone_suffix': '001',
            },
            {
                'user_type': 'STUDENT',
                'email_suffix': 'student',
                'first_name': 'Test',
                'last_name': 'Student',
                'password': 'Student@123',
                'phone_suffix': '002',
            },
            {
                'user_type': 'PARENT',
                'email_suffix': 'parent',
                'first_name': 'Test',
                'last_name': 'Parent',
                'password': 'Parent@123',
                'phone_suffix': '003',
            },
            {
                'user_type': 'LIBRARIAN',
                'email_suffix': 'librarian',
                'first_name': 'Test',
                'last_name': 'Librarian',
                'password': 'Librarian@123',
                'phone_suffix': '004',
            },
            {
                'user_type': 'TRANSPORT_MANAGER',
                'email_suffix': 'transport',
                'first_name': 'Test',
                'last_name': 'Transport',
                'password': 'Transport@123',
                'phone_suffix': '005',
            },
            {
                'user_type': 'SCHOOL_ADMIN',
                'email_suffix': 'admin',
                'first_name': 'Test',
                'last_name': 'Admin',
                'password': 'Admin@123',
                'phone_suffix': '006',
                'is_staff': True,
            },
        ]

        tenants_to_process = []

        if specific_tenant:
            tenants_to_process = [specific_tenant]
        else:
            tenants_to_process = ['veda', 'demo']

        self.stdout.write(self.style.WARNING('\n' + '='*60))
        self.stdout.write(self.style.WARNING('  CREATING DASHBOARD TEST USERS'))
        self.stdout.write(self.style.WARNING('='*60 + '\n'))

        all_credentials = []

        for tenant_subdomain in tenants_to_process:
            self.stdout.write(self.style.HTTP_INFO(f'\n[*] Processing Tenant: {tenant_subdomain.upper()}'))
            self.stdout.write('-' * 40)

            # Check if tenant exists
            try:
                tenant = School.objects.get(subdomain=tenant_subdomain)
                self.stdout.write(f'   Tenant found: {tenant.name}')
            except School.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'   [!] Tenant "{tenant_subdomain}" not found. Skipping...'))
                continue

            tenant_credentials = []

            for config in users_config:
                email = f'{config["email_suffix"]}@{tenant_subdomain}.com'

                # Make phone unique by adding variation per tenant
                if tenant_subdomain == 'veda':
                    phone = f'9876510{config["phone_suffix"]}'
                else:  # demo
                    phone = f'9876520{config["phone_suffix"]}'

                try:
                    # Check if user already exists
                    if User.objects.filter(email=email).exists():
                        user = User.objects.get(email=email)
                        # Update password
                        user.set_password(config['password'])
                        user.save()
                        self.stdout.write(f'   [+] Updated: {email}')
                    else:
                        # Create new user
                        user = User.objects.create_user(
                            email=email,
                            password=config['password'],
                            first_name=config['first_name'],
                            last_name=config['last_name'],
                            phone=phone,
                            user_type=config['user_type'],
                            is_staff=config.get('is_staff', False),
                            is_active=True,
                            email_verified=True,
                            phone_verified=True,
                        )
                        self.stdout.write(self.style.SUCCESS(f'   [+] Created: {email}'))

                    tenant_credentials.append({
                        'tenant': tenant_subdomain,
                        'user_type': config['user_type'],
                        'email': email,
                        'password': config['password'],
                        'dashboard': self._get_dashboard_name(config['user_type']),
                    })

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'   [X] Error creating {email}: {str(e)}'))

            all_credentials.extend(tenant_credentials)

        # Print credentials summary
        self.stdout.write('\n' + '='*80)
        self.stdout.write(self.style.SUCCESS('  [OK] ALL USERS CREATED SUCCESSFULLY'))
        self.stdout.write('='*80)

        self._print_credentials_table(all_credentials)

        # Print login instructions
        self.stdout.write('\n' + '-'*80)
        self.stdout.write(self.style.WARNING('\n[INFO] LOGIN INSTRUCTIONS:'))
        self.stdout.write('-'*80)
        self.stdout.write('\n1. Open the frontend at: http://localhost:3000/login')
        self.stdout.write('2. Enter the email and password from the table above')
        self.stdout.write('3. Make sure to select the correct tenant in the header (if required)')
        self.stdout.write('\n   For API requests, include the header:')
        self.stdout.write('   X-Tenant-Subdomain: veda  (or demo)')
        self.stdout.write('\n' + '='*80 + '\n')

    def _get_dashboard_name(self, user_type):
        dashboard_map = {
            'TEACHER': 'Teacher Dashboard',
            'STUDENT': 'Student Dashboard',
            'PARENT': 'Parent Dashboard',
            'LIBRARIAN': 'Library Dashboard',
            'TRANSPORT_MANAGER': 'Transport Dashboard',
            'SCHOOL_ADMIN': 'Admin Dashboard',
        }
        return dashboard_map.get(user_type, 'Dashboard')

    def _print_credentials_table(self, credentials):
        """Print a formatted table of credentials"""

        # Group by tenant
        tenants = {}
        for cred in credentials:
            tenant = cred['tenant']
            if tenant not in tenants:
                tenants[tenant] = []
            tenants[tenant].append(cred)

        for tenant, creds in tenants.items():
            self.stdout.write(f'\n\n[*] TENANT: {tenant.upper()}')
            self.stdout.write('-'*80)
            self.stdout.write(f'{"Dashboard":<22} {"Email":<30} {"Password":<15}')
            self.stdout.write('-'*80)

            for cred in creds:
                self.stdout.write(
                    f'{cred["dashboard"]:<22} {cred["email"]:<30} {cred["password"]:<15}'
                )
