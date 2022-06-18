from django.contrib import admin
from . import models

admin.site.register(models.Person)
admin.site.register(models.Space)

class AttendanceAdmin(admin.ModelAdmin):
  list_display = ('parent_a', 'parent_b', 'created_at')

admin.site.register(models.Attendance, AttendanceAdmin)

class AttendanceDetailAdmin(admin.ModelAdmin):
  list_display = ('child', 'space')

admin.site.register(models.AttendanceDetail, AttendanceDetailAdmin)
