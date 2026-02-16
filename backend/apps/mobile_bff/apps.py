from django.apps import AppConfig


class MobileBffConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.mobile_bff'
    label = 'mobile_bff'
    
    def ready(self):
        """Import signals when app is ready"""
        import apps.mobile_bff.signals

