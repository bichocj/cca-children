from django.contrib import admin
from . import models

admin.site.register(models.PersonApp)
admin.site.register(models.Space)

class AttendanceAdmin(admin.ModelAdmin):
  list_display = ('parent_a', 'parent_b', 'start_at')

admin.site.register(models.Attendance, AttendanceAdmin)

class AttendanceDetailAdmin(admin.ModelAdmin):
  list_display = ('child', 'space')

admin.site.register(models.AttendanceDetail, AttendanceDetailAdmin)

class AdminChildSib(admin.ModelAdmin):
  list_display = ('child', 'sib', 'relationship_up', 'relationship_down')
  
admin.site.register(models.ChildSib, AdminChildSib)