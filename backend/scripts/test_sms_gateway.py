#!/usr/bin/env python
"""
SMS Gateway Test Script
Tests SMS configuration and delivery for School Management System

Usage:
    python scripts/test_sms_gateway.py --phone +91-9876543210
    python scripts/test_sms_gateway.py --phone +1-234-567-8900 --provider twilio
"""

import os
import sys
import django
from pathlib import Path

# Setup Django
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

from django.conf import settings
from datetime import datetime
import argparse
import random


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(message):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message.center(80)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}\n")


def print_success(message):
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")


def print_error(message):
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")


def print_warning(message):
    print(f"{Colors.WARNING}⚠ {message}{Colors.ENDC}")


def print_info(message):
    print(f"{Colors.OKBLUE}ℹ {message}{Colors.ENDC}")


def check_sms_configuration():
    """Check if SMS settings are properly configured"""
    print_header("Checking SMS Configuration")

    config_ok = True

    # Check SMS_PROVIDER
    if hasattr(settings, 'SMS_PROVIDER') and settings.SMS_PROVIDER:
        print_success(f"SMS_PROVIDER: {settings.SMS_PROVIDER}")
        provider = settings.SMS_PROVIDER.lower()
    else:
        print_error("SMS_PROVIDER not configured")
        return False

    # Check Twilio configuration
    if provider == 'twilio':
        if hasattr(settings, 'TWILIO_ACCOUNT_SID') and settings.TWILIO_ACCOUNT_SID:
            masked_sid = settings.TWILIO_ACCOUNT_SID[:6] + '***' + settings.TWILIO_ACCOUNT_SID[-4:]
            print_success(f"TWILIO_ACCOUNT_SID: {masked_sid}")
        else:
            print_error("TWILIO_ACCOUNT_SID not configured")
            config_ok = False

        if hasattr(settings, 'TWILIO_AUTH_TOKEN') and settings.TWILIO_AUTH_TOKEN:
            print_success("TWILIO_AUTH_TOKEN: ****** (configured)")
        else:
            print_error("TWILIO_AUTH_TOKEN not configured")
            config_ok = False

        if hasattr(settings, 'TWILIO_PHONE_NUMBER') and settings.TWILIO_PHONE_NUMBER:
            print_success(f"TWILIO_PHONE_NUMBER: {settings.TWILIO_PHONE_NUMBER}")
        else:
            print_error("TWILIO_PHONE_NUMBER not configured")
            config_ok = False

    # Check MSG91 configuration
    elif provider == 'msg91':
        if hasattr(settings, 'MSG91_AUTH_KEY') and settings.MSG91_AUTH_KEY:
            masked_key = settings.MSG91_AUTH_KEY[:8] + '***'
            print_success(f"MSG91_AUTH_KEY: {masked_key}")
        else:
            print_error("MSG91_AUTH_KEY not configured")
            config_ok = False

        if hasattr(settings, 'MSG91_SENDER_ID') and settings.MSG91_SENDER_ID:
            print_success(f"MSG91_SENDER_ID: {settings.MSG91_SENDER_ID}")
        else:
            print_warning("MSG91_SENDER_ID not configured (optional)")

    else:
        print_error(f"Unknown SMS provider: {provider}")
        config_ok = False

    return config_ok


def test_twilio_sms(phone_number, message=None):
    """Test sending SMS via Twilio"""
    print_header("Test: Twilio SMS Delivery")

    try:
        from twilio.rest import Client

        # Initialize Twilio client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        # Default test message
        if message is None:
            message = f"Test SMS from School Management System. Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

        print_info(f"Sending SMS to: {phone_number}")
        print_info(f"From: {settings.TWILIO_PHONE_NUMBER}")
        print_info(f"Message: {message}")
        print_info("Sending...")

        # Send SMS
        msg = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number
        )

        print_success(f"SMS sent successfully!")
        print_info(f"Message SID: {msg.sid}")
        print_info(f"Status: {msg.status}")
        print_info(f"Price: {msg.price} {msg.price_unit}")

        return True

    except Exception as e:
        print_error(f"Failed to send SMS via Twilio: {str(e)}")
        return False


