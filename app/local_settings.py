# python imports
try:  # a dummy import for the IDE to handle variable names
    from settings import *
except ImportError:
    pass

# django imports

DEBUG = True
TEMPLATE_DEBUG = DEBUG
TESTING = False

ADMINS = (
    ('yks', 'yks-uno@ya.ru'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'app',
        'USER': 'app',
        'PASSWORD': 'app',
        'HOST': '',
        'PORT': '',
    }
}


EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
