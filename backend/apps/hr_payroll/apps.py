"""
HR & Payroll app configuration
"""

from django.apps import AppConfig


class HrPayrollConfig(AppConfig):
    """Configuration for HR & Payroll app"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.hr_payroll'
    verbose_name = 'HR & Payroll Management'