def test_twilio_otp(phone_number):
    """Test sending OTP SMS via Twilio"""
    print_header("Test: Twilio OTP SMS")

    try:
        from twilio.rest import Client

        # Generate random 6-digit OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])

        # OTP message template
        message = f"Your School Management System OTP is {otp}. Valid for 5 minutes. Do not share with anyone."

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        print_info(f"Sending OTP to: {phone_number}")
        print_info(f"Generated OTP: {otp}")
        print_info("Sending...")

        msg = client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number
        )

        print_success(f"OTP SMS sent successfully!")
        print_info(f"Message SID: {msg.sid}")
        print_warning(f"Check your phone for OTP: {otp}")

        return True

    except Exception as e:
        print_error(f"Failed to send OTP via Twilio: {str(e)}")
        return False


def test_msg91_sms(phone_number, message=None):
    """Test sending SMS via MSG91"""
    print_header("Test: MSG91 SMS Delivery")

    try:
        import requests

        # Default test message
        if message is None:
            message = f"Test SMS from School Management System. Time: {datetime.now().strftime('%H:%M:%S')}"

        # Remove country code for India
        if phone_number.startswith('+91'):
            phone_number = phone_number.replace('+91', '').replace('-', '').replace(' ', '')

        print_info(f"Sending SMS to: +91-{phone_number}")
        print_info(f"Message: {message}")
        print_info("Sending...")

        # MSG91 API endpoint
        url = 'https://api.msg91.com/api/v5/flow/'

        payload = {
            'authkey': settings.MSG91_AUTH_KEY,
            'mobiles': phone_number,
            'message': message,
            'sender': getattr(settings, 'MSG91_SENDER_ID', 'SCHLMS'),
            'route': getattr(settings, 'MSG91_ROUTE', '4'),
            'country': '91',
        }

        response = requests.post(url, json=payload)

        if response.status_code == 200:
            result = response.json()
            print_success(f"SMS sent successfully!")
            print_info(f"Response: {result}")
            return True
        else:
            print_error(f"Failed to send SMS. Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False

    except Exception as e:
        print_error(f"Failed to send SMS via MSG91: {str(e)}")
        return False


def test_msg91_otp(phone_number):
    """Test sending OTP SMS via MSG91"""
    print_header("Test: MSG91 OTP SMS")

    try:
        import requests

        # Generate random 6-digit OTP
        otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])

        # Remove country code for India
        if phone_number.startswith('+91'):
            phone_number = phone_number.replace('+91', '').replace('-', '').replace(' ', '')

        print_info(f"Sending OTP to: +91-{phone_number}")
        print_info(f"Generated OTP: {otp}")
        print_info("Sending...")

        # Check if template is configured
        if hasattr(settings, 'MSG91_OTP_TEMPLATE_ID'):
            # Use OTP API with template
            url = 'https://api.msg91.com/api/v5/otp'

            payload = {
                'template_id': settings.MSG91_OTP_TEMPLATE_ID,
                'mobile': phone_number,
                'authkey': settings.MSG91_AUTH_KEY,
                'otp': otp,
            }

            response = requests.post(url, json=payload)
        else:
            # Use regular SMS API
            url = 'https://api.msg91.com/api/v5/flow/'

            message = f"Your School Management System OTP is {otp}. Valid for 5 minutes. Do not share."

            payload = {
                'authkey': settings.MSG91_AUTH_KEY,
                'mobiles': phone_number,
                'message': message,
                'sender': getattr(settings, 'MSG91_SENDER_ID', 'SCHLMS'),
                'route': '4',  # Transactional route
            }

            response = requests.post(url, json=payload)

        if response.status_code == 200:
            result = response.json()
            print_success(f"OTP SMS sent successfully!")
            print_info(f"Response: {result}")
            print_warning(f"Check your phone for OTP: {otp}")
            return True
        else:
            print_error(f"Failed to send OTP. Status: {response.status_code}")
            print_error(f"Response: {response.text}")
            return False

    except Exception as e:
        print_error(f"Failed to send OTP via MSG91: {str(e)}")
        return False


