from django.apps import AppConfig


class DirectoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'directory'
    verbose_name = 'Active Directory'
    
    def ready(self):
        import directory.signals