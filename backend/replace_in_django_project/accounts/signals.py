from django.contrib.auth.models import User
from django.contrib.auth.signals import user_logged_out
from django.dispatch import receiver


@receiver(user_logged_out, sender=User)
def delete_auth_token(sender, user, request, **kwargs):
    """Destroy the authorization token cookie."""
    cookie = {'key': 'business_pk'}

    try:
        request.delete_cookies
    except AttributeError:
        request.delete_cookies = []
    request.delete_cookies.append(cookie)
