from django.apps import AppConfig


class CommunicationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'communication'
    verbose_name = 'Communication'
    
    def ready(self):
        """Import signal handlers when the app is ready"""
        try:
            import communication.signals  # noqa F401
        except ImportError:
            pass