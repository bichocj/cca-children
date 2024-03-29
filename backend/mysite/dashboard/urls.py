from django.urls import path, re_path
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from dashboard import views_people
from dashboard import views_attendance
from . import views

app_name = 'dashboard'

urlpatterns = [
  path('', login_required(TemplateView.as_view(template_name="dashboard/index.html"))),
  path('family/', login_required(TemplateView.as_view(template_name="dashboard/family.html")), name='family'),
  path('family/create/', views_people.family_create, name='family_create'),
  path('attendance/', login_required(TemplateView.as_view(template_name="dashboard/attendance.html")), name='attendance'),  
  path('attendance/create/', views_attendance.create, name='attendance_create'),
  path('people/', views_people.show_all, name='people_show_all'),
  path('people/create/', views_people.create, name='people_create'),
  path('people/show-detail/<str:dni>/', views_people.show_details, name='people_show_detail'),
  re_path(r'^get-children/(?P<dni>[0-9]{8})/$', views_people.getChildren, name='get-children'),
  re_path(r'^get-person/(?P<dni>[0-9]{8})/$', views_people.getPerson, name='get-person'),

]