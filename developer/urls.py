from django.urls import path
from . import views

app_name = 'developer'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('docs-hub/', views.docs_hub, name='docs-hub'),
    path('api-client-docs/', views.api_client_docs, name='api-client-docs'),
    path('docs/<path:path>', views.render_markdown, name='render_markdown'),
] 