"""
Production settings for School Management System.
"""

from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Hosts — must be set via ALLOWED_HOSTS env var; wildcard default from base.py is not acceptable
ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
# Ensure wildcard and primary domains are supported
PRIMARY_DOMAINS = ['campuskona.com', 'www.campuskona.com', '.campuskona.com']
for domain in PRIMARY_DOMAINS:
    if domain not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(domain)

# Security settings
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True  # Critical for django-tenants behind Nginx
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_REFERRER_POLICY = 'no-referrer-when-downgrade'

# Session and CSRF configuration for Production
CSRF_TRUSTED_ORIGINS = [
    'https://campuskona.com',
    'https://www.campuskona.com',
    'https://demo.campuskona.com',
    'https://*.campuskona.com'
]
# Important for multi-tenant sessions
SESSION_COOKIE_DOMAIN = '.campuskona.com'
CSRF_COOKIE_DOMAIN = '.campuskona.com'
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_NAME = 'campuskona_sessionid'
CSRF_COOKIE_NAME = 'campuskona_csrftoken'

# CSP — django-csp middleware (installed in requirements/prod.txt)
# Static files — WhiteNoise handles static; configure cloud storage for media
# Use CompressedStaticFilesStorage for stability with third-party libraries
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
WHITENOISE_MANIFEST_STRICT = False  # Safety net

MIDDLEWARE = [
    'apps.core.middleware.TenantPrometheusBeforeMiddleware',
    'apps.tenants.middleware.TenantHeaderMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'csp.middleware.CSPMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.core.middleware.TenantPrometheusAfterMiddleware',
]

CSP_DEFAULT_SRC = ("'self'", "https:")
CSP_SCRIPT_SRC = ("'self'", "'unsafe-inline'", "'unsafe-eval'", "https:")
CSP_STYLE_SRC = ("'self'", "'unsafe-inline'", "https:")  # unsafe-inline needed for some UI libs
CSP_IMG_SRC = ("'self'", "data:", "blob:", "https:")
CSP_FONT_SRC = ("'self'", "data:", "https:")
CSP_CONNECT_SRC = ("'self'", "https:")
CSP_FRAME_ANCESTORS = ("'self'",)

# Override X_FRAME_OPTIONS from base.py to allow admin popups
X_FRAME_OPTIONS = 'SAMEORIGIN'

# Database - Must be configured via environment variables
DATABASES['default'] = {
    'ENGINE': 'django_tenants.postgresql_backend',
    'NAME': config('DB_NAME'),
    'USER': config('DB_USER'),
    'PASSWORD': config('DB_PASSWORD'),
    'HOST': config('DB_HOST', default='pgbouncer'),
    'PORT': config('DB_PORT', default='6432'),
    'CONN_MAX_AGE': 600,
    'DISABLE_SERVER_SIDE_CURSORS': True,  # Required for PgBouncer transaction mode
    'OPTIONS': {
        'sslmode': config('DB_SSLMODE', default='require'),
        'options': '-c search_path=public -c statement_timeout=30000',
        'connect_timeout': 10,
    }
}

# Redis cache — required in production for multi-worker session consistency
USE_REDIS_CACHE = True
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://redis:6379/0'),
    }
}

# Ensure permissions are enforced in production
REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = (
    'rest_framework.permissions.IsAuthenticated',
)

# Static files — WhiteNoise handles static; configure cloud storage for media
# Uncomment and configure when a cloud provider is available:
# AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID')
# AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')
# AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME')
# AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='ap-south-1')
# AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
# MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/media/'
# DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

# Email - Use real SMTP in production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Logging — write to /app/logs which is mounted as a Docker volume
LOGGING['handlers']['file']['filename'] = '/app/logs/app.log'

# Sentry for error tracking (uncomment and set SENTRY_DSN env var to enable)
# import sentry_sdk
# from sentry_sdk.integrations.django import DjangoIntegration
#
# sentry_sdk.init(
#     dsn=config('SENTRY_DSN', default=''),
#     integrations=[DjangoIntegration()],
#     traces_sample_rate=0.1,
#     send_default_pii=False,
# )

# Rate limiting - Stricter in production
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'].update({
    'anon': '50/hour',
    'user': '500/hour'
})
