import json
from pyexpat import model
from urllib import response
import requests
from django.shortcuts import redirect, render
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseBadRequest
from django.urls import reverse
from django.conf import settings
from django.contrib.auth.decorators import login_required
import datetime
from . import forms, models
from django.core.mail import EmailMultiAlternatives, send_mail
from django.template import loader


class DateTimeEncoder(json.JSONEncoder):
        #Override the default method
        def default(self, obj):
            if isinstance(obj, (datetime.date, datetime.datetime)):
                return obj.isoformat()


def show_all(request):
  people = models.Person.objects.all()
  return render(request, 'dashboard/people/show_all.html', locals())

def create(request):
  title = 'Agregar Persona'
  if request.POST:
    form = forms.PersonForm(request.POST)
    if form.is_valid():
      form.save()
      return redirect(reverse('dashboard:people_show_all'))
  else:
    form = forms.PersonForm()
  return render(request, 'dashboard/form.html', locals())

def show_details(request, dni):
  try:
    person = models.Person.objects.get(dni=dni)
    relations = models.ChildSib.objects.select_related('child').filter(sib=person)
    return render(request, 'dashboard/people/show_details.html', locals())
  except models.Person.DoesNotExist:
    return redirect(reverse('dashboard:people_show_all'))

def family_create(request):
  import pdb; pdb.set_trace()
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
    to_email = [parent_a.email, parent_b.email]
    subject = 'La Comunidad | Junior'
    send_mail(subject, '', from_email, to_email, fail_silently=True, html_message=html_content)    


    return JsonResponse({'success': True})
  except:
    return JsonResponse({'success': False})


@login_required
def getChildren(request, dni):
  try:
    person = models.Person.objects.get(dni=dni)
    relations = models.ChildSib.objects.select_related('child').filter(sib=person)
    response = []
    for rs in relations:
      response.append({
        'id': rs.child.id,
        'dni': rs.child.dni,
        'name': rs.child.name,
        'relationship': rs.get_relationship_down_display(),
        'dateOfBirth': rs.child.date_of_birth
      })
    return JsonResponse({'data': response})
  except models.Person.DoesNotExist:
    return HttpResponseBadRequest()

def getPerson(request, dni):
  try:
    person = models.Person.objects.get(dni=dni)
  except models.Person.DoesNotExist:
#     #protocol = 'https' if request.is_secure() else 'http'
    protocol = 'https'
    url = '{}://dniruc.apisperu.com/api/v1/dni/{}?token={}'.format(protocol, dni, settings.APIS_PERU_TOKEN)
    response = requests.get(url, headers={"Content-Type": "application/json"})
    personTmp = response.json()
    if not personTmp.get('success', True):
      serialized = json.dumps({'message':'bad dni'})
      return HttpResponseBadRequest(serialized, content_type='application/json')
    name = personTmp.get('nombres', '') + ' ' + personTmp.get('apellidoPaterno', '') + ' ' + personTmp.get('apellidoMaterno', '')
    person = models.Person(dni=dni, name=name)
    if request.GET.get('commit'):
      person.save()
  
  dict_obj = model_to_dict(person)
  serialized = json.dumps(dict_obj, indent=4, cls=DateTimeEncoder)

  return HttpResponse(serialized, content_type='application/json')


def create_person(request):
  body = json.loads(request.body)
  parent = body.get('parent')
  if parent:
    id = parent.get('id', None)
    dni = parent.get('dni', None)
    name = parent.get('name', '')
    email = parent.get('email', '')
    cellphone = parent.get('cellphone', '')
    date_of_birth = parent.get('dateOfBirth', None)
    if id:
      person = models.Person.objects.get(id=id)
      person.name = name
      person.email = email
      person.cellphone = cellphone
      person.date_of_birth = date_of_birth
      person.save()
    else:
      if dni:
        try:
          person = models.Person.objects.get(dni=dni)  
          return JsonResponse({'success': False, 'id': person.id})      
        except models.Person.DoesNotExist:
          pass    
      person = models.Person.objects.create(dni=dni, name=name, cellphone=cellphone, date_of_birth=date_of_birth, email=email)
  return JsonResponse({'success': True, 'id': person.id})

