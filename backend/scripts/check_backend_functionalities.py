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
    
    # DEMO
    {"tenant": "demo", "role": "Teacher", "email": "teacher@demo.com", "password": "Teacher@123"},
    {"tenant": "demo", "role": "Student", "email": "student@demo.com", "password": "Student@123"},
    {"tenant": "demo", "role": "Parent", "email": "parent@demo.com", "password": "Parent@123"},
]

def make_request(method, url, token, tenant, params=None):
    headers = {
        "Content-Type": "application/json",
        "X-Tenant-Subdomain": tenant,
        "Authorization": f"Bearer {token}"
    }
    try:
        response = requests.request(method, url, headers=headers, params=params)
        logging.info(f"   [HTTP {response.status_code}] {url.replace('http://127.0.0.1:8000/api/v1', '')}")
        if response.status_code == 200:
             return response.json()
        elif response.status_code == 404:
             logging.warning(f"   ❌ 404 Not Found: {url}")
             return None
        else:
             logging.warning(f"   ❌ Failed. {response.text[:100]}...")
             return None
    except Exception as e:
        logging.error(f"   ❌ Exception: {str(e)}")
        return None

def check_teacher(cred, token, user_id):
    print(f"   > Checking Teacher specific endpoints...")
    make_request('GET', f"{BASE_URL}/staff/members/dashboard_stats/", token, cred['tenant'])
    make_request('GET', f"{BASE_URL}/timetable/teacher-timetable/my_timetable/", token, cred['tenant'])

def check_student(cred, token, student_id):
    print(f"   > Checking Student specific endpoints...")
    if not student_id:
        # Fetch list to find ID
        res = make_request('GET', f"{BASE_URL}/students/students/", token, cred['tenant'])
        if res and res.get('results'):
             student_id = res['results'][0]['id']
             print(f"   Found student ID from list: {student_id}")

    if not student_id:
        print("   ❌ No Student ID linked or found!")
        return

    # Check Profile
    make_request('GET', f"{BASE_URL}/students/students/{student_id}/profile/", token, cred['tenant'])
    
    # Check Profile via ID in list
    # The list endpoint works? 
    res = make_request('GET', f"{BASE_URL}/students/students/", token, cred['tenant'])
    
    # Check Timetable needs parameters
    # Get Current AY
    res = make_request('GET', f"{BASE_URL}/academics/academic-years/", token, cred['tenant'], params={'is_current': True})
    ay_id = None
    if res and res.get('results'):
        ay_id = res['results'][0]['id']
    else:
        # Fallback to get any year
        res = make_request('GET', f"{BASE_URL}/academics/academic-years/", token, cred['tenant'])
        if res and res.get('results'):
            ay_id = res['results'][0]['id']
            
    if ay_id and student_id:
        # Get Student Enrollment to find class/section
        # Not easy to find directly from here without enrollment endpoint
        pass

def check_parent(cred, token):
    print(f"   > Checking Parent specific endpoints...")
    res = make_request('GET', f"{BASE_URL}/students/students/", token, cred['tenant'])

def main():
    print("Starting Final Backend Check...")
    print("-" * 60)
    
    for cred in CREDENTIALS:
        print(f"\n🔹 {cred['role']} ({cred['tenant'].upper()})")
        
        headers = {
            "Content-Type": "application/json",
            "X-Tenant-Subdomain": cred['tenant']
        }
        data = {
            "email": cred['email'],
            "password": cred['password']
        }
        
        try:
            resp = requests.post(LOGIN_URL, json=data, headers=headers)
            if resp.status_code != 200:
                print(f"   ❌ Login Failed: {resp.status_code}")
                continue
                
            login_data = resp.json()
            token = login_data.get('access')
            user = login_data.get('user', {})
            student_id = user.get('student_id')
            
            print(f"   ✅ Login OK. User ID: {user.get('id')}")
            
            if cred['role'] == 'Teacher':
                check_teacher(cred, token, user.get('id'))
            elif cred['role'] == 'Student':
                check_student(cred, token, student_id)
            elif cred['role'] == 'Parent':
                check_parent(cred, token)
                
        except Exception as e:
            print(f"   ❌ Exception: {e}")

if __name__ == "__main__":
    main()
