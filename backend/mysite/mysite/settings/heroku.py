import os
import dj_database_url
from .base import * 

INSTALLED_APPS += [
    'storages',
	'django.contrib.postgres',
]

# Database

db_from_env = dj_database_url.config(conn_max_age=500)
DATABASES['default'].update(db_from_env)

WHITENOISE_STATIC_PREFIX = STATIC_URL
STATIC_URL = os.environ.get('DJANGO_STATIC_HOST', STATIC_URL)

ALLOWED_HOSTS = ['.herokuapp.com',]

DEBUG = False

SECURE_SSL_REDIRECT = True
