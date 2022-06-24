import json
from django.http import JsonResponse
from . import models
from django.shortcuts import redirect, render
from django.db.models import Count
from django.contrib.auth.decorators import login_required
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template import loader
from django.conf import settings
from datetime import datetime 
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseRedirect

@login_required
def create(request):
  spaces = models.Space.objects.all()
  for space in spaces:
    space.current = 1
    #space.current = models.AttendanceDetail.objects.filter(space=space).values('id').distinct().annotate(Count('id'))
    #import pdb; pdb.set_trace()
    pass
  return render(request, 'dashboard/attendance_in.html', locals())

@login_required
def leave(request):
  ids = request.GET.getlist('ids[]')  
  details = models.AttendanceDetail.objects.select_related('child').filter(attendance__id__in=ids)
  ids_str = ''
  for id in ids:
    ids_str += 'ids[]=' + id + '&'
  if request.POST:
    children = request.POST.getlist('children[]')
    try:
      if children:
        for d in details:
          if str(d.id) in children:
            d.end_at = datetime.now()
            d.save()
    except models.Attendance.DoesNotExist:
      message = 'el codigo ingresado no existe'
  return render(request, 'dashboard/attendance_out.html', locals())


def save(request):
  try:
    body = json.loads(request.body)
    children = body['children']
    parent_a_id = body['parentA']
    parent_b_id = body['parentB']

    parent_a = models.Person.objects.get(id=parent_a_id)
    parent_b = models.Person.objects.get(id=parent_b_id)
    attendance = models.Attendance.objects.create(parent_a=parent_a, parent_b=parent_b)

    details = []
    for child in children:
      id = child['id']
      spaceId = child['spaceId']
      details.append(models.AttendanceDetail(child=models.Person(id=id),space=models.Space(id=spaceId), attendance=attendance))

    models.AttendanceDetail.objects.bulk_create(details, ignore_conflicts=True)

    to_email = []
    if parent_a.email:
      to_email.append(parent_a.email)    
    if parent_b.email:
      to_email.append(parent_b.email)
    
    if len(to_email) > 0: 
      context = { 'code': attendance.id * 13 }
      plaintext = loader.get_template('email/register.txt')
      htmly = loader.get_template('email/register.html')
      text_content = plaintext.render(context)
      html_content = htmly.render(context)
      
      from_email = settings.FROM_EMAIL
      
      subject = 'La Comunidad | Junior'
      send_mail(subject, '', from_email, to_email, fail_silently=True, html_message=html_content)    
    return JsonResponse({'success': True})
  except Exception as e:
    print(e)
  return JsonResponse({'success': False})

def checkoutAttendance(attendance_id):
  details = models.AttendanceDetail.objects.filter(attendance__id=attendance_id)
  for d in details:
      d.end_at = datetime.now()
      d.save()


@login_required
def verify_code(request, id):
  try:
    code = id
    codeparsed = int(int(code) / 13)
    models.Attendance.objects.get(id=codeparsed)
    checkoutAttendance(codeparsed)
    dict_obj= { 'attendances_ids': [codeparsed] }
    serialized = json.dumps(dict_obj)
    return HttpResponse(serialized, content_type='application/json')
  except models.Attendance.DoesNotExist:
    dict_obj= { 'message': 'el codigo ingresado no existe' }
    serialized = json.dumps(dict_obj)
    return HttpResponseBadRequest(serialized, content_type='application/json')
  return HttpResponseNotFound()

@login_required
def verify_dni(request, dni):
  try:
    person = models.Person.objects.get(dni=dni)
    children = models.ChildSib.objects.values_list('child').filter(sib=person)
    start_at=datetime.now()
    start_at.replace(minute=0, hour=0, second=0, microsecond=0)
    attendances_ids = models.AttendanceDetail.objects.values_list('attendance__id', flat=True).filter(child__in=children, start_at__gt=start_at).distinct()
    attendances_ids = list(attendances_ids)
    if len(attendances_ids) == 1:
      checkoutAttendance(attendances_ids[0])
    dict_obj= { 'attendances_ids': attendances_ids }
    serialized = json.dumps(dict_obj)
    return HttpResponse(serialized, content_type='application/json')
  except models.Person.DoesNotExist:
    return HttpResponseNotFound()