"""
Create admin user for Veda Vidyalaya
"""
from apps.authentication.models import User

# Create Veda Vidyalaya admin
admin = User.objects.create_user(
    email='admin@vedavidyalaya.edu.in',
    password='VedaAdmin@2024',
    first_name='Veda',
    last_name='Administrator',
    phone='9876543210',
    user_type='SCHOOL_ADMIN',
    is_staff=True,
    is_active=True
)

print("=" * 60)
print("✅ VEDA VIDYALAYA ADMIN USER CREATED!")
print("=" * 60)
print(f"Email:    {admin.email}")
print(f"Password: VedaAdmin@2024")
print(f"Name:     {admin.first_name} {admin.last_name}")
print(f"Type:     {admin.user_type}")
print(f"Active:   {admin.is_active}")
print("=" * 60)
print("\n🎉 You can now login to Veda Vidyalaya!")
print("\nNext Steps:")
print("1. Open http://localhost:5173")
print("2. Select 'Veda Vidyalaya' from tenant selector")
print("3. Login with the credentials above")
print("=" * 60)
