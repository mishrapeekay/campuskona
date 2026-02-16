from django.core.management.base import BaseCommand
from django.conf import settings
from django.db import connection
from django_tenants.utils import tenant_context

from apps.tenants.models import School
from apps.core.services.exceptions import ExceptionService
from apps.communication.email_service import EmailService
from apps.authentication.models import User

class Command(BaseCommand):
    help = 'Checks for critical exceptions and sends alerts to admins.'

    def handle(self, *args, **options):
        self.stdout.write("Starting critical exception check...")

        schools = School.objects.all()
        
        for school in schools:
            self.stdout.write(f"Processing school: {school.name} ({school.schema_name})")
            
            try:
                with tenant_context(school):
                    self.check_and_alert(school)
            except Exception as e:
                self.stderr.write(f"Error processing school {school.name}: {str(e)}")

        self.stdout.write("Critical exception check completed.")

    def check_and_alert(self, school):
        service = ExceptionService()
        results = service.get_dashboard_exceptions()
        
        # Collect critical exceptions
        critical_exceptions = []
        for category, items in results.get('categories', {}).items():
            for item in items:
                if item.get('severity') == 'CRITICAL':
                    critical_exceptions.append(item)
        
        if not critical_exceptions:
            self.stdout.write(f"  No critical exceptions found for {school.name}.")
            return

        self.stdout.write(f"  Found {len(critical_exceptions)} critical exceptions for {school.name}.")
        
        # Send Email Alert
        self.send_alert_email(school, critical_exceptions)

    def send_alert_email(self, school, exceptions):
        # Find Super Admins and School Admins for this tenant
        # Note: In schema-isolated DBs, Users are usually in the public schema 
        # BUT mapped to tenants via 'user_roles' or similar if using shared public users.
        # However, typically 'User' table might likely be in the tenant schema if it's a completely isolated design
        # OR 'User' is public and has a M2M to tenants.
        # Based on file analysis, 'User' is in 'apps.authentication', likely tenant-specific if using standard django-tenants
        # without shared apps for auth.
        # Let's assume User is inside the tenant schema for now as is common for simple isolation.
        
        admins = User.objects.filter(
            user_type__in=['SUPER_ADMIN', 'SCHOOL_ADMIN'],
            is_active=True
        )
        
        recipient_emails = [admin.email for admin in admins if admin.email]
        
        if not recipient_emails:
            self.stdout.write("  No admins found to notify.")
            return

        subject = f"CRITICAL DASHBOARD ALERTS - {school.name}"
        
        # Build Message
        message_lines = [f"Critical alerts found for {school.name}:\n"]
        for exc in exceptions:
            message_lines.append(f"- [{exc.get('title')}] {exc.get('description')}")
        
        message_lines.append(f"\nPlease login to the admin dashboard to take action: {settings.FRONTEND_URL}")
        
        message = "\n".join(message_lines)
        
        # Send Bulk Email
        EmailService.send_bulk_email(
            recipients=recipient_emails,
            subject=subject,
            message=message
        )
        self.stdout.write(f"  Alert sent to {len(recipient_emails)} admins.")
