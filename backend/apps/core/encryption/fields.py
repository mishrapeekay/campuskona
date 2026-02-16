"""
Encrypted Django Model Fields for DPDP Act 2023 Compliance

These fields automatically encrypt data before saving to database
and decrypt when retrieving from database.

Usage:
    from apps.core.encryption import EncryptedCharField

    class Student(models.Model):
        aadhar_number = EncryptedCharField(max_length=255, blank=True)
"""
from django.db import models
from .service import get_encryption_service


class EncryptedFieldMixin:
    """
    Mixin for encrypted fields

    Handles encryption on save and decryption on load
    """

    def __init__(self, *args, **kwargs):
        # Store original max_length for validation
        self._original_max_length = kwargs.get('max_length')

        # Encrypted data is base64-encoded and longer than plaintext
        # AES-256-GCM with IV adds: 12 bytes (IV) + 16 bytes (auth tag) = 28 bytes overhead
        # Base64 encoding increases size by ~33%
        # Formula: base64((plaintext + 28)) ≈ (plaintext + 28) * 1.33
        if 'max_length' in kwargs:
            original_max = kwargs['max_length']
            # Calculate encrypted max_length with safety margin
            kwargs['max_length'] = int((original_max + 28) * 1.4)  # Extra margin for safety

        super().__init__(*args, **kwargs)
        self.encryption_service = get_encryption_service()

    def get_prep_value(self, value):
        """
        Called before saving to database - encrypt the value

        Args:
            value: Plaintext value from Python

        Returns:
            Encrypted base64 string for database
        """
        if value is None or value == '':
            return value

        # Encrypt before saving
        encrypted = self.encryption_service.encrypt(str(value))
        return super().get_prep_value(encrypted)

    def from_db_value(self, value, expression, connection):
        """
        Called when loading from database - decrypt the value

        Args:
            value: Encrypted base64 string from database

        Returns:
            Decrypted plaintext for Python
        """
        if value is None or value == '':
            return value

        # Decrypt after loading
        try:
            decrypted = self.encryption_service.decrypt(value)
            return decrypted
        except Exception as e:
            # If decryption fails, log and return None
            # This could happen if encryption key changed
            print(f"[WARNING] Failed to decrypt field: {e}")
            return None

    def to_python(self, value):
        """
        Convert value to Python type

        This is called during validation and deserialization
        """
        if value is None or value == '':
            return value

        # If already decrypted (plaintext), return as-is
        # If encrypted (from form), it will be encrypted again in get_prep_value
        return super().to_python(value)


class EncryptedCharField(EncryptedFieldMixin, models.CharField):
    """
    CharField with automatic encryption/decryption

    Usage:
        aadhar_number = EncryptedCharField(max_length=12, validators=[...])

    The max_length refers to the PLAINTEXT length.
    The field automatically calculates encrypted storage length.
    """
    description = "Encrypted CharField for sensitive data"

    def deconstruct(self):
        """
        Return enough information to recreate the field

        This is used by Django migrations
        """
        name, path, args, kwargs = super().deconstruct()

        # Restore original max_length for migrations
        if self._original_max_length:
            kwargs['max_length'] = self._original_max_length

        return name, path, args, kwargs


class EncryptedTextField(EncryptedFieldMixin, models.TextField):
    """
    TextField with automatic encryption/decryption

    Usage:
        medical_conditions = EncryptedTextField(blank=True)

    Suitable for longer sensitive text data.
    """
    description = "Encrypted TextField for sensitive data"

    def __init__(self, *args, **kwargs):
        # TextField doesn't have max_length, so skip that calculation
        if 'max_length' in kwargs:
            self._original_max_length = kwargs.pop('max_length')
        else:
            self._original_max_length = None

        # Call models.TextField.__init__ directly, not EncryptedFieldMixin
        models.TextField.__init__(self, *args, **kwargs)
        self.encryption_service = get_encryption_service()

    def deconstruct(self):
        """Return enough information to recreate the field"""
        name, path, args, kwargs = super().deconstruct()

        if self._original_max_length:
            kwargs['max_length'] = self._original_max_length

        return name, path, args, kwargs


class EncryptedEmailField(EncryptedFieldMixin, models.EmailField):
    """
    EmailField with automatic encryption/decryption

    Usage:
        guardian_email = EncryptedEmailField(blank=True)

    Note: Encrypted emails cannot be used for email sending directly.
    Decrypt first before sending.
    """
    description = "Encrypted EmailField for sensitive email addresses"

    def deconstruct(self):
        """Return enough information to recreate the field"""
        name, path, args, kwargs = super().deconstruct()

        if self._original_max_length:
            kwargs['max_length'] = self._original_max_length

        return name, path, args, kwargs


class EncryptedDecimalField(EncryptedFieldMixin, models.CharField):
    """
    DecimalField with automatic encryption/decryption

    Stored as encrypted string in database, converted to Decimal in Python

    Usage:
        father_annual_income = EncryptedDecimalField(
            max_digits=12,
            decimal_places=2
        )
    """
    description = "Encrypted DecimalField for sensitive financial data"

    def __init__(self, *args, **kwargs):
        # Extract decimal field parameters
        self._max_digits = kwargs.pop('max_digits', 10)
        self._decimal_places = kwargs.pop('decimal_places', 2)

        # Calculate max_length based on decimal parameters
        # max_length = max_digits + 1 (for decimal point) + 1 (for potential minus sign)
        plaintext_max = self._max_digits + 2
        kwargs['max_length'] = plaintext_max

        super().__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection):
        """Decrypt and convert to Decimal"""
        from decimal import Decimal

        decrypted = super().from_db_value(value, expression, connection)

        if decrypted is None or decrypted == '':
            return None

        try:
            return Decimal(decrypted)
        except Exception:
            return None

    def get_prep_value(self, value):
        """Convert Decimal to string before encrypting"""
        if value is None or value == '':
            return value

        # Convert Decimal to string before encryption
        return super().get_prep_value(str(value))

    def to_python(self, value):
        """Convert to Decimal for Python"""
        from decimal import Decimal

        if value is None or value == '':
            return None

        if isinstance(value, Decimal):
            return value

        try:
            return Decimal(str(value))
        except Exception:
            return None

    def deconstruct(self):
        """Return enough information to recreate the field"""
        name, path, args, kwargs = super().deconstruct()

        # Add decimal-specific parameters
        kwargs['max_digits'] = self._max_digits
        kwargs['decimal_places'] = self._decimal_places

        # Remove CharField's max_length (calculated automatically)
        if 'max_length' in kwargs:
            del kwargs['max_length']

        return name, path, args, kwargs
