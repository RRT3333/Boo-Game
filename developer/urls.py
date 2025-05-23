from django.urls import path
from . import views

app_name = 'developer'

urlpatterns = [
    path('', views.dashboard, name='index'),
    path('docs-hub/', views.docs_hub, name='docs-hub'),
    path('api-client-docs/', views.api_client_docs, name='api-client-docs'),
    path('api-client-test/', views.api_client_test, name='api-client-test'),
    path('frontend-guide/', views.frontend_guide, name='frontend-guide'),
    path('erd/', views.erd, name='erd'),
    path('docs/<path:path>', views.render_markdown, name='render_markdown'),
] 