"""
Django settings for School Management System.

This is the base settings file that contains common settings for all environments.
"""

import os
from pathlib import Path
from datetime import timedelta
from decouple import config

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Security
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production-12345')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='*',
    cast=lambda v: [s.strip() for s in v.split(',')] if v != '*' else ['*']
)

# Application definition
SHARED_APPS = (
    'django_tenants',  # mandatory
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps (Shared)
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'django_prometheus',
    
    # Local apps (Shared)
    'apps.core',
    'apps.tenants',
    'apps.authentication',
    # 'apps.privacy', # Moved to TENANT_APPS to resolve Student dependency
    'apps.partners', # Partner Commission Tracking (public schema)
    'apps.finance_ledger',
    'apps.analytics', # Investor Dashboard Analytics
    'apps.platform_finance', # Platform Finance & Investor Management (public schema)
)

TENANT_APPS = (
    # Local apps (Tenant specific)
    'apps.privacy', # Moved from SHARED_APPS to TENANT_APPS to resolve Student dependency
    'apps.students',
    'apps.staff',
    'apps.academics',
    'apps.attendance',
    'apps.timetable',
    'apps.examinations',
    'apps.finance',
    'apps.communication',
    'apps.transport',
    'apps.library',
    'apps.admissions',
    'apps.hostel',
    'apps.hr_payroll',
    'apps.reports',
    'apps.assignments',
    'apps.mobile_bff',
    'apps.integrations',
    'apps.government_reports',
    'apps.workflows',
    'apps.fee_ledger',
    'apps.ai_questions',
    'apps.houses',
    'apps.activities',
)

INSTALLED_APPS = list(SHARED_APPS) + [app for app in TENANT_APPS if app not in SHARED_APPS]

MIDDLEWARE = [
    'apps.core.middleware.TenantPrometheusBeforeMiddleware',
    'apps.tenants.middleware.TenantHeaderMiddleware', # Custom middleware supporting headers
    # 'django_tenants.middleware.main.TenantMainMiddleware', # Replaced by above
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.tenants.middleware.SubscriptionEnforcementMiddleware',  # Blocks expired/inactive tenants
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.core.middleware.TenantPrometheusAfterMiddleware',
]

ROOT_URLCONF = 'config.urls'

# ... [TEMPLATES, WSGI, ASGI skipped - unchanged] ...
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'apps.core.context_processors.filtered_jazzmin_settings',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend', # Custom backend for django-tenants
        'NAME': config('DB_NAME', default='school_management'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': {
            'connect_timeout': 10,
            'sslmode': config('DB_SSLMODE', default='prefer'),
        },
        # Disable server-side cursors to avoid cursor errors
        'DISABLE_SERVER_SIDE_CURSORS': True,
        # Connection pooling - reuse database connections for 10 minutes
        'CONN_MAX_AGE': 600,
    },
    # SQLite for local development (optional)
    'sqlite': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
        'CONN_MAX_AGE': 600,  # Connection pooling for SQLite too
    },
}

# Database Routers for Multi-Tenancy
DATABASE_ROUTERS = ['django_tenants.routers.TenantSyncRouter']

# MongoDB removed as per architecture scaling plan v2

# Custom User Model
AUTH_USER_MODEL = 'authentication.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,  # Optimized default page size
    'MAX_PAGE_SIZE': 100,  # Prevent abuse with large page sizes
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'apps.core.throttling.TenantRateThrottle',
        'apps.core.throttling.TenantUserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '1000/hour',
        'user': '10000/hour',
        'tenant': '100000/hour',      # Limit for the entire school
        'tenant_user': '5000/hour',   # Individual limit within a school
    }
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://localhost:3001,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:5173',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-tenant-id',  # Custom header for tenant identification
    'x-tenant-subdomain',  # Custom header for tenant subdomain
]

# API Documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'School Management System API',
    'DESCRIPTION': 'Comprehensive API for managing schools, students, staff, academics, and more',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
}

# Celery Configuration
CELERY_BROKER_URL = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('REDIS_URL', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
# Celery workers use a longer statement_timeout for bulk operations
CELERY_WORKER_DB_OPTIONS = '-c search_path=public -c statement_timeout=300000'  # 5 minutes

# Celery Beat — periodic task schedule
from celery.schedules import crontab  # noqa: E402
CELERY_BEAT_SCHEDULE = {
    # Send 7-day and 1-day expiry warnings every day at 8 AM IST
    'check-expiring-subscriptions': {
        'task': 'apps.tenants.tasks.check_expiring_subscriptions',
        'schedule': crontab(hour=8, minute=0),
    },
    # Deactivate schools 7 days past expiry — runs daily at 9 AM IST
    'deactivate-expired-tenants': {
        'task': 'apps.tenants.tasks.deactivate_expired_tenants',
        'schedule': crontab(hour=9, minute=0),
    },
}

# Cache Configuration - Using local memory for now (Redis not installed)
# Cache Configuration
# Use LocMemCache for development, Redis for production
USE_REDIS_CACHE = config('USE_REDIS_CACHE', default=False, cast=bool)

if USE_REDIS_CACHE:
    # Production: Redis Cache (faster, supports clustering)
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': config('REDIS_URL', default='redis://localhost:6379/1'),
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
                'SOCKET_CONNECT_TIMEOUT': 5,
                'SOCKET_TIMEOUT': 5,
                'CONNECTION_POOL_KWARGS': {
                    'max_connections': 50,
                    'retry_on_timeout': True,
                },
                # Enable compression for large values
                'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor',
                # Pickle protocol version
                'PICKLE_VERSION': -1,
            },
            'KEY_PREFIX': 'school_mgmt',
            'TIMEOUT': 300,  # Default 5 minutes
        }
    }
