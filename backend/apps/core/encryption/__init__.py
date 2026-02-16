"""
Encryption module for DPDP Act 2023 compliance
Provides field-level encryption for sensitive personal data
"""
from .fields import (
    EncryptedCharField,
    EncryptedTextField,
    EncryptedEmailField,
    EncryptedDecimalField
)
from .service import (
    EncryptionService,
    mask_sensitive_data,
    mask_aadhar,
    mask_samagra_family_id,
    mask_samagra_member_id
)

__all__ = [
    'EncryptedCharField',
    'EncryptedTextField',
    'EncryptedEmailField',
    'EncryptedDecimalField',
    'EncryptionService',
    'mask_sensitive_data',
    'mask_aadhar',
    'mask_samagra_family_id',
    'mask_samagra_member_id',
]
