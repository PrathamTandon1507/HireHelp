import requests
import json

BASE_URL = "http://localhost:8000"

def test():
    print(f"Testing connectivity to {BASE_URL}...")
    try:
        # 1. Test registration
        data = {
            "email": "diagnostic@test.com",
            "full_name": "Diagnostic User",
            "password": "Password123!",
            "role": "applicant"
        }
        resp = requests.post(f"{BASE_URL}/auth/register", json=data)
        print(f"REGISTER: Status {resp.status_code}")
        print(f"RESPONSE: {resp.text}")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test()
