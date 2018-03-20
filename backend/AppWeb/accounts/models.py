from django.contrib.auth.models import User
from django.db import models

from .helpers import profile_image_path

class Profile(models.Model):
    """An extension of user model."""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to=profile_image_path,
                               default='defaults/img/default-user.png')
    phone = models.CharField(max_length=12)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Return username's name."""
        return f'{self.user.username} profile'