from django.contrib.auth.models import User
from rest_framework import generics, permissions, viewsets
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
