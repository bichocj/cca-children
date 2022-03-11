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


class Person(models.Model):
  dni = models.CharField(('DNI'), max_length=8, blank=False, null=False)
  name = models.CharField(('Nombre'), max_length=255, blank=False, null=False)
  email = models.EmailField(('Correo Electronico'), max_length=255, blank=True, null=True)
  cellphone = models.CharField(('Celular'), max_length=12, blank=True, null=True)
  date_of_birth = models.DateField(('Fecha de Nacimiento'), blank=True, null=True)

  def __str__(self):
    return self.dni

  class Meta:
    verbose_name = "persona"
    verbose_name_plural = "personas"

class ChildSib(models.Model):
  child = models.ForeignKey(Person, verbose_name='niño/a', on_delete=models.CASCADE, related_name='child')
  sib = models.ForeignKey(Person, verbose_name='pariente', on_delete=models.CASCADE, related_name='sib')
  relationship_up = models.IntegerField('relacion arriba', choices=ROL_CHOICES, blank=True, null=True)
  relationship_down = models.IntegerField('relacion abajo', choices=ROL_CHOICES, blank=True, null=True)

  class Meta:
    verbose_name = "pariente"
    verbose_name_plural = "parientes"
    unique_together = ['child', 'sib']


class Attendance(models.Model):
  code = models.CharField('codigo', max_length=10, blank=False, null=False)
  sib = models.ForeignKey(Person, verbose_name='pariente', on_delete=models.CASCADE)
  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    verbose_name = "asistencia"
    verbose_name_plural = "asistencias"


class AttendanceDetail(models.Model):
  child = models.ForeignKey(Person, verbose_name='niño/a', on_delete=models.CASCADE)

  class Meta:
    verbose_name = "asistencia detalle"
    verbose_name_plural = "asistencias detalles"
