# Generated by Django 5.1.5 on 2025-04-04 05:34

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Score',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('player_ip', models.GenericIPAddressField()),
                ('score', models.IntegerField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-score'],
            },
        ),
    ]
