"""MSG91 SMS Service for CampusKona (Workstream B)."""
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class MSG91Service:
    """SMS integration via MSG91 API."""

    BASE_URL = "https://api.msg91.com/api/v5"

    def __init__(self):
        self.auth_key = getattr(settings, 'MSG91_AUTH_KEY', '')
        self.sender_id = getattr(settings, 'MSG91_SENDER_ID', 'CAMPUS')
        self.otp_template_id = getattr(settings, 'MSG91_OTP_TEMPLATE_ID', '')

    def _headers(self):
        return {
            'authkey': self.auth_key,
            'Content-Type': 'application/json',
        }

    def _format_phone(self, phone: str) -> str:
        """Normalize phone to 91XXXXXXXXXX format."""
        phone = str(phone).strip().replace(' ', '').replace('-', '').replace('+', '')
        if phone.startswith('91') and len(phone) == 12:
            return phone
        if len(phone) == 10:
            return f'91{phone}'
        return phone

    def send_sms(self, phone: str, message: str, template_id: str = None) -> dict:
        """Send a single SMS via MSG91."""
        if not self.auth_key:
            logger.warning("MSG91_AUTH_KEY not configured, skipping SMS to %s", phone)
            return {'success': False, 'error': 'MSG91 not configured'}

        phone = self._format_phone(phone)
        payload = {
            'sender': self.sender_id,
            'route': '4',  # Transactional
            'country': '91',
            'sms': [{'message': message, 'to': [phone]}],
        }
        if template_id:
            payload['template_id'] = template_id

        try:
            response = requests.post(
                f"{self.BASE_URL}/flow/",
                json=payload,
                headers=self._headers(),
                timeout=10,
            )
            data = response.json()
            logger.info("SMS sent to %s: %s", phone, data)
            return {'success': True, 'data': data}
        except Exception as e:
            logger.error("SMS send failed to %s: %s", phone, str(e))
            return {'success': False, 'error': str(e)}

    def send_otp(self, phone: str, otp: str = None) -> dict:
        """Send OTP via MSG91 OTP API."""
        if not self.auth_key:
            logger.warning("MSG91_AUTH_KEY not configured, skipping OTP to %s", phone)
            return {'success': False, 'error': 'MSG91 not configured'}

        phone = self._format_phone(phone)
        params = {
            'authkey': self.auth_key,
            'mobile': phone,
            'template_id': self.otp_template_id,
        }
        if otp:
            params['otp'] = otp

        try:
            response = requests.get(
                "https://api.msg91.com/api/v5/otp",
                params=params,
                timeout=10,
            )
            data = response.json()
            logger.info("OTP sent to %s: %s", phone, data)
            return {'success': True, 'data': data}
        except Exception as e:
            logger.error("OTP send failed to %s: %s", phone, str(e))
            return {'success': False, 'error': str(e)}

    def verify_otp(self, phone: str, otp: str) -> dict:
        """Verify OTP via MSG91."""
        if not self.auth_key:
            return {'success': False, 'error': 'MSG91 not configured'}

        phone = self._format_phone(phone)
        params = {
            'authkey': self.auth_key,
            'mobile': phone,
            'otp': otp,
        }
        try:
            response = requests.get(
                "https://api.msg91.com/api/v5/otp/verify",
                params=params,
                timeout=10,
            )
            data = response.json()
            success = data.get('type') == 'success'
            return {'success': success, 'data': data}
        except Exception as e:
            logger.error("OTP verify failed for %s: %s", phone, str(e))
            return {'success': False, 'error': str(e)}

    def send_bulk_sms(self, recipients: list) -> dict:
        """Send bulk SMS. recipients = [{'phone': '...', 'message': '...'}]"""
        if not self.auth_key:
            return {'success': False, 'error': 'MSG91 not configured'}

        sms_list = [
            {'message': r['message'], 'to': [self._format_phone(r['phone'])]}
            for r in recipients if r.get('phone') and r.get('message')
        ]
        if not sms_list:
            return {'success': False, 'error': 'No valid recipients'}

        payload = {
            'sender': self.sender_id,
            'route': '4',
            'country': '91',
            'sms': sms_list,
        }
        try:
            response = requests.post(
                f"{self.BASE_URL}/flow/",
                json=payload,
                headers=self._headers(),
                timeout=30,
            )
            data = response.json()
            return {'success': True, 'data': data, 'count': len(sms_list)}
        except Exception as e:
            logger.error("Bulk SMS failed: %s", str(e))
            return {'success': False, 'error': str(e)}


sms_service = MSG91Service()
