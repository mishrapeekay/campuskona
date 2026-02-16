"""
Timetable app configuration
"""

from django.apps import AppConfig


class TimetableConfig(AppConfig):
    """Configuration for Timetable app"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.timetable'
    verbose_name = 'Timetable Management'

    def ready(self):
        """Import signals when app is ready"""
        try:
            import apps.timetable.signals  # noqa
        except ImportError:
            pass
