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
  if request.POST:
    code = request.POST.get('code')
    codeparsed = int(code) / 13
    children = request.POST.getlist('children[]')
    try:
      attendance = models.Attendance.objects.get(id=codeparsed)
      details = models.AttendanceDetail.objects.filter(attendance=attendance)
      if children:
        for d in details:
          if d.child in children:
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

    
    context = { 'code': attendance.id * 13 }
    plaintext = loader.get_template('email/register.txt')
    htmly = loader.get_template('email/register.html')
    text_content = plaintext.render(context)
    html_content = htmly.render(context)
    
    from_email = settings.FROM_EMAIL
    to_email = [parent_a.email,]
    subject = 'La Comunidad | Junior'
    send_mail(subject, '', from_email, to_email, fail_silently=True, html_message=html_content)    
    return JsonResponse({'success': True})
  except Exception as e:
    print(e)
  return JsonResponse({'success': False})