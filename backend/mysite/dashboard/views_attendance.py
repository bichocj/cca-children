import json
from django.http import JsonResponse
from . import models
from django.shortcuts import redirect, render
from django.db.models import Count

def create(request):
  spaces = models.Space.objects.all()
  for space in spaces:
    space.current = 1
    #space.current = models.AttendanceDetail.objects.filter(space=space).values('id').distinct().annotate(Count('id'))
    #import pdb; pdb.set_trace()
    pass
  return render(request, 'dashboard/attendance_in.html', locals())

def leave(request):
  if request.POST:
    code = request.POST.get('code')
    code = int(code) / 13
    try:
      attendance = models.Attendance.objects.get(id=code)
      details = models.AttendanceDetail.objects.filter(attendance=attendance)
    except model.Attendance.DoesNotExist:
      message = 'el codigo ingresado no existe'
  return render(request, 'dashboard/attendance_out.html', locals())

