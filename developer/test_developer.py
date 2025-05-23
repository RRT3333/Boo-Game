from django.test import TestCase, Client
from django.urls import reverse
from django.conf import settings
import os
import json
import tempfile
from unittest.mock import patch, MagicMock, mock_open
import markdown
from datetime import datetime
from django.core.management import call_command
import importlib

from developer.views import get_markdown_metadata

class DeveloperViewsTestCase(TestCase):
    """개발자 앱의 뷰 테스트"""
    
    def setUp(self):
        """테스트 설정"""
        self.client = Client()
        
    def test_dashboard_view(self):
        """대시보드 뷰 테스트"""
        url = reverse('developer:index')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'developer/dashboard.html')
        self.assertContains(response, '개발자 대시보드')
        
    def test_docs_hub_view(self):
        """문서 허브 뷰 테스트"""
        # 메타데이터 가져오기 메서드를 모의 객체로 대체
        mock_metadata = {
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_files': 5,
            'categories': {
                'project': {
                    'title': '프로젝트 문서',
                    'icon': '<path></path>',
                    'files': [{'title': 'README', 'path': 'README.md'}]
                }
            }
        }
        
        with patch('developer.views.get_markdown_metadata', return_value=mock_metadata):
            url = reverse('developer:docs-hub')
            response = self.client.get(url)
            
            self.assertEqual(response.status_code, 200)
            self.assertTemplateUsed(response, 'developer/docs-hub.html')
            self.assertContains(response, '문서 허브')
            self.assertContains(response, '프로젝트 문서')
            self.assertContains(response, 'Developer 앱 가이드')
            self.assertContains(response, '마크다운 파일 관리')
    
    def test_api_client_docs_view(self):
        """API 클라이언트 문서 뷰 테스트"""
        url = reverse('developer:api-client-docs')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'developer/api-client-docs.html')
        self.assertContains(response, 'API 클라이언트')
        self.assertContains(response, 'API 클라이언트 소스코드 가져오기')
        self.assertContains(response, '스크립트 경로 복사')
        self.assertContains(response, 'HTML에서 사용:')
    
    @patch('developer.views.os.path.exists')
    @patch('developer.views.os.path.isfile')
    @patch('developer.views.open')
    @patch('developer.views.markdown.markdown')
    def test_render_markdown_view(self, mock_markdown, mock_open, mock_isfile, mock_exists):
        """마크다운 렌더링 뷰 테스트"""
        # 모의 객체 설정
        mock_exists.return_value = True
        mock_isfile.return_value = True
        mock_file = MagicMock()
        mock_file.__enter__.return_value.read.return_value = "# 테스트 마크다운"
        mock_open.return_value = mock_file
        mock_markdown.return_value = "<h1>테스트 마크다운</h1>"
        
        # 뷰 호출
        url = reverse('developer:render_markdown', kwargs={'path': 'test.md'})
        response = self.client.get(url)
        
        # 검증
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'developer/markdown-viewer.html')
        self.assertContains(response, '<h1>테스트 마크다운</h1>')
    
    def test_nonexistent_markdown_file(self):
        """존재하지 않는 마크다운 파일 요청 테스트"""
        nonexistent_path = 'this/file/does/not/exist.md'
        
        # 파일이 존재하지 않는 것처럼 패치
        with patch('os.path.exists', return_value=False):
            url = reverse('developer:render_markdown', kwargs={'path': nonexistent_path})
            response = self.client.get(url)
            
            self.assertEqual(response.status_code, 404)

class MarkdownMetadataTestCase(TestCase):
    """마크다운 메타데이터 관련 테스트"""
    
    def test_get_markdown_metadata_no_file(self):
        """메타데이터 파일이 없을 때의 동작 테스트"""
        # 파일이 존재하지 않는 것처럼 패치
        with patch('os.path.exists', return_value=False):
            metadata = get_markdown_metadata()
            
            self.assertIn('last_updated', metadata)
            self.assertEqual(metadata['total_files'], 0)
            self.assertEqual(metadata['categories'], {})
    
    def test_get_markdown_metadata_with_file(self):
        """메타데이터 파일이 있을 때의 동작 테스트"""
        # 메타데이터 파일 모의 데이터
        mock_data = {
            'last_updated': '2025-05-09 12:00:00',
            'total_files': 10,
            'categories': {
                'project': {'files': []},
                'guide': {'files': []}
            }
        }
        
        # 파일 존재 및 읽기 작업을 패치
        with patch('os.path.exists', return_value=True):
            with patch('builtins.open', mock_open()):
                with patch('json.load', return_value=mock_data):
                    metadata = get_markdown_metadata()
                    
                    self.assertEqual(metadata['last_updated'], '2025-05-09 12:00:00')
                    self.assertEqual(metadata['total_files'], 10)
                    self.assertEqual(len(metadata['categories']), 2)
                    self.assertIn('project', metadata['categories'])
                    self.assertIn('guide', metadata['categories'])

class ManagementCommandsTestCase(TestCase):
    """관리 명령어 테스트"""
    
    def test_scan_markdown_files_command_exists(self):
        """scan_markdown_files 명령어가 존재하는지 테스트"""
        from django.core.management import get_commands
        commands = get_commands()
        self.assertIn('scan_markdown_files', commands)
        
    def test_create_md_symlinks_command_exists(self):
        """create_md_symlinks 명령어가 존재하는지 테스트"""
        from django.core.management import get_commands
        commands = get_commands()
        self.assertIn('create_md_symlinks', commands)
