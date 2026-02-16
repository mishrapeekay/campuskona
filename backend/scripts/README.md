# Test Scripts - School Management System

This directory contains testing scripts for verifying email and SMS gateway configuration.

## Available Scripts

### 1. Email Gateway Test (`test_email_gateway.py`)

Tests email delivery for OTP verification and notifications.

**Usage:**
```bash
# Test all email features
python scripts/test_email_gateway.py --recipient your-email@example.com

# Test specific feature
python scripts/test_email_gateway.py --recipient your-email@example.com --test otp
```

**Available Tests:**
- `simple` - Simple text email
- `html` - HTML formatted email
- `otp` - OTP verification email (DPDP consent workflow)
- `attachment` - Email with attachment
- `bulk` - Bulk email sending (rate limit test)
- `all` - Run all tests (default)

**Example Output:**
```
================================================================================
                    Checking Email Configuration
================================================================================

✓ EMAIL_BACKEND: django.core.mail.backends.smtp.EmailBackend
✓ EMAIL_HOST: smtp.sendgrid.net
✓ EMAIL_PORT: 587
✓ EMAIL_USE_TLS: True
✓ EMAIL_HOST_USER: api***
✓ EMAIL_HOST_PASSWORD: ****** (configured)
✓ DEFAULT_FROM_EMAIL: School Management System <noreply@yourdomain.com>

================================================================================
                    Test 1: Simple Text Email
================================================================================

ℹ Sending email to: your-email@example.com
ℹ From: School Management System <noreply@yourdomain.com>
ℹ Subject: Test Email from School Management System
✓ Simple text email sent successfully!
```

---

### 2. SMS Gateway Test (`test_sms_gateway.py`)

Tests SMS delivery for OTP verification.

**Usage:**
```bash
# Test all SMS features
python scripts/test_sms_gateway.py --phone +91-9876543210

# Test specific feature
python scripts/test_sms_gateway.py --phone +91-9876543210 --test otp
```

**Available Tests:**
- `simple` - Simple text SMS
- `otp` - OTP verification SMS (DPDP consent workflow)
- `bulk` - Bulk SMS sending (rate limit test)
- `all` - Run all tests (default)

**Example Output:**
```
================================================================================
                    Checking SMS Configuration
================================================================================

✓ SMS_PROVIDER: twilio
✓ TWILIO_ACCOUNT_SID: AC1234***7890
✓ TWILIO_AUTH_TOKEN: ****** (configured)
✓ TWILIO_PHONE_NUMBER: +1234567890

================================================================================
                    Test: Twilio OTP SMS
================================================================================

ℹ Sending OTP to: +91-9876543210
ℹ Generated OTP: 123456
ℹ Sending...
✓ OTP SMS sent successfully!
ℹ Message SID: SM1234567890abcdef
⚠ Check your phone for OTP: 123456
```

---

### 3. Quick Gateway Test (`quick_gateway_test.sh`)

Interactive script that tests both email and SMS gateways.

**Usage:**
```bash
# On Linux/Mac
bash scripts/quick_gateway_test.sh

# On Windows (Git Bash)
bash scripts/quick_gateway_test.sh
```

**Interactive Prompts:**
1. Enter email address for testing
2. Enter phone number for SMS testing
3. Script runs all tests automatically

---

## Prerequisites

### For Email Testing

**Option 1: Gmail**
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
DEFAULT_FROM_EMAIL=School Management System <your-email@gmail.com>
```

**Option 2: SendGrid**
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.your-sendgrid-api-key
DEFAULT_FROM_EMAIL=School Management System <noreply@yourdomain.com>
```

**Option 3: AWS SES**
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-smtp-username
EMAIL_HOST_PASSWORD=your-smtp-password
DEFAULT_FROM_EMAIL=School Management System <noreply@yourdomain.com>
```

### For SMS Testing

**Option 1: Twilio**
```bash
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**Option 2: MSG91 (India)**
```bash
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your-msg91-auth-key
MSG91_SENDER_ID=SCHLMS
MSG91_ROUTE=4
```

