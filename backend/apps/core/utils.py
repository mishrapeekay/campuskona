"""
Utility functions for the application.
"""

import hashlib
import random
import string
from datetime import datetime, timedelta
from typing import Any, Dict, List


def generate_unique_code(prefix: str = '', length: int = 8) -> str:
    """
    Generate a unique code with optional prefix.

    Args:
        prefix: Prefix for the code
        length: Length of the random part

    Returns:
        Unique code string
    """
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
    return f"{prefix}{random_part}" if prefix else random_part


def generate_admission_number(school_code: str, year: int = None) -> str:
    """
    Generate admission number for students.

    Format: {SCHOOL_CODE}/{YEAR}/{RANDOM}
    Example: SCH001/2024/00123
    """
    if year is None:
        year = datetime.now().year

    random_num = random.randint(1, 99999)
    return f"{school_code}/{year}/{random_num:05d}"


def generate_employee_id(school_code: str, department_code: str = '') -> str:
    """
    Generate employee ID for staff.

    Format: {SCHOOL_CODE}/{DEPT}/{RANDOM}
    Example: SCH001/MATH/001
    """
    random_num = random.randint(1, 999)
    dept_part = f"{department_code}/" if department_code else ''
    return f"{school_code}/{dept_part}{random_num:03d}"


def calculate_age(date_of_birth: datetime) -> int:
    """
    Calculate age from date of birth.

    Args:
        date_of_birth: Date of birth

    Returns:
        Age in years
    """
    today = datetime.now().date()
    dob = date_of_birth if isinstance(date_of_birth, datetime) else datetime.combine(date_of_birth, datetime.min.time())
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return age


def get_academic_year(date: datetime = None) -> str:
    """
    Get academic year for a given date.

    Academic year runs from April to March.
    Args:
        date: Date to get academic year for (defaults to today)

    Returns:
        Academic year string (e.g., "2024-2025")
    """
    if date is None:
        date = datetime.now()

    if date.month >= 4:  # April onwards
        return f"{date.year}-{date.year + 1}"
    else:  # January to March
        return f"{date.year - 1}-{date.year}"


def get_financial_year(date: datetime = None) -> str:
    """
    Get financial year for a given date.

    Financial year runs from April to March.
    Args:
        date: Date to get financial year for (defaults to today)

    Returns:
        Financial year string (e.g., "FY 2024-25")
    """
    academic_year = get_academic_year(date)
    start_year, end_year = academic_year.split('-')
    return f"FY {start_year}-{end_year[2:]}"


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to remove special characters.

    Args:
        filename: Original filename

    Returns:
        Sanitized filename
    """
    # Keep alphanumeric, dots, hyphens, and underscores
    valid_chars = f"-_.() {string.ascii_letters}{string.digits}"
    sanitized = ''.join(c for c in filename if c in valid_chars)
    return sanitized.strip()


def get_client_ip(request) -> str:
    """
    Get client IP address from request.

    Args:
        request: Django/DRF request object

    Returns:
        IP address string
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def paginate_queryset(queryset, page: int = 1, page_size: int = 20):
    """
    Manually paginate a queryset.

    Args:
        queryset: QuerySet to paginate
        page: Page number (1-indexed)
        page_size: Number of items per page

    Returns:
        Tuple of (items, total_pages, total_count)
    """
    total_count = queryset.count()
    total_pages = (total_count + page_size - 1) // page_size

    start = (page - 1) * page_size
    end = start + page_size

    items = queryset[start:end]

    return items, total_pages, total_count


def calculate_percentage(obtained: float, total: float) -> float:
    """
    Calculate percentage.

    Args:
        obtained: Marks obtained
        total: Total marks

    Returns:
        Percentage (rounded to 2 decimals)
    """
    if total == 0:
        return 0.0
    return round((obtained / total) * 100, 2)


def is_working_day(date: datetime) -> bool:
    """
    Check if a date is a working day (Monday-Saturday).

    Args:
        date: Date to check

    Returns:
        True if working day, False if Sunday
    """
    return date.weekday() != 6  # 6 = Sunday


def get_next_working_day(date: datetime) -> datetime:
    """
    Get next working day from a given date.

    Args:
        date: Starting date

    Returns:
        Next working day
    """
    next_day = date + timedelta(days=1)
    while not is_working_day(next_day):
        next_day += timedelta(days=1)
    return next_day


def chunk_list(lst: List[Any], chunk_size: int) -> List[List[Any]]:
    """
    Split a list into chunks.

    Args:
        lst: List to split
        chunk_size: Size of each chunk

    Returns:
        List of chunks
    """
    return [lst[i:i + chunk_size] for i in range(0, len(lst), chunk_size)]


def mask_sensitive_data(data: str, visible_chars: int = 4) -> str:
    """
    Mask sensitive data like phone numbers, emails.

    Args:
        data: Data to mask
        visible_chars: Number of characters to keep visible

    Returns:
        Masked string
    """
    if len(data) <= visible_chars:
        return '*' * len(data)

    visible_part = data[-visible_chars:]
    masked_part = '*' * (len(data) - visible_chars)
    return masked_part + visible_part
