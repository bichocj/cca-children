from statistics import mode
from django.db import models


ROL_CHOICES = (
  (1, 'madre'),
  (2, 'padre'),
  (3, 'hermano/a'),
  (4, 'tio/a'),
  (5, 'abuelo/a'),
  (6, 'primo/a'),

  (7, 'sobrino/a'),
  (8, 'hijo/a'),
  (9, 'sobrino/a'),
  (10, 'nieto/a'),
)

class PersonApp(models.Model):
  dni = models.CharField(('DNI/Carnet Extranjeria'), max_length=20, blank=True, null=True)
  lacomu_id = models.IntegerField(default=0) #swith to unique=True

  name = models.CharField(('Nombre'), max_length=255, blank=False, null=False)
  email = models.EmailField(('Correo Electronico'), max_length=255, blank=True, null=True)
  cellphone = models.CharField(('Celular'), max_length=12, blank=True, null=True)
  date_of_birth = models.DateField(('Fecha de Nacimiento'), blank=True, null=True)

  def __str__(self):
    return self.name

  class Meta:
    verbose_name = "persona"
    verbose_name_plural = "personas"
    permissions = (("can_see_people", "Can see people"),)

class Attendance(models.Model):
  parent_a = models.ForeignKey(PersonApp, verbose_name='deja', on_delete=models.CASCADE, related_name='parent_a')
  parent_b = models.ForeignKey(PersonApp, verbose_name='recoje', on_delete=models.CASCADE, related_name='parent_b')
  start_at = models.DateTimeField(auto_now_add=True)
  end_at = models.DateTimeField(blank=True, null=True)

  class Meta:
    verbose_name = "asistencia"
    verbose_name_plural = "asistencias"
    permissions = (("can_see_attendances", "Can see attendances"),("can_leave_children", "Can leave children"),("can_pick_up_children", "Can pick up children"),)

  def __str__(self):
    return self.parent_a.name

class Space(models.Model):
  name = models.CharField('nombre', max_length=50, blank=False, null=False)
  capacity = models.IntegerField('capacidad')
  min_age = models.IntegerField('edad minima')
  max_age = models.IntegerField('edad maxima')

  def __str__(self):
    return self.name

  class Meta:
    verbose_name = "clase"
    verbose_name_plural = "clases"

  
class AttendanceDetail(models.Model):
  attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE, related_name='attendance')
  child = models.ForeignKey(PersonApp, verbose_name='niño/a', on_delete=models.CASCADE)
  space = models.ForeignKey(Space, verbose_name='clase', on_delete=models.CASCADE)
  nro = models.CharField('nro', max_length=10, blank=True, null=True)
  received = models.BooleanField(default=False)
  released = models.BooleanField(default=False)
  start_at = models.DateTimeField(auto_now_add=True)
  end_at = models.DateTimeField(blank=True, null=True)
  
  def __str__(self):
    return self.child.name

  class Meta:
    verbose_name = "asistencia detalle"
    verbose_name_plural = "asistencias detalles"


class ChildSib(models.Model):
  child = models.ForeignKey(PersonApp, verbose_name='niño/a', on_delete=models.CASCADE, related_name='child')
  sib = models.ForeignKey(PersonApp, verbose_name='pariente', on_delete=models.CASCADE, related_name='sib')
  relationship_up = models.IntegerField('relacion arriba', choices=ROL_CHOICES, blank=True, null=True)
  relationship_down = models.IntegerField('relacion abajo', choices=ROL_CHOICES, blank=True, null=True)

  class Meta:
    verbose_name = "pariente"
    verbose_name_plural = "parientes"
    unique_together = ['child', 'sib']
    permissions = (("can_see_families", "Can see families"),)