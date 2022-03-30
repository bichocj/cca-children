import json
from django.http import JsonResponse
from . import models


def create(request):
  body = json.loads(request.body)
  parent = body['parent'];
  children = body['children'];
  attendance = models.Attendance.objects.create(sib=models.Person(id=parent))
  objs = []
  for c in children:
    objs.append(models.AttendanceDetail(attendance=attendance, child=models.Person(id=c)))
  
  models.AttendanceDetail.objects.bulk_create(objs, ignore_conflicts=True)

  return JsonResponse({'success': True, 'attendanceId': attendance.id})

