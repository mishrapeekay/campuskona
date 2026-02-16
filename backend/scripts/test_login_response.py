import requests
import json

# Test Login
url = "http://127.0.0.1:8000/api/v1/auth/login/"
headers = {
    "Content-Type": "application/json",
    "X-Tenant-Subdomain": "veda"
}
data = {
    "email": "vv-adm-2021-0502@vedavidyalaya.edu.in",
    "password": "School@123"
}

print("=" * 60)
print("TESTING LOGIN RESPONSE")
print("=" * 60)
print(f"\nLogging in as: {data['email']}")
print(f"Tenant: veda")

response = requests.post(url, json=data, headers=headers)

print(f"\nStatus Code: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    print("\n✅ Login Successful")
    print("\nUser Data:")
    user = result.get('user', {})
    print(f"  - ID: {user.get('id')}")
    print(f"  - Email: {user.get('email')}")
    print(f"  - User Type: {user.get('user_type')}")
    print(f"  - Student ID: {user.get('student_id')}")
    print(f"  - Staff ID: {user.get('staff_id')}")
    
    if user.get('student_id'):
        print("\n✅ STUDENT_ID PRESENT IN RESPONSE")
    else:
        print("\n❌ STUDENT_ID IS NULL - THIS IS THE PROBLEM!")
        
else:
    print(f"\n❌ Login Failed")
    print(f"Response: {response.text}")
