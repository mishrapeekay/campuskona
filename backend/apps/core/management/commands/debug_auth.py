
from django.core.management.base import BaseCommand
from django.db import connection
from apps.authentication.models import User
from rest_framework.authtoken.models import Token
from apps.tenants.models import School

class Command(BaseCommand):
    help = 'Debug auth status'

    def handle(self, *args, **options):
        self.stdout.write("🔍 Checking User and Token status...")
        
        # Check Demo Admin
        email = 'admin@school.com'
        try:
            user = User.objects.get(email=email)
            self.stdout.write(f"✅ User found: {user.email}")
            self.stdout.write(f"   - Active: {user.is_active}")
            self.stdout.write(f"   - Staff: {user.is_staff}")
            self.stdout.write(f"   - Superuser: {user.is_superuser}")
            self.stdout.write(f"   - ID: {user.id}")
            
            token = Token.objects.filter(user=user).first()
            if token:
                self.stdout.write(f"✅ Token exists: {token.key[:10]}...")
            else:
                self.stdout.write(self.style.ERROR(f"❌ NO TOKEN for {email}"))
                
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"❌ User NOT FOUND: {email}"))

        self.stdout.write("-" * 50)

        # Check Veda Admin
        email = 'admin@vedavidyalaya.edu.in'
        try:
            user = User.objects.get(email=email)
            self.stdout.write(f"✅ User found: {user.email}")
            self.stdout.write(f"   - Active: {user.is_active}")
            self.stdout.write(f"   - Staff: {user.is_staff}")
            self.stdout.write(f"   - Superuser: {user.is_superuser}")
            self.stdout.write(f"   - ID: {user.id}")
            
            token = Token.objects.filter(user=user).first()
            if token:
                self.stdout.write(f"✅ Token exists: {token.key[:10]}...")
            else:
                self.stdout.write(self.style.ERROR(f"❌ NO TOKEN for {email}"))
                
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"❌ User NOT FOUND: {email}"))

        self.stdout.write("-" * 50)
        
        # Check if we can switch schema and find students
        try:
            tenant = School.objects.get(subdomain='demo')
            self.stdout.write(f"Found tenant: {tenant.name}")
            
            with connection.cursor() as cursor:
                cursor.execute(f'SET search_path TO "{tenant.schema_name}"')
                self.stdout.write(f"Switched to {tenant.schema_name}")
                
                # Count students
                cursor.execute('SELECT count(*) FROM students')
                count = cursor.fetchone()[0]
                self.stdout.write(f"✅ Student count in {tenant.schema_name}: {count}")
                
                # Switch back
                cursor.execute('SET search_path TO "public"')
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Schema check failed: {e}"))
