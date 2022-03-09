import json
import requests
from django.shortcuts import redirect, render
from django.forms.models import model_to_dict
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseBadRequest
from django.urls import reverse
from django.conf import settings
from . import forms, models

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
    return render(request, 'dashboard/people/show_details.html', locals())
  except models.Person.DoesNotExist:
    return redirect(reverse('dashboard:people_show_all'))

def family_create(request):
  body = json.loads(request.body)
  children = body['children'];
  others = body['others'];
  mom = body['mom'];
  dad = body['dad'];

  objs = []

  for child in children:
    if mom:
      objs.append(models.ChildSib(child=models.Person(id=child), sib=models.Person(id=mom), relation=1))
    if dad:
      objs.append(models.ChildSib(child=models.Person(id=child), sib=models.Person(id=dad), relation=2))      
    for other in others:
      objs.append(models.ChildSib(child=models.Person(id=child), sib=models.Person(id=other), relation=5))      
  
  models.ChildSib.objects.bulk_create(objs, ignore_conflicts=True)
  
  return JsonResponse({'success': True})

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
  serialized = json.dumps(dict_obj)

  return HttpResponse(serialized, content_type='application/json')