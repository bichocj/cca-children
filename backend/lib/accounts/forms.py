from django import forms
from django.conf import settings
from django.contrib.auth import password_validation
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _


class SignupForm(forms.ModelForm):
    """Create user form."""

    class Meta:
        """Signup form meta data."""

        model = User
        fields = ('username', 'email', 'password')

    def __init__(self, *args, **kwargs):
        """Set required and widgets for fields."""
        super(SignupForm, self).__init__(*args, **kwargs)
        self.fields['email'].required = True
        self.fields['password'].widget = forms.PasswordInput()

    def clean_username(self):
        """Validate if username is already taken."""
        username = self.cleaned_data['username'].lower()
        if (User.objects.filter(username__iexact=username).exists() or
                username in settings.ACCOUNT_USERNAME_BLACKLIST):
            raise ValidationError(_('A user with that username already exists.'))
        return username

    def clean_email(self):
        """Validate if email is already used by other user."""
        email = self.cleaned_data['email'].lower()
        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError(_('A user with that email already exists.'))
        return email

    def clean_password(self):
        """Validate password with settings constraints."""
        password = self.cleaned_data.get('password')
        password_validation.validate_password(self.cleaned_data.get('password'), self.instance)
        return password

    def save(self, commit=True):
        """Set email and password for new user."""
        user = super(SignupForm, self).save(commit=False)
        user.email = self.cleaned_data.get('email')
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user
