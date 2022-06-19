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

ROL_CHOICES = {
        '3': 3,
        '4': 7,
        '5': 10,
        '6': 6,
      }

def family_create(request):
  body = json.loads(request.body)
  children = body['children'];
  others = body['others'];
  mom = body['mom'];
  dad = body['dad'];

  objs = []

  for child in children:
    if mom:
      objs.append(models.ChildSib(child=models.Person(id=child), sib=models.Person(id=mom), relationship_up=1, relationship_down=8))
    if dad:
      objs.append(models.ChildSib(child=models.Person(id=child), sib=models.Person(id=dad), relationship_up=2, relationship_down=8))
    for other in others:
      other_id = other.get('id')
      relationship_id = other.get('relationshipId')
      relationship_down=ROL_CHOICES[str(relationship_id)]

      objs.append(
        models.ChildSib(
          child=models.Person(id=child), 
          sib=models.Person(id=other_id), 
          relationship_up=relationship_id, 
          relationship_down=relationship_down
        )
      )
  
  models.ChildSib.objects.bulk_create(objs, ignore_conflicts=True)
  
  return JsonResponse({'success': True})


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

