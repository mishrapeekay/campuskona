import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_dashboard_endpoints():
    """Test all dashboard endpoints with admin token"""
    
    # Login first
    print("=" * 70)
    print("LOGGING IN AS ADMIN")
    print("=" * 70)
    
    headers = {
        "Content-Type": "application/json",
        "X-Tenant-Subdomain": "veda"
    }
    
    login_response = requests.post(
        f"{BASE_URL}/auth/login/",
        json={
            "email": "admin@vedavidyalaya.edu.in",
            "password": "School@123"
        },
        headers=headers
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return
    
    token = login_response.json()['access']
    print(f"✅ Login successful")
    print(f"Token: {token[:50]}...")
    
    # Update headers with auth token
    auth_headers = {
        **headers,
        "Authorization": f"Bearer {token}"
    }
    
    print("\n" + "=" * 70)
    print("TESTING DASHBOARD ENDPOINTS")
    print("=" * 70)
    
    endpoints = [
        ("Students", f"{BASE_URL}/students/", {"page_size": 1}),
        ("Staff", f"{BASE_URL}/staff/", {"page_size": 1}),
        ("Teachers", f"{BASE_URL}/staff/", {"page_size": 1, "designation": "TEACHER"}),
        ("Attendance", f"{BASE_URL}/attendance/student-attendance/", {"page_size": 1}),
        ("Fees", f"{BASE_URL}/finance/student-fees/", {"page_size": 1}),
        ("Exams", f"{BASE_URL}/examinations/exams/", {"page_size": 1}),
    ]
    
    for name, url, params in endpoints:
        print(f"\n{name}:")
        print(f"  URL: {url}")
        print(f"  Params: {params}")
        
        try:
            response = requests.get(url, headers=auth_headers, params=params)
            print(f"  Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict):
                    count = data.get('count', 'N/A')
                    results = len(data.get('results', []))
                    print(f"  ✅ Success - Count: {count}, Results: {results}")
                else:
                    print(f"  ✅ Success - Data: {type(data)}")
            else:
                print(f"  ❌ Error: {response.text[:200]}")
                
        except Exception as e:
            print(f"  ❌ Exception: {str(e)}")

if __name__ == "__main__":
    test_dashboard_endpoints()
