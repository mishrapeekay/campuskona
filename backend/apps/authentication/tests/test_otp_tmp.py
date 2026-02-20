
from django.test import TestCase, Client
from apps.authentication.models import User, OTPToken
from django.urls import reverse
import json

class OTPTest(TestCase):
    def test_otp_request(self):
        client = Client()
        # Create a user first
        user = User.objects.create(
            email="test@example.com",
            phone="8770682573",
            first_name="Test",
            last_name="User",
            is_active=True
        )
        
        # Request OTP
        try:
            url = reverse('authentication:otp-request')
        except:
            url = "/api/v1/auth/otp/request/"
            print("Reverse failed for authentication:otp-request")
            
        print(f"Target URL: {url}")
        response = client.post(url, data=json.dumps({"phone": "8770682573"}), content_type="application/json")
        print(f"Response Status: {response.status_code}")
        print(f"Response Data: {response.content}")
        
        # Check if OTPToken was created
        token_count = OTPToken.objects.count()
        print(f"OTP Tokens in DB: {token_count}")
        
        if token_count > 0:
            token = OTPToken.objects.first()
            print(f"Token Phone: {token.phone}")
