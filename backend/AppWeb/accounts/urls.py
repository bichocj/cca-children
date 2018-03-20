from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import api

router = DefaultRouter()
apipatterns = router.urls + [
    path('registration/', api.CreateUserView.as_view()),
    path('users/me/', api.current_user)
]

urlpatterns = [
    path('api/', include(apipatterns)),
]
