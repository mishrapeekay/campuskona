from django.apps import AppConfig


class AttendanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.attendance'
    verbose_name = 'Attendance Management'

    def ready(self):
        """Import signals when app is ready"""
        try:
            import apps.attendance.signals  # noqa
        except ImportError:
            pass
