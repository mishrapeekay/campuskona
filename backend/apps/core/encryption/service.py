"""
Encryption Service for DPDP Act 2023 Compliance
Implements AES-256-GCM encryption for sensitive personal data
"""
import base64
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


class EncryptionService:
    """
    Provides AES-256-GCM encryption for sensitive fields

    Features:
    - AES-256-GCM (Authenticated Encryption)
    - Unique IV (Initialization Vector) per encryption
    - PBKDF2 key derivation from master key
    - Base64 encoding for database storage
    """

    def __init__(self):
        """Initialize encryption service with master key from settings"""
        self.master_key = self._get_master_key()
        self.encryption_key = self._derive_key(self.master_key)
        self.cipher = AESGCM(self.encryption_key)

    def _get_master_key(self) -> bytes:
        """
        Get master encryption key from environment

        In production, this should be:
        - Stored in environment variable
        - Rotated periodically
        - Backed up securely
        - Never committed to version control
        """
        key_b64 = getattr(settings, 'FIELD_ENCRYPTION_KEY', None)

        if not key_b64:
            raise ImproperlyConfigured(
                "FIELD_ENCRYPTION_KEY not found in settings. "
                "Set it in .env file. Generate with: "
                "python manage.py generate_encryption_key"
            )

        try:
            # Decode base64 URL-safe key with proper padding
            key_bytes = base64.urlsafe_b64decode(key_b64 + '==')  # Add padding

            # Ensure key is exactly 32 bytes for AES-256
            if len(key_bytes) >= 32:
                return key_bytes[:32]
            else:
                # Pad with zeros if too short (though this shouldn't happen)
                return key_bytes + b'\x00' * (32 - len(key_bytes))
        except Exception as e:
            raise ImproperlyConfigured(
                f"Invalid FIELD_ENCRYPTION_KEY format: {e}. "
                "Generate a new key with: python manage.py generate_encryption_key"
            )

    def _derive_key(self, master_key: bytes) -> bytes:
        """
        Derive encryption key using PBKDF2

        This adds an extra layer of security by deriving the actual
        encryption key from the master key using a key derivation function.
        """
        # Use fixed salt for deterministic key derivation
        # In production, consider using a configurable salt
        salt = b'DPDP_Act_2023_Compliance_Salt'

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,  # 256 bits for AES-256
            salt=salt,
            iterations=100000,
        )

        return kdf.derive(master_key)

    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt plaintext string to base64-encoded ciphertext

        Args:
            plaintext: The data to encrypt (e.g., Aadhar number)

        Returns:
            Base64-encoded string: IV (12 bytes) + Ciphertext + Auth Tag (16 bytes)

        Example:
            >>> service = EncryptionService()
            >>> encrypted = service.encrypt("123456789012")
            >>> print(encrypted)
            'vQx7B8K3m...' (base64 encoded)
        """
        if not plaintext:
            return plaintext  # Return empty/None as-is

        # Generate random IV (12 bytes recommended for GCM)
        iv = os.urandom(12)

        # Encrypt with authentication
        ciphertext = self.cipher.encrypt(
            iv,
            plaintext.encode('utf-8'),
            None  # No additional authenticated data
        )

        # Combine IV + ciphertext and encode as base64
        encrypted_data = iv + ciphertext
        return base64.b64encode(encrypted_data).decode('utf-8')

    def decrypt(self, ciphertext_b64: str) -> str:
        """
        Decrypt base64-encoded ciphertext to plaintext

        Args:
            ciphertext_b64: Base64-encoded encrypted data

        Returns:
            Decrypted plaintext string

        Raises:
            InvalidTag: If data has been tampered with
            ValueError: If decryption fails
        """
        if not ciphertext_b64:
            return ciphertext_b64  # Return empty/None as-is

        try:
            # Decode from base64
            encrypted_data = base64.b64decode(ciphertext_b64.encode('utf-8'))

            # Extract IV (first 12 bytes) and ciphertext
            iv = encrypted_data[:12]
            ciphertext = encrypted_data[12:]

            # Decrypt and verify authentication tag
            plaintext_bytes = self.cipher.decrypt(iv, ciphertext, None)

            return plaintext_bytes.decode('utf-8')

        except Exception as e:
            # Log decryption failure (could indicate tampering)
            raise ValueError(f"Decryption failed: {e}")

    def encrypt_dict(self, data: dict, fields: list) -> dict:
        """
        Encrypt specific fields in a dictionary

        Args:
            data: Dictionary containing data
            fields: List of field names to encrypt

        Returns:
            Dictionary with encrypted fields
        """
        encrypted_data = data.copy()

        for field in fields:
            if field in encrypted_data and encrypted_data[field]:
                encrypted_data[field] = self.encrypt(str(encrypted_data[field]))

        return encrypted_data

    def decrypt_dict(self, data: dict, fields: list) -> dict:
        """
        Decrypt specific fields in a dictionary

        Args:
            data: Dictionary containing encrypted data
            fields: List of field names to decrypt

        Returns:
            Dictionary with decrypted fields
        """
        decrypted_data = data.copy()

        for field in fields:
            if field in decrypted_data and decrypted_data[field]:
                decrypted_data[field] = self.decrypt(decrypted_data[field])

        return decrypted_data


def mask_sensitive_data(value: str, visible_chars: int = 4, mask_char: str = 'X') -> str:
    """
    Mask sensitive data for display (e.g., in parent portal, logs)

    Args:
        value: The sensitive value to mask
        visible_chars: Number of characters to show at the end
        mask_char: Character to use for masking

    Returns:
        Masked string

    Examples:
        >>> mask_sensitive_data("123456789012", 4)
        'XXXXXXXX9012'
        >>> mask_sensitive_data("12345678", 4)  # Samagra Family ID
        'XXXX5678'
        >>> mask_sensitive_data("123456789", 4)  # Samagra Member ID
        'XXXXX6789'
    """
    if not value:
        return value

    value_str = str(value)
    length = len(value_str)

    if length <= visible_chars:
        # Too short to mask meaningfully
        return mask_char * length

    masked_length = length - visible_chars
    masked_part = mask_char * masked_length
    visible_part = value_str[-visible_chars:]

    return masked_part + visible_part


def mask_aadhar(aadhar: str) -> str:
    """
    Mask Aadhar number (show last 4 digits)

    Example: 123456789012 -> XXXXXXXX9012
    """
    return mask_sensitive_data(aadhar, visible_chars=4)


def mask_samagra_family_id(family_id: str) -> str:
    """
    Mask Samagra Family ID (show last 4 digits)

    Example: 12345678 -> XXXX5678
    """
    return mask_sensitive_data(family_id, visible_chars=4)


def mask_samagra_member_id(member_id: str) -> str:
    """
    Mask Samagra Member ID (show last 4 digits)

    Example: 123456789 -> XXXXX6789
    """
    return mask_sensitive_data(member_id, visible_chars=4)


# Global singleton instance
_encryption_service = None


def get_encryption_service() -> EncryptionService:
    """
    Get singleton instance of EncryptionService

    This ensures we only initialize the encryption service once
    and reuse it across the application.
    """
    global _encryption_service

    if _encryption_service is None:
        _encryption_service = EncryptionService()

    return _encryption_service
