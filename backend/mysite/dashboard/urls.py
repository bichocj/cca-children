from django.urls import path, re_path
from django.views.generic import TemplateView

from dashboard import views_people
from . import views

app_name = 'dashboard'

urlpatterns = [
  path('', TemplateView.as_view(template_name="dashboard/index.html")),
  path('family/', TemplateView.as_view(template_name="dashboard/family.html"), name='family'),
  path('attendance/', TemplateView.as_view(template_name="dashboard/attendance.html"), name='attendance'),
  path('people/', views_people.show_all, name='people_show_all'),
  path('people/create/', views_people.create, name='people_create'),
  path('people/show-detail/<str:dni>/', views_people.show_details, name='people_show_detail'),
  re_path(r'^get-person/(?P<dni>[0-9]{8})/$', views_people.getPerson, name='get-person'),

]