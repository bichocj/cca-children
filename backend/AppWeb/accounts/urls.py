from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import api

router = DefaultRouter()
router.register('user-address', api.UserAddressViewSet, base_name='api_user_address')

apipatterns = router.urls + [
    path('registration/', api.CreateUserView.as_view()),
    path('users/me/', api.current_user)
]

urlpatterns = [
    path('api/', include(apipatterns)),
]
