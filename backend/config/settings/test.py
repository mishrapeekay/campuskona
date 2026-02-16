"""
Test settings for School Management System.
"""

from .base import *

# Use file-based SQLite for tests (required for migrations)
import os
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR.parent, 'test_db.sqlite3'),
    }
}

# Password hashers - Use fast hasher for tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Celery - Always eager in tests
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True

# Email - Memory backend for tests
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# Allow migrations for tests (needed for custom models like User)
# Uncomment below to disable migrations for faster tests (if models don't change)
# class DisableMigrations:
#     def __contains__(self, item):
#         return True
#
#     def __getitem__(self, item):
#         return None
#
# MIGRATION_MODULES = DisableMigrations()

# Media files - Use temporary directory
MEDIA_ROOT = '/tmp/school_mgmt_test_media/'

# Disable tenant middleware for tests (covers TenantMainMiddleware and TenantHeaderMiddleware)
MIDDLEWARE = [item for item in MIDDLEWARE if 'Tenant' not in item]

# Override django-tenants router with a test-compatible version that allows all migrations on SQLite
DATABASE_ROUTERS = ['config.test_router.TestTenantSyncRouter']
TENANT_SYNC_ROUTER = 'config.test_router.TestTenantSyncRouter'
