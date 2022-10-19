from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit, Button, HTML
from django import forms
from django.core.exceptions import ValidationError
from . import models

class PersonForm(forms.ModelForm):    
    class Meta:
        model = models.PersonApp
        fields = ('dni', 'name', 'email', 'cellphone')

    helper = FormHelper()
    helper.add_input(Button('button', 'Cancelar', css_class='btn btn-light ms-2 mb-3', onclick="javascript:location.href = '/';"))
    helper.add_input(Submit('submit', 'Guardar', css_class='btn btn-primary ms-2 mb-3'))

    def clean_dni(self):
        dni = self.cleaned_data['dni']
        try:
          models.PersonApp.objects.get(dni=dni)
          raise ValidationError("este dni ya fue registrado anteriormente")
        except models.PersonApp.DoesNotExist:
          return dni