from django import forms


class BootstrapStyleForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        """Set required and widgets for fields."""
        super(BootstrapStyleForm, self).__init__(*args, **kwargs)
        for field in self.fields:
            self.fields[field].widget.attrs.update(
                {
                    'class': 'form-control', # could add form-control-sm
                }
            )
