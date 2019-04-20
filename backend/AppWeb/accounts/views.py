from django.conf import settings
from django.contrib.auth import authenticate, login
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils.translation import ugettext as _
from . import forms, utils


def signup(request):
    """Display and handle the registration form."""
    next = request.POST.get('next')

    if request.method == 'POST':
        form = forms.SignupForm(request.POST)
        form_profile = forms.ProfileForm(request.POST)
        if form.is_valid() and form_profile.is_valid():
            user = form.save()
            #Set user profile data 
            user_profile_id = user.profile.id           
            user.profile = form_profile.save(commit=False)
            user.profile.id = user_profile_id
            user.profile.save()
            
            # Authenticating 
            username = form.cleaned_data.get('email')
            raw_password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=raw_password)

            login(request, user)
            utils.send_welcome_email(request, user)            
            if next:
              return redirect(next)
            return redirect(settings.LOGIN_REDIRECT_URL)
    else:
        form = forms.SignupForm()
        form_profile = forms.ProfileForm()

    page = {
        'title': _('Signup'),
    }

    context = {
        'form': form,
        'form_profile': form_profile,
        'page': page,
        'next': next,
    }
    return render(request, 'accounts/signup.html', context)

# def message(request, code):
#     if code == 'password_reset':
#         message = _(
#             '<strong>We have sent you an email!</strong> Please, follow the instructions to reset your password.')
#         # messages.add_message(request, messages.INFO, message)
#         return render(request, 'accounts/echo.html', locals())
#         # return redirect(reverse('accounts:password_reset'))
# 
#     if code == 'password_reset_confirm':
#         messages.add_message(request, messages.INFO, _(
#             '<strong>Success!</strong> You have changed your password.'))
#         return redirect(reverse('accounts:login'))
# 
#     if code == 'password_change_done':
#         messages.add_message(request, messages.INFO, _(
#             '<strong>Success!</strong> You have changed your password.'))
#         return redirect(reverse('accounts:password_change'))
# 
#     return redirect(reverse('accounts:profile_edit'))
