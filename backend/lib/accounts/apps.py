from django.apps import AppConfig


class AccountsConfig(AppConfig):
    name = 'accounts'

    def ready(self):
        """Init tasks when the app is ready."""
        from . import signals  # noqa
