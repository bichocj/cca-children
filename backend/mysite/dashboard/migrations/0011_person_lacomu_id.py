# Generated by Django 3.2.7 on 2022-10-19 08:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0010_attendancedetail_nro'),
    ]

    operations = [
        migrations.AddField(
            model_name='person',
            name='lacomu_id',
            field=models.IntegerField(default=0),
        ),
    ]
