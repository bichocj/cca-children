# Generated by Django 3.2.7 on 2022-07-20 22:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0007_attendancedetail_received'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='attendance',
            options={'permissions': (('can_see_attendances', 'Can see attendances'), ('can_leave_children', 'Can leave children'), ('can_pick_up_children', 'Can pick up children')), 'verbose_name': 'asistencia', 'verbose_name_plural': 'asistencias'},
        ),
        migrations.AlterModelOptions(
            name='childsib',
            options={'permissions': (('can_see_families', 'Can see families'),), 'verbose_name': 'pariente', 'verbose_name_plural': 'parientes'},
        ),
        migrations.AlterModelOptions(
            name='person',
            options={'permissions': (('can_see_people', 'Can see people'),), 'verbose_name': 'persona', 'verbose_name_plural': 'personas'},
        ),
    ]
