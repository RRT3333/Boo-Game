from django.apps import AppConfig


class DeveloperConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'developer'
    verbose_name = '개발자 도구'
