from django.contrib import admin
from . import models

admin.site.register(models.Person)
admin.site.register(models.Attendance)
admin.site.register(models.AttendanceDetail)

class AdminChildSib(admin.ModelAdmin):
  list_display = ('child', 'sib', 'relationship_up', 'relationship_down')

admin.site.register(models.ChildSib, AdminChildSib)
