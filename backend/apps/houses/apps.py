from django.apps import AppConfig

class HousesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.houses'
    verbose_name = 'House Management'

    def ready(self):
        import apps.houses.signals
