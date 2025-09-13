from django.apps import AppConfig


class SchoolConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'school'
    verbose_name = 'School Management'
    
    def ready(self):
        """Import signal handlers when the app is ready"""
        try:
            import school.signals  # noqa F401
        except ImportError:
            pass