---

## Installation

### 1. Install Python Dependencies

```bash
# For email testing (already included in requirements.txt)
pip install django

# For SMS testing - Twilio
pip install twilio

# For SMS testing - MSG91
pip install requests
```

### 2. Configure Environment

```bash
# Copy template
cp .env.production.template .env

# Edit .env file with your credentials
nano .env
```

### 3. Run Tests

```bash
# Email test
python scripts/test_email_gateway.py --recipient your-email@example.com

# SMS test
python scripts/test_sms_gateway.py --phone +91-9876543210

# Or use quick test
bash scripts/quick_gateway_test.sh
```

---

## Troubleshooting

### Email Issues

**Problem: Emails not received**
- Check spam/junk folder
- Verify email credentials in .env
- Check SendGrid/Gmail account status
- Verify domain authentication (SPF, DKIM)

**Problem: SMTPAuthenticationError**
- Gmail: Use app-specific password, not account password
- SendGrid: Use `apikey` as username
- AWS SES: Use SMTP credentials, not IAM credentials

**Problem: Connection refused**
- Check firewall allows outbound port 587
- Try port 465 (SSL) instead of 587 (TLS)
- Verify EMAIL_HOST is correct

### SMS Issues

**Problem: SMS not received**
- Verify phone number format (+country code)
- Check Twilio/MSG91 account balance
- Check DND status (India)
- Verify sender ID is approved (MSG91)

**Problem: Authentication failed**
- Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
- Check MSG91_AUTH_KEY
- Regenerate credentials if compromised

**Problem: High delivery delays**
- Check provider status page
- Verify transactional route (not promotional)
- Contact provider support

---

## Best Practices

### Email Testing

1. **Test all email clients:**
   - Gmail
   - Outlook
   - Apple Mail
   - Mobile devices

2. **Monitor metrics:**
   - Open rate (> 20%)
   - Bounce rate (< 5%)
   - Spam complaint rate (< 0.1%)

3. **Use consistent sender:**
   - Same FROM address
   - Same domain
   - Warm up new IPs gradually

### SMS Testing

1. **Test different scenarios:**
   - Valid numbers
   - Invalid numbers
   - International numbers
   - DND numbers (India)

2. **Monitor delivery:**
   - Delivery rate (> 95%)
   - Delivery time (< 10 seconds)
   - Error rates

3. **Implement rate limiting:**
   - Max 5 OTPs per phone per hour
   - Block after failed attempts
   - Use CAPTCHA

---

## Security Considerations

### Email Security

1. **Never log credentials:**
   - Email passwords
   - API keys
   - SMTP passwords

2. **Use environment variables:**
   - Store in .env file
   - Never commit to git
   - Use secrets manager in production

3. **Monitor for abuse:**
   - Track send rates
   - Alert on failures
   - Log all sends

### SMS Security

1. **Protect OTPs:**
   - 6-digit numeric
   - 5-minute expiry
   - Single-use only
   - Rate limiting

2. **Validate phone numbers:**
   - Format validation
   - Country code verification
   - Check against blacklist

3. **Audit trail:**
   - Log all SMS sends
   - Track delivery status
   - Monitor for patterns

---

## Support

For issues with test scripts:
1. Check configuration in .env file
2. Review error messages in output
3. Check provider status pages
4. Refer to EMAIL_SMS_GATEWAY_CONFIGURATION_GUIDE.md

For provider-specific issues:
- **SendGrid:** https://sendgrid.com/docs
- **Twilio:** https://www.twilio.com/docs
- **MSG91:** https://docs.msg91.com
- **AWS SES:** https://docs.aws.amazon.com/ses

---

## Next Steps

After successful testing:

1. ✅ Verify email delivery (check spam folder)
2. ✅ Verify SMS delivery
3. ✅ Test OTP workflow end-to-end
4. ✅ Update production .env with working credentials
5. ✅ Sign Data Processing Agreements with providers
6. ✅ Proceed to User Acceptance Testing

---

**Last Updated:** January 2026
**Version:** 1.0
**Status:** Production-Ready
