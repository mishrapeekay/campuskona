import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_login(tenant_subdomain, email, password):
    """Test login for a specific tenant"""
    print(f"\n{'='*70}")
    print(f"Testing Login: {tenant_subdomain}")
    print(f"{'='*70}")
    print(f"Email: {email}")
    print(f"Tenant: {tenant_subdomain}")
    
    headers = {
        "Content-Type": "application/json",
        "X-Tenant-Subdomain": tenant_subdomain
    }
    
    data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login/",
            json=data,
            headers=headers
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ LOGIN SUCCESSFUL")
            print(f"User: {result['user']['first_name']} {result['user']['last_name']}")
            print(f"Type: {result['user']['user_type']}")
            print(f"Token: {result['access'][:50]}...")
            return True
        else:
            print("❌ LOGIN FAILED")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    print("="*70)
    print("ADMIN LOGIN TESTING")
    print("="*70)
    
    # Test cases
    test_cases = [
        ("demo", "admin@demohighschool.edu.in", "School@123"),
        ("demo", "pooja.desai@schoolname.edu.in", "School@123"),
        ("veda", "admin@vedavidyalaya.edu.in", "School@123"),
        ("veda", "vv-emp-0001@vedavidyalaya.edu.in", "School@123"),
    ]
    
    results = []
    for tenant, email, password in test_cases:
        success = test_login(tenant, email, password)
        results.append((tenant, email, success))
    
    # Summary
    print(f"\n{'='*70}")
    print("SUMMARY")
    print(f"{'='*70}")
    for tenant, email, success in results:
        status = "✅" if success else "❌"
        print(f"{status} {tenant:10} - {email}")
    
    passed = sum(1 for _, _, s in results if s)
    print(f"\nTotal: {len(results)} | Passed: {passed} | Failed: {len(results) - passed}")

if __name__ == "__main__":
    main()
