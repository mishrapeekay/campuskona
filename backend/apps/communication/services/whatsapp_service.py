"""MSG91 WhatsApp Business API Service for CampusKona (Workstream B)."""
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class WhatsAppService:
    """WhatsApp Business API integration via MSG91."""

    BASE_URL = "https://api.msg91.com/api/v5/whatsapp"

    def __init__(self):
        self.auth_key = getattr(settings, 'MSG91_AUTH_KEY', '')
        self.whatsapp_number = getattr(settings, 'MSG91_WHATSAPP_NUMBER', '')

    def _headers(self):
        return {
            'authkey': self.auth_key,
            'Content-Type': 'application/json',
        }

    def _format_phone(self, phone: str) -> str:
        phone = str(phone).strip().replace(' ', '').replace('-', '').replace('+', '')
        if phone.startswith('91') and len(phone) == 12:
            return phone
        if len(phone) == 10:
            return f'91{phone}'
        return phone

    def send_template_message(self, phone: str, template_name: str, variables: dict) -> dict:
        """Send a WhatsApp template message."""
        if not self.auth_key or not self.whatsapp_number:
            logger.warning("MSG91 WhatsApp not configured, skipping message to %s", phone)
            return {'success': False, 'error': 'WhatsApp not configured'}

        phone = self._format_phone(phone)
        params = [{'type': 'text', 'text': str(v)} for v in variables.values()]
        payload = {
            'integrated_number': self.whatsapp_number,
            'content_type': 'template',
            'payload': {
                'to': phone,
                'type': 'template',
                'template': {
                    'name': template_name,
                    'language': {'code': 'en'},
                    'components': [{'type': 'body', 'parameters': params}] if params else [],
                },
            },
        }
        try:
            response = requests.post(
                f"{self.BASE_URL}/whatsapp-outbound-message/bulk/",
                json=payload,
                headers=self._headers(),
                timeout=10,
            )
            data = response.json()
            logger.info("WhatsApp sent to %s template=%s: %s", phone, template_name, data)
            return {'success': True, 'data': data}
        except Exception as e:
            logger.error("WhatsApp send failed to %s: %s", phone, str(e))
            return {'success': False, 'error': str(e)}

    def send_attendance_alert(self, parent_phone: str, student_name: str, date: str,
                               attendance_status: str, school_name: str = '') -> dict:
        """Send attendance absent/late alert to parent."""
        return self.send_template_message(
            phone=parent_phone,
            template_name='attendance_absent_alert',
            variables={
                'student_name': student_name,
                'date': date,
                'status': attendance_status,
                'school_name': school_name or 'your school',
            },
        )

    def send_fee_reminder(self, parent_phone: str, student_name: str, amount: str,
                           due_date: str, school_name: str = '') -> dict:
        """Send fee payment reminder to parent."""
        return self.send_template_message(
            phone=parent_phone,
            template_name='fee_reminder',
            variables={
                'student_name': student_name,
                'amount': str(amount),
                'due_date': due_date,
                'school_name': school_name or 'your school',
            },
        )

    def send_welcome_message(self, parent_phone: str, student_name: str,
                              school_name: str, login_url: str = '') -> dict:
        """Send welcome message to parent after school onboarding."""
        return self.send_template_message(
            phone=parent_phone,
            template_name='school_welcome',
            variables={
                'student_name': student_name,
                'school_name': school_name,
                'login_url': login_url or 'https://campuskona.com',
            },
        )

    def send_consent_request(self, parent_phone: str, student_name: str, school_name: str) -> dict:
        """Send DPDP parental consent request (DPDP Act 2023 S.9)."""
        return self.send_template_message(
            phone=parent_phone,
            template_name='dpdp_consent_request',
            variables={
                'student_name': student_name,
                'school_name': school_name,
            },
        )


whatsapp_service = WhatsAppService()
