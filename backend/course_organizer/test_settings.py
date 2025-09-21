"""
Test settings for Course Organizer
"""
from .settings import *
import os

# Use in-memory SQLite for faster tests
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Allow migrations for tests to ensure tables are created
# MIGRATION_MODULES = DisableMigrations()

# Disable logging during tests
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'root': {
        'handlers': ['null'],
    },
}

# Disable email sending during tests
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Use dummy cache for tests
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
    }
}

# Disable password validation for faster tests
AUTH_PASSWORD_VALIDATORS = []

# Use default password hasher for tests (MD5 can cause authentication issues)
# PASSWORD_HASHERS = [
#     'django.contrib.auth.hashers.MD5PasswordHasher',
# ]

# Disable CORS for tests
CORS_ALLOW_ALL_ORIGINS = True

# Test-specific settings
TESTING = True

# Allow testserver for Django test client
ALLOWED_HOSTS = ['testserver', 'localhost', '127.0.0.1']

# Disable external services
TWILIO_ACCOUNT_SID = 'test_sid'
TWILIO_AUTH_TOKEN = 'test_token'
SENDGRID_API_KEY = 'test_key'

# Use test media root
MEDIA_ROOT = os.path.join(BASE_DIR, 'test_media')

# Disable file uploads during tests
FILE_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024  # 1MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024  # 1MB
