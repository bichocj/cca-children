from django.urls import path, re_path
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from dashboard import views_people
from dashboard import views_attendance
from . import views

app_name = 'dashboard'

urlpatterns = [
  path('', TemplateView.as_view(template_name="dashboard/index.html"), name='home'),
  path('attendances/', views_attendance.in_spaces, name='attendance_in_spaces'),
  path('attendances/create/', views_attendance.create, name='attendance'),
  path('out/', views_attendance.leave, name='attendance_leave'),  
  path('attendance/save/', views_attendance.save, name='attendance_save'),
  path('attendance/release/<int:id>/', views_attendance.release, name='attendance_release'),
  path('attendance/receive/<int:id>/', views_attendance.receive, name='attendance_receive'),
  path('checkout/', TemplateView.as_view(template_name="dashboard/checkout.html"), name='attendance_checkout'),
  path('verify-code/<int:id>/', views_attendance.verify_code, name='verify-code'),
  path('verify-dni/<int:dni>/', views_attendance.verify_dni, name='verify-dni'),

  path('family/', login_required(TemplateView.as_view(template_name="dashboard/family.html")), name='family'),
  path('family/create/', views_people.family_create, name='family_create'),
  path('people/', views_people.show_all, name='people_show_all'),
  path('people/create/', views_people.create, name='people_create'),
  path('people/create-person/', views_people.create_person, name='people_create_person'),
  path('people/show-detail/<str:dni>/', views_people.show_details, name='people_show_detail'),
  re_path(r'^get-children/(?P<dni>[0-9]{8})/$', views_people.get_children, name='get-children'),
  re_path(r'^get-person/(?P<dni>[0-9]{8})/$', views_people.get_person, name='get-person'),

]