import requests

def try_login():
    headers = {
        "X-Tenant-Subdomain": "veda9",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    url = "https://www.campuskona.com/api/v1/auth/login/"
    payload = {"email": "admin@veda.com", "password": "Veda@123456"}
    
    print("Testing admin credentials...")
    try:
        res = requests.post(url, json=payload, headers=headers)
        print(f"Status: {res.status_code}")
        
        if res.status_code == 200:
            token = res.json().get('data', {}).get('access_token')
            print("Login successful! Token acquired.")
            
            headers['Authorization'] = f"Bearer {token}"
            
            # Fetch some teachers
            staff_res = requests.get("https://www.campuskona.com/api/v1/staff/?role=TEACHER", headers=headers)
            print(f"Staff status: {staff_res.status_code}")
            if staff_res.status_code == 200:
                print("Teachers:", [s.get('user_display', {}).get('email', s.get('email')) for s in staff_res.json().get('results', [])][:3])
                
            # Fetch some students
            stu_res = requests.get("https://www.campuskona.com/api/v1/students/", headers=headers)
            print(f"Student status: {stu_res.status_code}")
            if stu_res.status_code == 200:
                print("Students:", [s.get('user_display', {}).get('email', s.get('email')) for s in stu_res.json().get('results', [])][:3])
                
            parents_res = requests.get("https://www.campuskona.com/api/v1/users/?user_type=PARENT", headers=headers)
            print(f"Parent status: {parents_res.status_code}")
            if parents_res.status_code == 200:
                print("Parents:", [s.get('email', s.get('user', {}).get('email')) for s in parents_res.json().get('results', [])][:3])
                
        else:
            print("Failed Response:", res.text[:200])
    except Exception as e:
        print(f"Error {url}: {e}")

try_login()
