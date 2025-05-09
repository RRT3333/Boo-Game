from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse, Http404
from django.conf import settings
import os
import glob
import json
import re
import markdown
from datetime import datetime
from django.urls import reverse

def dashboard(request):
    """개발자 대시보드 뷰"""
    return render(request, 'developer/dashboard.html', {
        'django_version': '5.2',
        'python_version': '3.11',
        'debug': settings.DEBUG
    })

def docs_hub(request):
    """자동으로 감지된 마크다운 파일을 표시하는 문서 허브 뷰"""
    # 마크다운 메타데이터 가져오기
    metadata = get_markdown_metadata()
    
    # 메타데이터에서 필요한 정보 추출
    last_updated = metadata.get('last_updated', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    total_files = metadata.get('total_files', 0)
    categories = metadata.get('categories', {})
    
    # 템플릿 렌더링
    return render(request, 'developer/docs-hub.html', {
        'last_updated': last_updated,
        'total_files': total_files,
        'categories': categories
    })

def api_client_docs(request):
    """API 클라이언트 문서 뷰"""
    return render(request, 'developer/api-client-docs.html')

def frontend_guide(request):
    """프론트엔드 개발 가이드 뷰"""
    return render(request, 'developer/frontend-guide.html')

def erd(request):
    """ERD(Entity Relationship Diagram) 뷰"""
    return render(request, 'developer/erd.html')

def render_markdown(request, path):
    """마크다운 파일을 HTML로 렌더링합니다."""
    # 상대 경로 구성
    file_path = os.path.join(settings.BASE_DIR, path)
    
    # 파일이 존재하는지 확인
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        raise Http404(f"'{path}' 파일을 찾을 수 없습니다.")
    
    # 파일 확장자 확인
    if not file_path.endswith('.md'):
        raise Http404("마크다운 파일만 렌더링할 수 있습니다.")
    
    # 파일 읽기
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
    except Exception as e:
        return HttpResponse(f"파일을 읽는 중 오류가 발생했습니다: {str(e)}", status=500)
    
    # 마크다운을 HTML로 변환
    html_content = markdown.markdown(
        md_content,
        extensions=['extra', 'codehilite', 'toc', 'tables', 'fenced_code']
    )
    
    # 문서 허브 URL 생성
    docs_hub_url = reverse('developer:docs-hub')
    
    # 스타일이 적용된 HTML 응답 생성
    return render(request, 'developer/markdown-viewer.html', {
        'html_content': html_content,
        'file_path': path,
        'file_name': os.path.basename(file_path),
        'docs_hub_url': docs_hub_url
    })

def render_static_markdown(request, path):
    """staticfiles 디렉터리의 마크다운 파일을 HTML로 렌더링합니다."""
    # 상대 경로 구성 (staticfiles 경로 사용)
    file_path = os.path.join(settings.STATIC_ROOT, path)
    
    # 파일이 존재하는지 확인
    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        # STATIC_ROOT에 없으면 STATICFILES_DIRS에서 찾기
        for static_dir in settings.STATICFILES_DIRS:
            alt_file_path = os.path.join(static_dir, path)
            if os.path.exists(alt_file_path) and os.path.isfile(alt_file_path):
                file_path = alt_file_path
                break
        else:
            raise Http404(f"'{path}' 파일을 찾을 수 없습니다.")
    
    # 파일 확장자 확인
    if not file_path.endswith('.md'):
        raise Http404("마크다운 파일만 렌더링할 수 있습니다.")
    
    # 파일 읽기
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            md_content = f.read()
    except Exception as e:
        return HttpResponse(f"파일을 읽는 중 오류가 발생했습니다: {str(e)}", status=500)
    
    # 마크다운을 HTML로 변환
    html_content = markdown.markdown(
        md_content,
        extensions=['extra', 'codehilite', 'toc', 'tables', 'fenced_code']
    )
    
    # 문서 허브 URL 생성
    docs_hub_url = reverse('developer:docs-hub')
    
    # 스타일이 적용된 HTML 응답 생성
    return render(request, 'developer/markdown-viewer.html', {
        'html_content': html_content,
        'file_path': path,
        'file_name': os.path.basename(file_path),
        'docs_hub_url': docs_hub_url
    })

def get_markdown_metadata():
    """마크다운 메타데이터 파일을 읽어 반환합니다."""
    metadata_file = os.path.join(settings.BASE_DIR, 'static/markdown_metadata.json')
    
    # 메타데이터 파일이 없으면 빈 데이터 반환
    if not os.path.exists(metadata_file):
        return {
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_files': 0,
            'categories': {}
        }
    
    try:
        with open(metadata_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"메타데이터 파일 읽기 오류: {str(e)}")
        return {
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_files': 0,
            'categories': {}
        } 