"""
Custom validators for the application.
"""

import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


def validate_phone_number(value):
    """
    Validate Indian phone number (10 digits).
    """
    pattern = r'^[6-9]\d{9}$'
    if not re.match(pattern, str(value)):
        raise ValidationError(
            _('%(value)s is not a valid Indian phone number. Must be 10 digits starting with 6-9.'),
            params={'value': value},
        )


def validate_pincode(value):
    """
    Validate Indian PIN code (6 digits).
    """
    pattern = r'^\d{6}$'
    if not re.match(pattern, str(value)):
        raise ValidationError(
            _('%(value)s is not a valid PIN code. Must be 6 digits.'),
            params={'value': value},
        )


def validate_percentage(value):
    """
    Validate percentage (0-100).
    """
    if value < 0 or value > 100:
        raise ValidationError(
            _('Percentage must be between 0 and 100.'),
        )


def validate_marks(value, max_marks=None):
    """
    Validate marks.
    """
    if value < 0:
        raise ValidationError(_('Marks cannot be negative.'))

    if max_marks and value > max_marks:
        raise ValidationError(
            _('Marks (%(value)s) cannot exceed maximum marks (%(max)s).'),
            params={'value': value, 'max': max_marks},
        )


def validate_file_size(file, max_size_mb=10):
    """
    Validate uploaded file size.

    Args:
        file: Uploaded file object
        max_size_mb: Maximum file size in MB
    """
    max_size_bytes = max_size_mb * 1024 * 1024

    if file.size > max_size_bytes:
        raise ValidationError(
            _('File size cannot exceed %(max)s MB. Current size: %(current).2f MB'),
            params={
                'max': max_size_mb,
                'current': file.size / (1024 * 1024)
            },
        )


def validate_image_file(file):
    """
    Validate image file type.
    """
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif']
    file_extension = file.name.lower().split('.')[-1]

    if f'.{file_extension}' not in valid_extensions:
        raise ValidationError(
            _('Invalid image file type. Allowed types: %(types)s'),
            params={'types': ', '.join(valid_extensions)},
        )


def validate_document_file(file):
    """
    Validate document file type.
    """
    valid_extensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']
    file_extension = file.name.lower().split('.')[-1]

    if f'.{file_extension}' not in valid_extensions:
        raise ValidationError(
            _('Invalid document file type. Allowed types: %(types)s'),
            params={'types': ', '.join(valid_extensions)},
        )


def validate_aadhar_number(value):
    """
    Validate Aadhar number (12 digits).
    """
    pattern = r'^\d{12}$'
    if not re.match(pattern, str(value)):
        raise ValidationError(
            _('Invalid Aadhar number. Must be 12 digits.'),
        )


def validate_pan_number(value):
    """
    Validate PAN number.
    Format: AAAAA9999A
    """
    pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
    if not re.match(pattern, str(value).upper()):
        raise ValidationError(
            _('Invalid PAN number. Format: AAAAA9999A'),
        )


def validate_samagra_family_id(value):
    """
    Validate Samagra Family ID (8 digits) - Madhya Pradesh.

    Samagra ID is a unified citizen database ID used in MP for:
    - Scholarship disbursements
    - Social welfare schemes
    - Mid-day meal tracking
    - Government benefit delivery

    Format: 8 numeric digits
    Example: 12345678
    """
    if not value:
        return  # Allow blank/null values

    pattern = r'^\d{8}$'
    if not re.match(pattern, str(value)):
        raise ValidationError(
            _('Invalid Samagra Family ID. Must be exactly 8 numeric digits.'),
        )


def validate_samagra_member_id(value):
    """
    Validate Samagra Member ID / SSRNID (9 digits) - Madhya Pradesh.

    Individual Samagra ID (also called SSRNID - Samagra Samajik Suraksha
    Registration Number) is assigned to each family member.

    Format: 9 numeric digits
    Example: 123456789
    """
    if not value:
        return  # Allow blank/null values

    pattern = r'^\d{9}$'
    if not re.match(pattern, str(value)):
        raise ValidationError(
            _('Invalid Samagra Member ID. Must be exactly 9 numeric digits.'),
        )