else:
    # Development: Local Memory Cache (simpler, no dependencies)
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'school-mgmt-cache',
            'OPTIONS': {
                'MAX_ENTRIES': 1000,  # Limit memory usage
            },
            'TIMEOUT': 300,
        }
    }

# Session Configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Email Configuration
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = config('EMAIL_HOST', default='localhost')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='noreply@schoolmgmt.com')

# SMS Configuration
SMS_PROVIDER = config('SMS_PROVIDER', default='twilio')
TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID', default='')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN', default='')
TWILIO_PHONE_NUMBER = config('TWILIO_PHONE_NUMBER', default='')

# Payment Gateway Configuration
RAZORPAY_KEY_ID = config('RAZORPAY_KEY_ID', default='')
RAZORPAY_KEY_SECRET = config('RAZORPAY_KEY_SECRET', default='')

PAYU_MERCHANT_KEY = config('PAYU_MERCHANT_KEY', default='')
PAYU_MERCHANT_SALT = config('PAYU_MERCHANT_SALT', default='')

STRIPE_PUBLISHABLE_KEY = config('STRIPE_PUBLISHABLE_KEY', default='')
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY', default='')

# Field Encryption Configuration (DPDP Act 2023 Compliance)
# Generate key: python -c 'import secrets; print(secrets.token_urlsafe(32))'
# Store in .env file: FIELD_ENCRYPTION_KEY=<generated_key>
# REQUIRED in production — no insecure default; app will fail at startup if not set
_FIELD_ENCRYPTION_KEY_RAW = config(
    'FIELD_ENCRYPTION_KEY',
    default=None
)
if not _FIELD_ENCRYPTION_KEY_RAW:
    if not DEBUG:
        raise RuntimeError(
            "FIELD_ENCRYPTION_KEY environment variable is required in production. "
            "Generate with: python -c 'import secrets; print(secrets.token_urlsafe(32))'"
        )
    # Dev/test fallback only — never used in production due to DEBUG check above
    _FIELD_ENCRYPTION_KEY_RAW = 'dev-only-insecure-key-not-for-production-use'
FIELD_ENCRYPTION_KEY = _FIELD_ENCRYPTION_KEY_RAW

