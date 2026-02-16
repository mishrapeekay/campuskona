from apps.authentication.models import User

# Get the admin user
admin = User.objects.get(email='admin@school.com')

# Set password to 'admin123'
admin.set_password('admin123')
admin.save()

print("Password set successfully!")
print(f"Email: {admin.email}")
print(f"Password: admin123")
print(f"User Type: {admin.user_type}")
