"""
Development settings for School Management System.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '10.0.2.2']

# Database - Use PostgreSQL for multi-tenancy support
# SQLite doesn't support PostgreSQL schemas needed for multi-tenancy
# DATABASES['default'] = {
#     'ENGINE': 'django.db.backends.sqlite3',
#     'NAME': BASE_DIR / 'db.sqlite3',
# }
# Using PostgreSQL from base.py settings

# Add Django Debug Toolbar (commented out - not installed)
# INSTALLED_APPS += [
#     'debug_toolbar',
#     'django_extensions',
# ]

# MIDDLEWARE += [
#     'debug_toolbar.middleware.DebugToolbarMiddleware',
# ]

# Debug Toolbar Configuration
INTERNAL_IPS = [
    '127.0.0.1',
    'localhost',
]

# CORS - Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Email - Console backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Logging - More verbose in development
LOGGING['loggers']['apps']['level'] = 'DEBUG'

# Celery - Eager execution in development (no broker needed)
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
