from django.contrib.auth.models import User
from django.utils.translation import gettext as _
from rest_framework import exceptions, serializers
from . import models


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=30, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=12, required=False)
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'phone')

    def create(self, validated_data):
        # Validate email is not already in use.
        email = validated_data['email']
        if User.objects.filter(email=email).exists():
            raise exceptions.ValidationError(
                {'email': [_('A user with that email already exists.')]})

        user = User.objects.create(
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.profile.phone = validated_data['phone']
        user.save()


        return user
