from .base import *  # noqa

# Email settings

EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'

EMAIL_FILE_PATH = os.path.join(BASE_DIR, 'tmp', 'email')

# Application definition

INSTALLED_APPS += [
    'debug_toolbar',
]

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
] + MIDDLEWARE

INTERNAL_IPS = [                                               
    '127.0.0.1',                                               
]                                                              

def show_toolbar(request):                                     
    return True                                                 

DEBUG_TOOLBAR_CONFIG = {                                       
    "SHOW_TOOLBAR_CALLBACK" : show_toolbar,                    
}                                                              

if DEBUG:
    import mimetypes                                                     
    mimetypes.add_type("application/javascript", ".js", True)  