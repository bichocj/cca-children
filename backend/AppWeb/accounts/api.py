import django_filters
from django.contrib.auth.models import User
from rest_framework import exceptions, generics, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from . import models, serializers


class CreateUserView(generics.CreateAPIView):
    model = User
    permission_classes = [permissions.AllowAny]
    serializer_class = serializers.UserSerializer


@api_view(['GET'])
@permission_classes((permissions.IsAuthenticated, ))
def current_user(request):
    serializer = serializers.UserSerializer(request.user)
    return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    """Create, retrieve and destroy a Business instance."""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.UserSerializer

    filter_backends = (django_filters.rest_framework.DjangoFilterBackend,)
    queryset = User.objects.all()
    filter_fields = {'username': ['icontains']}

    def get_object(self):
        user = super().get_object()
        if user != self.request.user:
            raise exceptions.PermissionDenied({
                'message': 'You don\'t have permissions to access this view'})
        return user

    def update(self, request, *args, **kwargs):
        new_password = request.data.get('new_password')
        old_password = request.data.get('old_password')

        if new_password and old_password:
            user = self.get_object()
            serializer = serializers.ChangePasswordSerializer(data=request.data)

            if serializer.is_valid():
                if not user.check_password(old_password):
                    return response.Response({
                        'old_password': ['La contraseña es incorrecta.']},
                        status=status.HTTP_400_BAD_REQUEST)

                user.set_password(new_password)
                user.save()
                return response.Response()

            return response.Response(serializer.errors,
                                     status=status.HTTP_400_BAD_REQUEST)

        return super().update(request, *args, **kwargs)
