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
    'apps.onboarding',
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
SMS_PROVIDER = config('SMS_PROVIDER', default='msg91')
TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID', default='')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN', default='')
TWILIO_PHONE_NUMBER = config('TWILIO_PHONE_NUMBER', default='')

# MSG91 SMS + WhatsApp Configuration (Workstream B)
MSG91_AUTH_KEY = config('MSG91_AUTH_KEY', default='')
MSG91_SENDER_ID = config('MSG91_SENDER_ID', default='CAMPUS')
MSG91_WHATSAPP_NUMBER = config('MSG91_WHATSAPP_NUMBER', default='')
MSG91_OTP_TEMPLATE_ID = config('MSG91_OTP_TEMPLATE_ID', default='')

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
    # title of the window
    "site_title": "CampusKona Admin",

    # Title on the login screen
    "site_header": "CampusKona",

    # Title on the brand (top left)
    "site_brand": "CampusKona",

    # CSS classes that are applied to the logo above
    "site_logo_classes": "img-circle",

    # Relative path to a favicon for your site
    "site_icon": None,

    # Welcome text on the login screen
    "welcome_sign": "Welcome to CampusKona School Management Platform",

    # Copyright on the footer
    "copyright": "CampusKona School Management System",

    # List of model admins to search from the search bar.
    # IMPORTANT: Only include models whose tables exist in BOTH public AND tenant schemas,
    # or whose absence won't cause 404s. authentication.User and tenants.School only exist
    # in the public schema — including them causes 404 errors on tenant admin pages.
    "search_model": ["students.Student", "staff.StaffMember"],

    ############
    # Top Menu #
    ############
    # IMPORTANT: Do NOT add {"model": "..."} links for public-schema-only apps
    # (authentication, tenants) here — they generate /admin/<app>/<model>/ URLs which
    # are 404s when accessed from tenant subdomains (veda9.campuskona.com/admin/).
    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Frontend", "url": "https://campuskona.com", "new_window": True},
        {"name": "Veda9 School Admin", "url": "https://veda9.campuskona.com/admin/", "new_window": True},
    ],

    #############
    # User Menu #
    #############
    # Removed authentication.User link — it is a public-schema-only model and causes
    # 404 errors when accessed from tenant admin portals.
    "usermenu_links": [
        {"name": "Profile", "url": "/admin/password_change/", "icon": "fas fa-user"},
    ],

    #############
    # Side Menu #
    #############
    "show_sidebar": True,
    "navigation_expanded": True,

    # Hide these apps from the side menu
    "hide_apps": ["auth", "contenttypes"],

    # Hide individual models from the side menu
    "hide_models": [
        "authentication.EmailVerificationToken",
        "authentication.PasswordResetToken",
    ],

    # Sidebar ordering — platform apps first, school apps second.
    # On public schema only shared apps appear; on tenant schema only school apps.
    "order_with_respect_to": [
        # Platform / Shared (visible at campuskona.com/admin/)
        "tenants",
        "authentication",
        "partners",
        "analytics",
        "finance_ledger",
        "platform_finance",
        "core",
        # School / Tenant (visible at <school>.campuskona.com/admin/)
        "students",
        "admissions",
        "staff",
        "hr_payroll",
        "academics",
        "attendance",
        "timetable",
        "examinations",
        "assignments",
        "ai_questions",
        "finance",
        "fee_ledger",
        "communication",
        "library",
        "transport",
        "hostel",
        "houses",
        "activities",
        "privacy",
        "government_reports",
        "reports",
        "workflows",
        "integrations",
    ],

    # Custom sidebar links — "School Portals" section shown in platform admin
    "custom_links": {
        "tenants": [{
            "name": "Veda9 School Admin",
            "url": "https://veda9.campuskona.com/admin/",
            "icon": "fas fa-external-link-alt",
            "new_window": True,
        }, {
            "name": "Demo School Admin",
            "url": "https://demo.campuskona.com/admin/",
            "icon": "fas fa-external-link-alt",
            "new_window": True,
        }],
    },

    # Custom icons for side menu apps/models
    "icons": {
        # ── Platform / Shared ──────────────────────────────────────────────
        "tenants": "fas fa-server",
        "tenants.School": "fas fa-school",
        "tenants.Domain": "fas fa-globe",
        "tenants.Subscription": "fas fa-file-invoice-dollar",
        "tenants.TenantConfig": "fas fa-sliders-h",
        "tenants.TenantFeature": "fas fa-toggle-on",
        "tenants.FeatureDefinition": "fas fa-list-alt",

        "authentication": "fas fa-shield-alt",
        "authentication.User": "fas fa-user",
        "authentication.Role": "fas fa-user-tag",
        "authentication.UserRole": "fas fa-user-lock",
        "authentication.Permission": "fas fa-key",
        "authentication.LoginHistory": "fas fa-history",

        "partners": "fas fa-handshake",
        "partners.Partner": "fas fa-handshake",
        "partners.Lead": "fas fa-funnel-dollar",
        "partners.CommissionRule": "fas fa-percentage",
        "partners.Commission": "fas fa-coins",
        "partners.Payout": "fas fa-money-bill-wave",

        "analytics": "fas fa-chart-line",
        "analytics.InvestorMetric": "fas fa-chart-line",
        "analytics.MarketingSpend": "fas fa-ad",

        "finance_ledger": "fas fa-book-open",
        "finance_ledger.LedgerAccount": "fas fa-wallet",
        "finance_ledger.LedgerTransaction": "fas fa-exchange-alt",
        "finance_ledger.LedgerEntry": "fas fa-list-ol",
        "finance_ledger.FinancialSnapshot": "fas fa-camera",
        "finance_ledger.FinancialAuditLog": "fas fa-search-dollar",

        "platform_finance": "fas fa-landmark",
        "platform_finance.InvestorMetric": "fas fa-chart-pie",
        "platform_finance.InvestorProfile": "fas fa-user-tie",
        "platform_finance.MarketingSpend": "fas fa-bullhorn",
        "platform_finance.FinancialLedger": "fas fa-book",
        "platform_finance.FinancialSnapshot": "fas fa-camera-retro",
        "platform_finance.FinancialReport": "fas fa-file-invoice",
        "platform_finance.RoleBasedAccess": "fas fa-user-shield",
        "platform_finance.AuditLog": "fas fa-history",

        "core": "fas fa-cogs",
        "core.AuditLog": "fas fa-clipboard-list",

        # ── Students ───────────────────────────────────────────────────────
        "students": "fas fa-user-graduate",
        "students.Student": "fas fa-user-graduate",
        "students.StudentParent": "fas fa-users",
        "students.StudentHealthRecord": "fas fa-heartbeat",
        "students.StudentDocument": "fas fa-file-alt",
        "students.StudentNote": "fas fa-sticky-note",

        # ── Admissions ─────────────────────────────────────────────────────
        "admissions": "fas fa-door-open",
        "admissions.AdmissionEnquiry": "fas fa-question-circle",
        "admissions.AdmissionApplication": "fas fa-file-signature",
        "admissions.AdmissionDocument": "fas fa-folder-open",
        "admissions.AdmissionSetting": "fas fa-cogs",

        # ── Staff ──────────────────────────────────────────────────────────
        "staff": "fas fa-chalkboard-teacher",
        "staff.StaffMember": "fas fa-chalkboard-teacher",

        # ── HR & Payroll ───────────────────────────────────────────────────
        "hr_payroll": "fas fa-money-check-alt",
        "hr_payroll.Department": "fas fa-sitemap",
        "hr_payroll.Designation": "fas fa-id-badge",
        "hr_payroll.SalaryComponent": "fas fa-puzzle-piece",
        "hr_payroll.SalaryStructure": "fas fa-project-diagram",
        "hr_payroll.SalaryStructureComponent": "fas fa-th-list",
        "hr_payroll.PayrollRun": "fas fa-calculator",
        "hr_payroll.Payslip": "fas fa-file-invoice-dollar",
        "hr_payroll.PayslipComponent": "fas fa-receipt",

        # ── Academics ──────────────────────────────────────────────────────
        "academics": "fas fa-graduation-cap",
        "academics.AcademicYear": "fas fa-calendar-alt",
        "academics.Board": "fas fa-university",
        "academics.Class": "fas fa-chalkboard",
        "academics.Section": "fas fa-layer-group",
        "academics.Subject": "fas fa-book",
        "academics.ClassSubject": "fas fa-link",
        "academics.StudentEnrollment": "fas fa-user-plus",
        "academics.SyllabusUnit": "fas fa-list",

        # ── Attendance ─────────────────────────────────────────────────────
        "attendance": "fas fa-clipboard-check",
        "attendance.StudentAttendance": "fas fa-user-check",
        "attendance.StaffAttendance": "fas fa-briefcase",
        "attendance.AttendancePeriod": "fas fa-clock",
        "attendance.StudentLeave": "fas fa-calendar-minus",
        "attendance.Holiday": "fas fa-umbrella-beach",
        "attendance.AttendanceSummary": "fas fa-chart-bar",

        # ── Timetable ──────────────────────────────────────────────────────
        "timetable": "fas fa-calendar-week",
        "timetable.TimeSlot": "fas fa-stopwatch",
        "timetable.ClassTimetable": "fas fa-table",
        "timetable.TeacherTimetable": "fas fa-chalkboard-teacher",
        "timetable.TimetableSubstitution": "fas fa-random",
        "timetable.RoomAllocation": "fas fa-door-open",
        "timetable.TimetableTemplate": "fas fa-copy",
        "timetable.TimetableGenerationRun": "fas fa-magic",

        # ── Examinations ───────────────────────────────────────────────────
        "examinations": "fas fa-pencil-alt",
        "examinations.GradeScale": "fas fa-sliders-h",
        "examinations.ExamType": "fas fa-tag",
        "examinations.Examination": "fas fa-file-alt",
        "examinations.ExamSchedule": "fas fa-calendar-check",
        "examinations.StudentMark": "fas fa-star",
        "examinations.ExamResult": "fas fa-poll",
        "examinations.ReportCard": "fas fa-id-card",

        # ── Assignments ────────────────────────────────────────────────────
        "assignments": "fas fa-tasks",
        "assignments.Assignment": "fas fa-tasks",
        "assignments.AssignmentSubmission": "fas fa-upload",

        # ── AI Question Bank ───────────────────────────────────────────────
        "ai_questions": "fas fa-robot",
        "ai_questions.QuestionBank": "fas fa-brain",
        "ai_questions.MCQOption": "fas fa-check-square",

        # ── Finance ────────────────────────────────────────────────────────
        "finance": "fas fa-rupee-sign",
        "finance.FeeCategory": "fas fa-tags",
        "finance.FeeStructure": "fas fa-money-check-alt",
        "finance.StudentFee": "fas fa-file-invoice-dollar",
        "finance.Payment": "fas fa-credit-card",
        "finance.Expense": "fas fa-shopping-cart",
        "finance.Invoice": "fas fa-file-invoice",

        # ── Fee Ledger ─────────────────────────────────────────────────────
        "fee_ledger": "fas fa-ledger",
        "fee_ledger.FeeLedgerEntry": "fas fa-receipt",

        # ── Communication ──────────────────────────────────────────────────
        "communication": "fas fa-bullhorn",
        "communication.Notice": "fas fa-bell",
        "communication.Event": "fas fa-calendar-day",
        "communication.Notification": "fas fa-paper-plane",

        # ── Library ────────────────────────────────────────────────────────
        "library": "fas fa-book-reader",
        "library.Category": "fas fa-folder",
        "library.Author": "fas fa-pen-nib",
        "library.Book": "fas fa-book",
        "library.BookIssue": "fas fa-book-open",

        # ── Transport ──────────────────────────────────────────────────────
        "transport": "fas fa-bus",
        "transport.Vehicle": "fas fa-bus",
        "transport.Driver": "fas fa-id-card",
        "transport.Route": "fas fa-route",
        "transport.Stop": "fas fa-map-marker-alt",
        "transport.TransportAllocation": "fas fa-user-tag",

        # ── Hostel ─────────────────────────────────────────────────────────
        "hostel": "fas fa-hotel",
        "hostel.Hostel": "fas fa-building",
        "hostel.Room": "fas fa-door-closed",
        "hostel.RoomAllocation": "fas fa-bed",
        "hostel.HostelAttendance": "fas fa-clipboard-list",
        "hostel.MessMenu": "fas fa-utensils",
        "hostel.HostelComplaint": "fas fa-exclamation-triangle",
        "hostel.HostelVisitor": "fas fa-user-clock",

        # ── Houses ─────────────────────────────────────────────────────────
        "houses": "fas fa-flag",
        "houses.House": "fas fa-flag",
        "houses.HouseMembership": "fas fa-user-friends",
        "houses.HousePointLog": "fas fa-star",

        # ── Activities / Clubs ─────────────────────────────────────────────
        "activities": "fas fa-running",
        "activities.Club": "fas fa-users",
        "activities.ClubMembership": "fas fa-user-plus",
        "activities.ClubActivity": "fas fa-calendar-day",
        "activities.ActivityAttendance": "fas fa-clipboard-check",

        # ── Privacy / DPDP ─────────────────────────────────────────────────
        "privacy": "fas fa-user-shield",
        "privacy.ConsentPurpose": "fas fa-file-contract",
        "privacy.ParentalConsent": "fas fa-file-signature",
        "privacy.ConsentAuditLog": "fas fa-search",
        "privacy.Grievance": "fas fa-comments",
        "privacy.DataBreach": "fas fa-exclamation-circle",
        "privacy.DeletionRequest": "fas fa-trash-alt",
        "privacy.CorrectionRequest": "fas fa-edit",

        # ── Government Reports ─────────────────────────────────────────────
        "government_reports": "fas fa-landmark",
        "government_reports.ReportGeneration": "fas fa-file-contract",
        "government_reports.RTEComplianceRecord": "fas fa-balance-scale",
        "government_reports.UDISECodeMapping": "fas fa-code-branch",

        # ── Reports ────────────────────────────────────────────────────────
        "reports": "fas fa-chart-bar",
        "reports.ReportTemplate": "fas fa-file-alt",
        "reports.GeneratedReport": "fas fa-chart-bar",
        "reports.ReportSchedule": "fas fa-clock",
        "reports.SavedReport": "fas fa-bookmark",

        # ── Workflows ──────────────────────────────────────────────────────
        "workflows": "fas fa-project-diagram",
        "workflows.WorkflowConfiguration": "fas fa-cogs",
        "workflows.WorkflowStep": "fas fa-shoe-prints",
        "workflows.WorkflowRequest": "fas fa-inbox",
        "workflows.WorkflowActionLog": "fas fa-history",

        # ── Integrations ───────────────────────────────────────────────────
        "integrations": "fas fa-plug",
        "integrations.Integration": "fas fa-plug",
        "integrations.IntegrationCredential": "fas fa-key",
        "integrations.WebhookSubscription": "fas fa-satellite-dish",
        "integrations.WebhookEvent": "fas fa-bolt",
        "integrations.WebhookDelivery": "fas fa-paper-plane",
    },

    # Icons used when none is specified
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",

    #################
    # Related Modal #
    #################
    "related_modal_active": True,

    #############
    # UI Tweaks #
    #############
    "custom_css": "css/admin_theme.css",
    "custom_js": None,
    "use_google_fonts_cdn": True,
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
