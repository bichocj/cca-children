# Generated by Django 3.2.7 on 2022-06-19 06:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0003_auto_20220619_0001'),
    ]

    operations = [
        migrations.RenameField(
            model_name='attendance',
            old_name='created_at',
            new_name='start_at',
        ),
        migrations.AddField(
            model_name='attendance',
            name='end_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]