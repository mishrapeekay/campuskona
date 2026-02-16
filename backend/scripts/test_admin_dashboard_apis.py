"""
Test script to verify all Admin Dashboard API endpoints
"""
import requests
import json
from datetime import date

BASE_URL = "http://127.0.0.1:8000/api/v1"
HEADERS = {
    "Content-Type": "application/json",
    "X-Tenant-Subdomain": "veda"
}

# Login first to get token
def login():
    response = requests.post(
        f"{BASE_URL}/auth/login/",
        json={
            "email": "vv-adm-2021-0502@vedavidyalaya.edu.in",
            "password": "School@123"
        },
        headers=HEADERS
    )
    if response.status_code == 200:
        token = response.json()['access']
        return token
    else:
        print(f"Login failed: {response.status_code}")
        return None

def test_endpoint(name, url, token, params=None):
    """Test a GET endpoint"""
    headers = {**HEADERS, "Authorization": f"Bearer {token}"}
    try:
        response = requests.get(url, headers=headers, params=params)
        status = "✅" if response.status_code == 200 else "❌"
        data = response.json() if response.status_code == 200 else response.text
        count = data.get('count', 'N/A') if isinstance(data, dict) else 'N/A'
        print(f"{status} {name}: Status {response.status_code}, Count: {count}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ {name}: Error - {str(e)}")
        return False

def main():
    print("=" * 70)
    print("ADMIN DASHBOARD API VERIFICATION")
    print("=" * 70)
    
    # Login
    print("\n1. Authentication")
    token = login()
    if not token:
        print("Cannot proceed without authentication")
        return
    print("✅ Login successful")
    
    # Test all endpoints used by Admin Dashboard
    print("\n2. Dashboard Statistics Endpoints")
    print("-" * 70)
    
    endpoints = [
        ("Students List", f"{BASE_URL}/students/", {"page_size": 1}),
        ("Staff/Teachers List", f"{BASE_URL}/staff/", {"page_size": 1, "designation": "TEACHER"}),
        ("Attendance Today", f"{BASE_URL}/attendance/student-attendance/", {
            "date": date.today().isoformat(),
            "status": "PRESENT",
            "page_size": 1
        }),
        ("Pending Fees", f"{BASE_URL}/finance/student-fees/", {
            "status": "PENDING",
            "page_size": 1
        }),
        ("Upcoming Exams", f"{BASE_URL}/examinations/exams/", {
            "date_from": date.today().isoformat(),
            "page_size": 1
        }),
    ]
    
    results = {}
    for name, url, params in endpoints:
        results[name] = test_endpoint(name, url, token, params)
    
    # Test additional module endpoints
    print("\n3. Additional Module Endpoints")
    print("-" * 70)
    
    additional_endpoints = [
        ("Classes", f"{BASE_URL}/academics/classes/", {}),
        ("Sections", f"{BASE_URL}/academics/sections/", {}),
        ("Subjects", f"{BASE_URL}/academics/subjects/", {}),
        ("Academic Years", f"{BASE_URL}/academics/academic-years/", {}),
        ("Timetable", f"{BASE_URL}/timetable/class-timetable/", {}),
        ("Notices", f"{BASE_URL}/communication/notices/", {}),
        ("Events", f"{BASE_URL}/communication/events/", {}),
        ("Library Books", f"{BASE_URL}/library/books/", {"page_size": 1}),
        ("Transport Routes", f"{BASE_URL}/transport/routes/", {}),
    ]
    
    for name, url, params in additional_endpoints:
        results[name] = test_endpoint(name, url, token, params)
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    failed = total - passed
    
    print(f"Total Endpoints: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    if failed > 0:
        print("\nFailed Endpoints:")
        for name, success in results.items():
            if not success:
                print(f"  - {name}")

if __name__ == "__main__":
    main()
