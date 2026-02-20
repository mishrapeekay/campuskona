
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.conf import settings
from apps.communication.services.sms_service import sms_service

def test_msg91_config():
    print("--- MSG91 Configuration Test ---")
    
    auth_key = getattr(settings, 'MSG91_AUTH_KEY', None)
    otp_template = getattr(settings, 'MSG91_OTP_TEMPLATE_ID', None)
    
    print(f"AUTH_KEY: {'[SET]' if auth_key else '[MISSING]'}")
    print(f"OTP_TEMPLATE_ID: {'[SET]' if otp_template else '[MISSING]'}")
    
    if not auth_key or not otp_template:
        print("\nERROR: Configuration missing in .env file.")
        return

    test_phone = input("\nEnter a 10-digit phone number to send a TEST OTP: ")
    if len(test_phone) != 10:
        print("Invalid phone number. Must be 10 digits.")
        return

    # Normalize phone
    phone_e164 = f"+91{test_phone}"
    test_otp = "123456"
    
    print(f"\nSending test OTP ({test_otp}) to {phone_e164}...")
    result = sms_service.send_otp(phone_e164, otp=test_otp)
    
    if result.get('success'):
        print("\nSUCCESS: MSG91 API accepted the request.")
        print(f"Response: {result.get('data')}")
    else:
        print("\nFAILURE: MSG91 API returned an error.")
        print(f"Error detail: {result.get('error')}")

if __name__ == "__main__":
    test_msg91_config()
