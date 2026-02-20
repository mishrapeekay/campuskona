import requests

def test_public_list():
    url = "https://www.campuskona.com/api/v1/tenants/public/list/"
    try:
        res = requests.get(url)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            results = data.get('results', data) if isinstance(data, dict) else data
            print(f"Number of tenants: {len(results)}")
            for t in results:
                print(f" - {t.get('subdomain')} | {t.get('school_name')} | Active: {t.get('is_active')}")
        else:
            print(res.text[:500])
    except Exception as e:
        print(f"Error: {e}")

test_public_list()
