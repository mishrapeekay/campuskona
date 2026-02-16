import requests
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

BASE_URL = "http://127.0.0.1:8000/api/v1"
LOGIN_URL = f"{BASE_URL}/auth/login/"

CREDENTIALS = [
    # VEDA
    {"tenant": "veda", "role": "Teacher", "email": "teacher@veda.com", "password": "Teacher@123"},
    {"tenant": "veda", "role": "Student", "email": "student@veda.com", "password": "Student@123"},
    {"tenant": "veda", "role": "Parent", "email": "parent@veda.com", "password": "Parent@123"},
    {"tenant": "veda", "role": "Librarian", "email": "librarian@veda.com", "password": "Librarian@123"},
    {"tenant": "veda", "role": "Transport", "email": "transport@veda.com", "password": "Transport@123"},
    {"tenant": "veda", "role": "Admin", "email": "admin@veda.com", "password": "Admin@123"},
    
    # DEMO
    {"tenant": "demo", "role": "Teacher", "email": "teacher@demo.com", "password": "Teacher@123"},
    {"tenant": "demo", "role": "Student", "email": "student@demo.com", "password": "Student@123"},
    {"tenant": "demo", "role": "Parent", "email": "parent@demo.com", "password": "Parent@123"},
    {"tenant": "demo", "role": "Librarian", "email": "librarian@demo.com", "password": "Librarian@123"},
    {"tenant": "demo", "role": "Transport", "email": "transport@demo.com", "password": "Transport@123"},
    {"tenant": "demo", "role": "Admin", "email": "admin@demo.com", "password": "Admin@123"},
]

def check_login(cred):
    headers = {
        "Content-Type": "application/json",
        "X-Tenant-Subdomain": cred['tenant']
    }
    data = {
        "email": cred['email'],
        "password": cred['password']
    }
    
    try:
        response = requests.post(LOGIN_URL, json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            user = result.get('user', {})
            logging.info(f"✅ [PASS] {cred['tenant'].upper()} - {cred['role']}: Login successful. UserType: {user.get('user_type')}, ID: {user.get('id')}")
            return result
        else:
            logging.error(f"❌ [FAIL] {cred['tenant'].upper()} - {cred['role']}: Login failed. Status: {response.status_code}, Resp: {response.text}")
            return None
    except Exception as e:
        logging.error(f"❌ [ERROR] {cred['tenant'].upper()} - {cred['role']}: Exception: {str(e)}")
        return None

def main():
    print("Starting Credential Check...")
    print("-" * 60)
    
    results = {}
    
    for cred in CREDENTIALS:
        res = check_login(cred)
        results[f"{cred['tenant']}_{cred['role']}"] = res
        
    print("-" * 60)
    print("Check Complete.")

if __name__ == "__main__":
    main()
