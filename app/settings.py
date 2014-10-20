# python imports
import os
import sys
import locale

locale.setlocale(locale.LC_ALL, 'ru_RU.UTF-8')

# django imports
from django.core.urlresolvers import reverse_lazy

PROJECT_NAME = "app"

DIRNAME = os.path.dirname(__file__)
PROJECT_DIR = os.path.dirname(DIRNAME)

# ### see local_settings ###
DEBUG = False
TEMPLATE_DEBUG = DEBUG
TESTING = False

DEFAULT_FROM_EMAIL = 'info@YOURSITE.ru'

ADMINS = (
    ('yks', 'yks-uno@ya.ru'),
)

MANAGERS = ADMINS

# ### see local_settings ###
DATABASES = None

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Europe/Moscow'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'ru'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True
USE_L10N = True

# static files settings
STATIC_URL = '/www/'
STATIC_ROOT = os.path.join(PROJECT_DIR, "www")

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = STATIC_URL + 'media/'

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = os.path.join(STATIC_ROOT, "media")

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
ADMIN_MEDIA_PREFIX = STATIC_URL + 'admin/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'md8asdjkankj;dfw;ijenfJINIJDFijnqw@Bn(*r3n*'

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
)

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'yz.catalog.middleware.CatalogMiddleware',
    'yz.core.middleware.UploadFileNameMiddleware',
    'yz.core.middleware.AjaxDebugMiddleware',
)

ROOT_URLCONF = '%s.urls' % PROJECT_NAME

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = '%s.wsgi.application' % PROJECT_NAME

TEMPLATE_DIRS = (
    os.path.join(PROJECT_DIR, 'templates'),
)

INSTALLED_APPS = (
    "django.contrib.admin",
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.messages',
    'south',
#    'wgcache',
)

#LOGIN_URL = reverse_lazy('yz_login')  # "/login/"

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.debug',
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.request',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.contrib.messages.context_processors.messages',
)

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)

# For sql_queries
INTERNAL_IPS = (
    "127.0.0.1",
)


CACHES = {
    'default': {
        #'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'KEY_PREFIX': PROJECT_NAME,
    }
}

LOG_FILE = os.path.join(PROJECT_DIR, "app.log")
LOGGING = {
    "version": 1,
    "formatters": {
        "verbose": {
            "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        'logfile': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': LOG_FILE,
            'mode': 'a',
            'maxBytes': 1000000,
            'backupCount': 5,
        },
    },
    "loggers": {
        "root": {
            "handlers": ["logfile", "console"],
            "level": "INFO",
        },
        "default": {
            "handlers": ["logfile", "console"],
            "level": "DEBUG",
            "propagate": False,
        },
        "django.db.backends": {
            "handlers": ["logfile", "console"],
            "level": "DEBUG",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["logfile", "console"],
            "level": "DEBUG",
            "propagate": False,
        },
    }
}

try:
    execfile(os.path.join(DIRNAME, 'local_settings.py'))
    # from local_settings import *
# except ImportError:
except IOError:
    try:
        execfile(os.path.join(DIRNAME, 'server_settings.py'))
        # from server_settings import *
    # except ImportError:
    except IOError:
        pass

if DEBUG:
    INSTALLED_APPS += (
        'debug_toolbar',
    )
