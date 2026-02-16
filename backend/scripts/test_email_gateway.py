#!/usr/bin/env python
"""
Email Gateway Test Script
Tests email configuration and delivery for School Management System

Usage:
    python scripts/test_email_gateway.py
    python scripts/test_email_gateway.py --recipient your-email@example.com
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

from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
from datetime import datetime
import argparse


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


def check_email_configuration():
    """Check if email settings are properly configured"""
    print_header("Checking Email Configuration")

    config_ok = True

    # Check EMAIL_BACKEND
    if hasattr(settings, 'EMAIL_BACKEND'):
        print_success(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")

        if 'console' in settings.EMAIL_BACKEND.lower():
            print_warning("Using console backend - emails will print to console, not actually send")
    else:
        print_error("EMAIL_BACKEND not configured")
        config_ok = False

    # Check EMAIL_HOST
    if hasattr(settings, 'EMAIL_HOST') and settings.EMAIL_HOST:
        print_success(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    else:
        print_error("EMAIL_HOST not configured")
        config_ok = False

    # Check EMAIL_PORT
    if hasattr(settings, 'EMAIL_PORT'):
        print_success(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    else:
        print_warning("EMAIL_PORT not configured (using default)")

    # Check EMAIL_USE_TLS
    if hasattr(settings, 'EMAIL_USE_TLS'):
        print_success(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    else:
        print_warning("EMAIL_USE_TLS not configured")

    # Check EMAIL_HOST_USER
    if hasattr(settings, 'EMAIL_HOST_USER') and settings.EMAIL_HOST_USER:
        masked_user = settings.EMAIL_HOST_USER[:3] + '***' + settings.EMAIL_HOST_USER[-3:]
        print_success(f"EMAIL_HOST_USER: {masked_user}")
    else:
        print_error("EMAIL_HOST_USER not configured")
        config_ok = False

    # Check EMAIL_HOST_PASSWORD
    if hasattr(settings, 'EMAIL_HOST_PASSWORD') and settings.EMAIL_HOST_PASSWORD:
        print_success(f"EMAIL_HOST_PASSWORD: ****** (configured)")
    else:
        print_error("EMAIL_HOST_PASSWORD not configured")
        config_ok = False

    # Check DEFAULT_FROM_EMAIL
    if hasattr(settings, 'DEFAULT_FROM_EMAIL') and settings.DEFAULT_FROM_EMAIL:
        print_success(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    else:
        print_warning("DEFAULT_FROM_EMAIL not configured (using default)")

    return config_ok


def test_simple_email(recipient):
    """Test sending a simple text email"""
    print_header("Test 1: Simple Text Email")

    try:
        subject = 'Test Email from School Management System'
        message = f'''
Hello,

This is a test email from the School Management System.

Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

If you received this email, your email configuration is working correctly!

Best regards,
School Management System Team
        '''.strip()

        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [recipient]

        print_info(f"Sending email to: {recipient}")
        print_info(f"From: {from_email}")
        print_info(f"Subject: {subject}")

        send_mail(
            subject,
            message,
            from_email,
            recipient_list,
            fail_silently=False,
        )

        print_success("Simple text email sent successfully!")
        return True

    except Exception as e:
        print_error(f"Failed to send simple email: {str(e)}")
        return False


def test_html_email(recipient):
    """Test sending an HTML email"""
    print_header("Test 2: HTML Email")

    try:
        subject = 'HTML Test Email from School Management System'

        html_content = f'''
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }}
        .header {{
            background-color: #3b82f6;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            padding: 20px;
            background-color: #f9fafb;
        }}
        .footer {{
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #666;
        }}
        .success {{
            color: #10b981;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>School Management System</h1>
            <p>Email Configuration Test</p>
        </div>
        <div class="content">
            <h2>✅ HTML Email Test</h2>
            <p>Hello,</p>
            <p>This is a <strong>HTML test email</strong> from the School Management System.</p>
            <p class="success">If you can see this formatted email, your HTML email rendering is working!</p>
            <p><strong>Timestamp:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <hr>
            <h3>Email Features Working:</h3>
            <ul>
                <li>✓ HTML formatting</li>
                <li>✓ CSS styling</li>
                <li>✓ Colors and fonts</li>
                <li>✓ Responsive design</li>
            </ul>
        </div>
        <div class="footer">
            <p>© 2026 School Management System. All rights reserved.</p>
            <p>This is an automated test email.</p>
        </div>
    </div>
</body>
</html>
        '''

        text_content = f'''
School Management System - HTML Email Test

If you received this email, your email configuration is working!

Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

(Note: You are seeing the plain text version. Enable HTML to see the formatted version.)

Best regards,
School Management System Team
        '''.strip()

        email = EmailMessage(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
        )
        email.content_subtype = 'html'
        email.body = html_content

        print_info(f"Sending HTML email to: {recipient}")
        email.send(fail_silently=False)

        print_success("HTML email sent successfully!")
        return True

    except Exception as e:
        print_error(f"Failed to send HTML email: {str(e)}")
        return False


def test_otp_email(recipient):
    """Test sending an OTP email (like the one used for consent)"""
    print_header("Test 3: OTP Email (Parental Consent)")

    try:
        otp = '123456'
        parent_name = 'Test Parent'
        student_name = 'Test Student'
        purpose = 'Academic Performance Tracking'

        subject = 'Verify Your Consent - School Management System'

        html_content = f'''
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #3b82f6;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }}
        .content {{
            padding: 30px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
        }}
        .otp-box {{
            background-color: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 5px;
        }}
        .otp-code {{
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #d97706;
            font-family: monospace;
        }}
        .warning {{
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
        }}
        .footer {{
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #6b7280;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ Parental Consent Verification</h1>
        </div>
        <div class="content">
            <p>Dear {parent_name},</p>

            <p>You are granting consent for processing your child <strong>{student_name}'s</strong> personal data for the following purpose:</p>

            <p><strong>Purpose:</strong> {purpose}</p>

            <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #78716c;">Your Verification Code</p>
                <div class="otp-code">{otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #78716c;">Valid for 5 minutes</p>
            </div>

            <p>Please enter this code in the consent form to complete the verification process.</p>

            <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Never share this code with anyone</li>
                    <li>School staff will never ask for this code</li>
                    <li>This code expires in 5 minutes</li>
                    <li>If you didn't request this, please ignore this email</li>
                </ul>
            </div>

            <p style="margin-top: 30px;">This is a DPDP Act 2023 compliant parental consent verification process.</p>
        </div>
        <div class="footer">
            <p>© 2026 School Management System. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
        '''

        text_content = f'''
Dear {parent_name},

PARENTAL CONSENT VERIFICATION

You are granting consent for processing your child {student_name}'s personal data for:

Purpose: {purpose}

Your Verification Code: {otp}

Valid for: 5 minutes

Please enter this code in the consent form to complete verification.

SECURITY NOTICE:
- Never share this code with anyone
- School staff will never ask for this code
- This code expires in 5 minutes
- If you didn't request this, please ignore this email

This is a DPDP Act 2023 compliant verification process.

© 2026 School Management System
        '''.strip()

        email = EmailMessage(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
        )
        email.content_subtype = 'html'
        email.body = html_content

        print_info(f"Sending OTP email to: {recipient}")
        print_info(f"Test OTP: {otp}")
        email.send(fail_silently=False)

        print_success("OTP email sent successfully!")
        print_warning(f"Check your inbox for OTP: {otp}")
        return True

    except Exception as e:
        print_error(f"Failed to send OTP email: {str(e)}")
        return False


def test_attachment_email(recipient):
    """Test sending an email with attachment"""
    print_header("Test 4: Email with Attachment")

    try:
        import io

        subject = 'Test Email with Attachment - School Management System'
        message = 'This email contains a test attachment.'

        # Create a simple text file as attachment
        attachment_content = f'''
School Management System - Test Attachment

This is a test file attached to verify that email attachments work correctly.

Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Features being tested:
1. Email delivery
2. Attachment handling
3. File download capability

If you can download and read this file, attachments are working!
        '''.strip()

        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
        )

        # Add attachment
        email.attach('test_attachment.txt', attachment_content, 'text/plain')

        print_info(f"Sending email with attachment to: {recipient}")
        email.send(fail_silently=False)

        print_success("Email with attachment sent successfully!")
        return True

    except Exception as e:
        print_error(f"Failed to send email with attachment: {str(e)}")
        return False


def test_bulk_email(recipient):
    """Test sending multiple emails (rate limiting check)"""
    print_header("Test 5: Bulk Email (Rate Limiting)")

    try:
        num_emails = 5
        print_info(f"Sending {num_emails} emails to test bulk sending and rate limits...")

        for i in range(1, num_emails + 1):
            subject = f'Bulk Test Email #{i} - School Management System'
            message = f'''
This is bulk test email #{i} of {num_emails}.

Testing email rate limits and bulk sending capability.

Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
            '''.strip()

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [recipient],
                fail_silently=False,
            )

            print_success(f"  Email {i}/{num_emails} sent")

        print_success(f"All {num_emails} bulk emails sent successfully!")
        return True

    except Exception as e:
        print_error(f"Failed to send bulk emails: {str(e)}")
        return False


def run_all_tests(recipient):
    """Run all email tests"""
    print_header("Email Gateway Test Suite")
    print_info(f"Testing email delivery to: {recipient}")
    print_info(f"Date/Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Check configuration first
    if not check_email_configuration():
        print_error("\n❌ Email configuration is incomplete!")
        print_warning("Please check your .env file and ensure all email settings are configured.")
        print_info("\nRequired settings:")
        print_info("  - EMAIL_BACKEND")
        print_info("  - EMAIL_HOST")
        print_info("  - EMAIL_PORT")
        print_info("  - EMAIL_HOST_USER")
        print_info("  - EMAIL_HOST_PASSWORD")
        print_info("  - DEFAULT_FROM_EMAIL")
        return

    # Run tests
    results = {
        'simple_email': test_simple_email(recipient),
        'html_email': test_html_email(recipient),
        'otp_email': test_otp_email(recipient),
        'attachment_email': test_attachment_email(recipient),
        'bulk_email': test_bulk_email(recipient),
    }

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
        print_success("\n🎉 All email tests passed! Your email gateway is properly configured.")
    else:
        print_error(f"\n⚠️ {failed_tests} test(s) failed. Please check your email configuration.")

    print_info(f"\n💡 Check your inbox at {recipient} for test emails.")


def main():
    parser = argparse.ArgumentParser(
        description='Test email gateway configuration for School Management System'
    )
    parser.add_argument(
        '--recipient',
        '-r',
        type=str,
        default='test@example.com',
        help='Email address to send test emails to (default: test@example.com)'
    )
    parser.add_argument(
        '--test',
        '-t',
        type=str,
        choices=['simple', 'html', 'otp', 'attachment', 'bulk', 'all'],
        default='all',
        help='Specific test to run (default: all)'
    )

    args = parser.parse_args()

    if args.test == 'all':
        run_all_tests(args.recipient)
    else:
        check_email_configuration()

        if args.test == 'simple':
            test_simple_email(args.recipient)
        elif args.test == 'html':
            test_html_email(args.recipient)
        elif args.test == 'otp':
            test_otp_email(args.recipient)
        elif args.test == 'attachment':
            test_attachment_email(args.recipient)
        elif args.test == 'bulk':
            test_bulk_email(args.recipient)


if __name__ == '__main__':
    main()
