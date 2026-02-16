"""
Examinations app configuration
"""

from django.apps import AppConfig


class ExaminationsConfig(AppConfig):
    """Configuration for Examinations app"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.examinations'
    verbose_name = 'Examinations & Grading'

    def ready(self):
        """Import signals when app is ready"""
        try:
            import apps.examinations.signals  # noqa
        except ImportError:
            pass
