from .base import *
import os

# Sécurité
DEBUG = False
ALLOWED_HOSTS = [
    'kalelsamatch.duckdns.org',
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
]

# Base de données RDS PostgreSQL
# Accepte DB_HOST ou RDS_HOSTNAME (compatibilité .env)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME') or os.environ.get('RDS_DB_NAME', 'ksm'),
        'USER': os.environ.get('DB_USER') or os.environ.get('RDS_USERNAME', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD') or os.environ.get('RDS_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST') or os.environ.get('RDS_HOSTNAME', 'localhost'),
        'PORT': os.environ.get('DB_PORT') or os.environ.get('RDS_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CORS pour production
CORS_ALLOWED_ORIGINS = [
    'https://kalelsamatch.web.app',
    'https://kalelsamatch.duckdns.org',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# Nginx gère le SSL - pas de redirect interne
SECURE_SSL_REDIRECT = False
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Logging robuste (crée le dossier si nécessaire)
import logging.handlers
LOG_DIR = '/var/log/django'
os.makedirs(LOG_DIR, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Email (console par défaut si SMTP non configuré)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = 'noreply@kalelsamatch.com'
