import requests

def try_login():
    headers = {
        "X-Tenant-Subdomain": "veda9",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    emails = [
        "vv-emp-0004@vedavidyalaya.edu.in",
        "vv-emp-0001@vedavidyalaya.edu.in",
        "vv-adm-2024-0490@vedavidyalaya.edu.in",
        "vv-emp-0004@veda.edu",
        "vv-emp-0001@veda.edu",
    ]
    passwords = [
        "School@123",
        "Veda@123",
        "Admin@123"
    ]
    
    url = "https://www.campuskona.com/api/v1/auth/login/"
    
    print("Testing credentials against live server for Veda9 tenant...")
    for email in emails:
        for password in passwords:
            payload = {"email": email, "password": password}
            try:
                res = requests.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    print(f"✅ SUCCESS! Email: {email}, Password: {password}")
                    return
                else:
                    print(f"[{res.status_code}] Failed for {email}:{password}")
            except Exception as e:
                print(f"Error: {e}")

try_login()
