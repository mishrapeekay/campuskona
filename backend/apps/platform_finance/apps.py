from django.apps import AppConfig


class PlatformFinanceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.platform_finance'
    verbose_name = 'Platform Finance & Investor Management'
    
    def ready(self):
        """Import signals when app is ready"""
        try:
            import apps.platform_finance.signals  # noqa
        except ImportError:
            pass