def test_bulk_sms(phone_number, count=3):
    """Test sending multiple SMS (rate limiting check)"""
    print_header(f"Test: Bulk SMS ({count} messages)")

    provider = settings.SMS_PROVIDER.lower()
    success_count = 0

    try:
        for i in range(1, count + 1):
            message = f"Bulk test SMS #{i} of {count}. Time: {datetime.now().strftime('%H:%M:%S')}"

            print_info(f"Sending SMS {i}/{count}...")

            if provider == 'twilio':
                result = test_twilio_sms(phone_number, message)
            elif provider == 'msg91':
                result = test_msg91_sms(phone_number, message)
            else:
                print_error(f"Unknown provider: {provider}")
                return False

            if result:
                success_count += 1
                print_success(f"  SMS {i}/{count} sent")

        print_success(f"\nBulk SMS test completed: {success_count}/{count} sent successfully")
        return success_count == count

    except Exception as e:
        print_error(f"Bulk SMS test failed: {str(e)}")
        return False


def run_all_tests(phone_number):
    """Run all SMS tests"""
    print_header("SMS Gateway Test Suite")
    print_info(f"Testing SMS delivery to: {phone_number}")
    print_info(f"Date/Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Check configuration first
    if not check_sms_configuration():
        print_error("\n❌ SMS configuration is incomplete!")
        print_warning("Please check your .env file and ensure all SMS settings are configured.")
        return

    provider = settings.SMS_PROVIDER.lower()

    # Run tests based on provider
    results = {}

    if provider == 'twilio':
        results['simple_sms'] = test_twilio_sms(phone_number)
        results['otp_sms'] = test_twilio_otp(phone_number)
        results['bulk_sms'] = test_bulk_sms(phone_number, count=3)

    elif provider == 'msg91':
        results['simple_sms'] = test_msg91_sms(phone_number)
        results['otp_sms'] = test_msg91_otp(phone_number)
        results['bulk_sms'] = test_bulk_sms(phone_number, count=3)

    # Summary
    print_header("Test Results Summary")

    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result)
    failed_tests = total_tests - passed_tests

    print(f"\nTotal Tests: {total_tests}")
    print_success(f"Passed: {passed_tests}")

    if failed_tests > 0:
        print_error(f"Failed: {failed_tests}")

    print("\nDetailed Results:")
    for test_name, result in results.items():
        status = "✓ PASSED" if result else "✗ FAILED"
        color = Colors.OKGREEN if result else Colors.FAIL
        print(f"  {color}{status}{Colors.ENDC} - {test_name.replace('_', ' ').title()}")

    if passed_tests == total_tests:
        print_success("\n🎉 All SMS tests passed! Your SMS gateway is properly configured.")
    else:
        print_error(f"\n⚠️ {failed_tests} test(s) failed. Please check your SMS configuration.")

    print_info(f"\n💡 Check your phone at {phone_number} for test messages.")


def main():
    parser = argparse.ArgumentParser(
        description='Test SMS gateway configuration for School Management System'
    )
    parser.add_argument(
        '--phone',
        '-p',
        type=str,
        required=True,
        help='Phone number to send test SMS to (include country code, e.g., +91-9876543210)'
    )
    parser.add_argument(
        '--test',
        '-t',
        type=str,
        choices=['simple', 'otp', 'bulk', 'all'],
        default='all',
        help='Specific test to run (default: all)'
    )

    args = parser.parse_args()

    # Validate phone number format
    phone = args.phone.strip()
    if not phone.startswith('+'):
        print_warning(f"Phone number should include country code (e.g., +91-{phone})")
        phone = '+91-' + phone

    if args.test == 'all':
        run_all_tests(phone)
    else:
        check_sms_configuration()

        provider = settings.SMS_PROVIDER.lower()

        if args.test == 'simple':
            if provider == 'twilio':
                test_twilio_sms(phone)
            elif provider == 'msg91':
                test_msg91_sms(phone)

        elif args.test == 'otp':
            if provider == 'twilio':
                test_twilio_otp(phone)
            elif provider == 'msg91':
                test_msg91_otp(phone)

        elif args.test == 'bulk':
            test_bulk_sms(phone, count=3)


if __name__ == '__main__':
    main()
