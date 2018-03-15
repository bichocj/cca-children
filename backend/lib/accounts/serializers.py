from django.contrib.auth import password_validation
from django.contrib.auth.models import User
from rest_framework import serializers


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
    """User model serializers."""

    class Meta:
        """User serializer meta data."""

        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'password')
        extra_kwargs = {
            'password': {
                'write_only': False,
                'required': True
            }
        }

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