# File Upload Configuration
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'filters': {
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'school_mgmt.log',
            'maxBytes': 1024 * 1024 * 15,  # 15MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Security Settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Tenant Configuration
TENANT_MODEL = 'tenants.School'
TENANT_DOMAIN_MODEL = 'tenants.Domain'

# Library Module Configuration
LIBRARY_FINE_PER_DAY = 10  # Fine amount per day for overdue books (in ₹)
LIBRARY_MAX_BOOKS_PER_USER = 5  # Maximum books a user can borrow simultaneously
LIBRARY_DEFAULT_ISSUE_DAYS = 14  # Default number of days for book issue

# Jazzmin Configuration
JAZZMIN_SETTINGS = {
    # title of the window (Will default to current_admin_site.site_title if absent or None)
    "site_title": "School Admin",

    # Title on the login screen (19 chars max) (defaults to current_admin_site.site_header if absent or None)
    "site_header": "School Management",

    # Title on the brand (19 chars max) (defaults to current_admin_site.site_header if absent or None)
    "site_brand": "School Management",

    # Logo to use for your site, must be present in static files, used for brand on top left
    # "site_logo": "images/logo.png",

    # Logo to use for your site, must be present in static files, used for login form logo (defaults to site_logo)
    # "login_logo": None,

    # Logo to use for email authentication within the admin logic (defaults to site_logo)
    # "login_logo_dark": None,

    # CSS classes that are applied to the logo above
    "site_logo_classes": "img-circle",

    # Relative path to a favicon for your site, will default to site_logo if absent (ideally 32x32 pixel)
    "site_icon": None,

    # Welcome text on the login screen
    "welcome_sign": "Welcome to School Management Platform",

    # Copyright on the footer
    "copyright": "School Management System Limited",

    # List of model admins to search from the search bar, search bar omitted if excluded
    "search_model": ["authentication.User", "tenants.School"],

    ############
    # Top Menu #
    ############

    # Links to put along the top menu
    "topmenu_links": [
        {"name": "Home",  "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Frontend", "url": "http://localhost:3000", "new_window": True},
        {"model": "authentication.User"},
    ],

    #############
    # User Menu #
    #############

    # Additional links to include in the user menu on the top right ("app" url type is not allowed)
    "usermenu_links": [
        {"name": "Support", "url": "https://github.com/farridav/django-jazzmin/issues", "new_window": True},
        {"model": "authentication.User"}
    ],

    #############
    # Side Menu #
    #############

    # Whether to display the side menu
    "show_sidebar": True,

    # Whether to aut expand the menu
    "navigation_expanded": True,

    # Hide these apps when generating side menu e.g (auth)
    "hide_apps": [],

    # Hide these models when generating side menu (e.g auth.user)
    "hide_models": [],

    # List of apps (and/or models) to base side menu ordering off of (does not need to contain all apps/models)
    "order_with_respect_to": [
        "tenants",
        "students",
        "admissions",
        "staff",
        "academics",
        "attendance",
        "timetable",
        "examinations",
        "finance",
        "library",
        "transport",
        "hostel",
        "hr_payroll",
        "reports",
        "government_reports",
        "authentication",
        "auth"
    ],

    # Custom icons for side menu apps/models See https://fontawesome.com/icons?d=gallery&m=free&v=5.0.0,5.0.1,5.0.10,5.0.11,5.0.12,5.0.13,5.0.2,5.0.3,5.0.4,5.0.5,5.0.6,5.0.7,5.0.8,5.0.9,5.1.0,5.1.1,5.2.0,5.3.0,5.3.1,5.4.0,5.4.1,5.4.2,5.13.0,5.12.0,5.11.2,5.11.1,5.10.0,5.9.0,5.8.2,5.8.1,5.7.2,5.7.1,5.7.0,5.6.3,5.5.0,5.4.2
    # for the full list of 5.13.0 free icon classes
    "icons": {
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        
        "tenants.School": "fas fa-school",
        "tenants.Subscription": "fas fa-file-invoice-dollar",
        
        "students.Student": "fas fa-user-graduate",
        "students.StudentParent": "fas fa-user-friends",
        "students.StudentHealthRecord": "fas fa-heartbeat",
        "students.StudentDocument": "fas fa-file-alt",
        
        "staff.StaffMember": "fas fa-chalkboard-teacher",
        "staff.StaffLeave": "fas fa-calendar-minus",
        
        "academics.Class": "fas fa-chalkboard",
        "academics.Section": "fas fa-layer-group",
        "academics.Subject": "fas fa-book",
        
        "attendance.StudentAttendanceRecord": "fas fa-clipboard-check",
        
        "finance.FeeStructure": "fas fa-money-check-alt",
        "finance.FeeTransaction": "fas fa-rupee-sign",

        "admissions.AdmissionEnquiry": "fas fa-question-circle",
        "admissions.AdmissionApplication": "fas fa-file-signature",
        "admissions.AdmissionDocument": "fas fa-folder-open",
        "admissions.AdmissionSetting": "fas fa-cogs",

        "hostel.Hostel": "fas fa-building",
        "hostel.Room": "fas fa-door-open",
        "hostel.RoomAllocation": "fas fa-bed",
        "hostel.HostelAttendance": "fas fa-clipboard-list",
        "hostel.MessMenu": "fas fa-utensils",
        "hostel.HostelComplaint": "fas fa-exclamation-triangle",
        "hostel.HostelVisitor": "fas fa-user-clock",

        "hr_payroll.Department": "fas fa-sitemap",
        "hr_payroll.Designation": "fas fa-id-badge",
        "hr_payroll.SalaryComponent": "fas fa-puzzle-piece",
        "hr_payroll.SalaryStructure": "fas fa-project-diagram",
        "hr_payroll.PayrollRun": "fas fa-calculator",
        "hr_payroll.Payslip": "fas fa-file-invoice-dollar",

        "reports.ReportTemplate": "fas fa-file-alt",
        "reports.GeneratedReport": "fas fa-chart-bar",
        "reports.ReportSchedule": "fas fa-clock",
        "reports.SavedReport": "fas fa-bookmark",
        "government_reports.ReportGeneration": "fas fa-file-contract",
        "government_reports.RTEComplianceRecord": "fas fa-balance-scale",
    },
    
    # Icons that are used when one is not specified
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    #################
    # Related Modal #
    #################
    # Use modals instead of popups
    "related_modal_active": True,

    #############
    # UI Tweaks #
    #############
    # Relative paths to custom CSS/JS scripts (must be present in static files)
    # Relative paths to custom CSS/JS scripts (must be present in static files)
    "custom_css": "css/admin_theme.css",
    "custom_js": None,
    # Whether to link font from fonts.googleapis.com (use custom_css to supply font otherwise)
    "use_google_fonts_cdn": True,
    # Whether to show the UI customizer on the sidebar
    "show_ui_builder": False,
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": True,
    "brand_small_text": False,
    "brand_colour": "navbar-navy",
    "accent": "accent-primary",
    "navbar": "navbar-navy navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "flatly",
    "dark_mode_theme": "darkly",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}
