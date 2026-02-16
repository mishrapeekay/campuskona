"""
Management command to create super admin user.
Usage: python manage.py create_superadmin
"""

from django.core.management.base import BaseCommand
from apps.authentication.models import User


class Command(BaseCommand):
    help = 'Create a super admin user who can access all tenants'

    def handle(self, *args, **kwargs):
        email = 'superadmin@schoolms.com'
        password = 'SuperAdmin@2024'

        # Check if user already exists
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': 'Super',
                'last_name': 'Admin',
                'user_type': 'SCHOOL_ADMIN',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'phone': '9999999999',
                'country': 'India'
            }
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS('✅ Super admin created successfully!'))
        else:
            # Update existing user
            user.set_password(password)
            user.is_superuser = True
            user.is_staff = True
            user.is_active = True
            user.save()
            self.stdout.write(self.style.SUCCESS('✅ Super admin updated successfully!'))

        self.stdout.write(f"\n📧 Email: {email}")
        self.stdout.write(f"🔑 Password: {password}")
        self.stdout.write(f"👤 User Type: {user.user_type}")
        self.stdout.write(f"🔐 Is Superuser: {user.is_superuser}")
        self.stdout.write(self.style.SUCCESS("\n🎯 This user can access ALL tenants (Demo + Veda)"))
