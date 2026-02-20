import requests

def try_login():
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    url = "https://www.campuskona.com/api/v1/auth/login/"
    payload = {"email": "superadmin@schoolmgmt.com", "password": "SuperAdmin@123"}
    
    print("Testing super admin credentials...")
    try:
        res = requests.post(url, json=payload, headers=headers)
        print(f"[{res.status_code}] -> {res.text[:300]}")
    except Exception as e:
        print(f"Error {url}: {e}")

try_login()
