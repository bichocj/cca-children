from django.contrib.auth import password_validation
from django.contrib.auth.models import User
from django.utils.translation import gettext as _
from rest_framework import exceptions, serializers



class ChangePasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    new_password2 = serializers.CharField(required=True)

    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value

    def validate(self, validated_data):
        new_password = validated_data['new_password']
        new_password2 = validated_data['new_password2']
        if new_password != new_password2:
            raise serializers.ValidationError('Las contraseñas no coinciden.')

        return validated_data


class UserSerializer(serializers.ModelSerializer):
    # password = serializers.CharField(write_only=True)
    # first_name = serializers.CharField(max_length=30, required=False)
    # last_name = serializers.CharField(max_length=150, required=False)
    # email = serializers.EmailField()
    # phone = serializers.CharField(max_length=12, required=False)
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'phone')

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def create(self, validated_data):
        # Validate email is not already in use.
        email = validated_data['email']
        if User.objects.filter(email=email).exists():
            raise exceptions.ValidationError(
                {'email': [_('A user with that email already exists.')]})

        user = User.objects.create(**validated_data)
        #user.set_password(new_password)

        user.profile.phone = validated_data['phone']
        user.profile.save()
        #user.save()
        return user

    def update(self, instance, validated_data):

        if self.context['request'].user == instance:
            instance.email = validated_data.get('email', instance.email)
            instance.username = validated_data.get('username', instance.username)
            instance.first_name = validated_data.get('first_name', instance.first_name)
            instance.last_name = validated_data.get('last_name', instance.last_name)        
            instance.profile.phone = validated_data.get('phone', instance.profile.phone)
            password = validated_data.get('password', None)

            instance.set_password(password)
            instance.save()

            return instance
            
        else:
            raise Http404