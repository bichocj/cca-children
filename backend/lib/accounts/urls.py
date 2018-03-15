from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import api, views

app_name = 'accounts'

router = DefaultRouter()
router.register('user', api.UserViewSet, base_name='api_user')

apipatterns = router.urls + []

urlpatterns = [
    path('api/', include(apipatterns)),
    path('signup/', views.signup, name='signup'),
]
