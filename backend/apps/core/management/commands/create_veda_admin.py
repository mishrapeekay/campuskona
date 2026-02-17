"""
Create Veda Vidyalaya admin user
"""
from django.core.management.base import BaseCommand
from apps.authentication.models import User

class Command(BaseCommand):
    help = 'Create admin user for Veda Vidyalaya'

    def handle(self, *args, **options):
        email = 'admin@vedavidyalaya.edu.in'
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f"⚠️  User {email} already exists!"))
            user = User.objects.get(email=email)
            self.stdout.write(f"Email: {user.email}")
            self.stdout.write(f"Name: {user.first_name} {user.last_name}")
            self.stdout.write("\nTo reset password, use:")
            self.stdout.write("  user = User.objects.get(email='admin@vedavidyalaya.edu.in')")
            self.stdout.write("  user.set_password('VedaAdmin@2024')")
            self.stdout.write("  user.save()")
            return

        # Create new admin user
        admin = User.objects.create_user(
            email=email,
            password='VedaAdmin@2024',
            first_name='Veda',
            last_name='Administrator',
            phone='9123456789',  # Unique phone for Veda admin
            user_type='SCHOOL_ADMIN',
            is_staff=False,
            is_active=True
        )

        self.stdout.write(self.style.SUCCESS("\n" + "=" * 60))
        self.stdout.write(self.style.SUCCESS("✅ VEDA VIDYALAYA ADMIN USER CREATED!"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(f"📧 Email:    {admin.email}")
        self.stdout.write(f"🔑 Password: VedaAdmin@2024")
        self.stdout.write(f"👤 Name:     {admin.first_name} {admin.last_name}")
        self.stdout.write(f"📱 Phone:    {admin.phone}")
        self.stdout.write(f"🏷️  Type:     {admin.user_type}")
        self.stdout.write(f"✓  Active:   {admin.is_active}")
        self.stdout.write(self.style.SUCCESS("=" * 60))
        
        self.stdout.write(self.style.SUCCESS("\n🎉 You can now login to Veda Vidyalaya!"))
        self.stdout.write("\n📋 Next Steps:")
        self.stdout.write("  1. Open http://localhost:5173")
        self.stdout.write("  2. Select 'Veda Vidyalaya' from tenant selector")
        self.stdout.write("  3. Login with the credentials above")
        self.stdout.write(self.style.SUCCESS("=" * 60 + "\n"))
