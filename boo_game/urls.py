"""
URL configuration for boo_game project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.shortcuts import redirect
from django.contrib.sitemaps.views import sitemap
from game.sitemaps import StaticViewSitemap
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.views.generic import TemplateView, RedirectView
from django.conf import settings
import re

sitemaps = {
    'static': StaticViewSitemap,
}

# Swagger 설정
schema_view = get_schema_view(
    openapi.Info(
        title="Boo Game API",
        default_version='v1',
        description="Boo의 졸업 대모험 API 문서",
        terms_of_service="https://boogame.kr/terms/",
        contact=openapi.Contact(email="admin@boogame.kr"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# 마크다운 파일을 렌더링 뷰로 리디렉션하는 함수
def markdown_redirect(request, path):
    # 특정 문서는 HTML 페이지로 리디렉션
    if path == 'frontend-guide.md':
        return redirect('developer:frontend-guide')
    elif path == 'erd.md':
        return redirect('developer:erd')
    else:
        return redirect('developer:render_static_markdown', path=path)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('game/', include('game.urls')),
    path('', lambda request: redirect('game:index')),  # Redirect root URL to game index page
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),
    
    # 개발자 도구 URL 패턴
    path('developer/', include('developer.urls')),
    
    # static 마크다운 파일 리디렉션
    re_path(r'^static/(?P<path>.+\.md)$', markdown_redirect),
    
    # Swagger UI 경로
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # 프론트엔드 개발자용 API 테스트 도구
    path('api-test/', RedirectView.as_view(url='/static/api-test.html'), name='api-test'),
]
