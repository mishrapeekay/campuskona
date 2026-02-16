
import os
import sys
import django
from django.db import connection
from django.contrib.auth.hashers import make_password

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

def check_veda_users():
    schema = 'tenant_veda_vidyalaya'
    password = 'School@123'
    hashed_password = make_password(password)

    print(f"Checking users in schema: {schema}")
    
    with connection.cursor() as cursor:
        try:
            # 1. List existing users
            cursor.execute(f"SELECT email, user_type, is_active FROM {schema}.users")
            users = cursor.fetchall()
            
            if not users:
                print("No users found in this schema!")
                return
                
            print(f"\nFound {len(users)} users:")
            for email, user_type, is_active in users:
                status = "Active" if is_active else "Inactive"
                print(f"- {email} ({user_type}) - {status}")
                
            # 2. Reset passwords for specific test accounts if they exist, or pick the first student
            print(f"\nResetting passwords to '{password}' for all users in {schema}...")
            cursor.execute(f"""
                UPDATE {schema}.users 
                SET password = %s, is_active = true 
                WHERE user_type IN ('STUDENT', 'TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL')
            """, [hashed_password])
            
            print(f"Updated {cursor.rowcount} users.")
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    check_veda_users()
