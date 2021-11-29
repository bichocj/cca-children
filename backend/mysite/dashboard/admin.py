from django.contrib import admin
from . import models

admin.site.register(models.Person)
admin.site.register(models.ChildSib)
admin.site.register(models.Attendance)
admin.site.register(models.AttendanceDetail)
