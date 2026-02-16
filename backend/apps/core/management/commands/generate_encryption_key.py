"""
Management command to generate encryption key for DPDP compliance

Usage:
    python manage.py generate_encryption_key

This generates a secure 32-byte key encoded in base64 URL-safe format.
Add the generated key to your .env file as FIELD_ENCRYPTION_KEY.

IMPORTANT:
- Never commit this key to version control
- Back up the key securely
- Rotate periodically (requires data re-encryption)
- Use different keys for dev/staging/production
"""
from django.core.management.base import BaseCommand
import secrets


class Command(BaseCommand):
    help = 'Generate a secure encryption key for field-level encryption (DPDP Act 2023)'

    def handle(self, *args, **options):
        # Generate 32 bytes (256 bits) of random data
        key = secrets.token_urlsafe(32)

        self.stdout.write(self.style.SUCCESS('\n' + '='*70))
        self.stdout.write(self.style.SUCCESS('FIELD ENCRYPTION KEY GENERATED'))
        self.stdout.write(self.style.SUCCESS('='*70))
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Add this to your .env file:'))
        self.stdout.write('')
        self.stdout.write(f'FIELD_ENCRYPTION_KEY={key}')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('IMPORTANT SECURITY NOTES:'))
        self.stdout.write('')
        self.stdout.write('1. Never commit this key to version control')
        self.stdout.write('2. Back up this key securely (losing it means losing encrypted data)')
        self.stdout.write('3. Use different keys for development, staging, and production')
        self.stdout.write('4. Rotate keys periodically (requires re-encrypting all data)')
        self.stdout.write('5. Store backups in a secure password manager or vault')
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('='*70))
        self.stdout.write('')
