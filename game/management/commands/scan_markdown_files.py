import os
import glob
import json
import re
from datetime import datetime
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = '프로젝트 내 마크다운 파일을 스캔하고 문서 메타데이터를 생성합니다'

    def handle(self, *args, **options):
        # 기본 디렉토리 설정
        base_dir = settings.BASE_DIR
        metadata_file = os.path.join(base_dir, 'static/markdown_metadata.json')
        
        # 카테고리 정의
        categories = {
            'project': {
                'title': '프로젝트 문서',
                'icon': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
                'files': []
            },
            'guide': {
                'title': '가이드 문서',
                'icon': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>',
                'files': []
            },
            'tech': {
                'title': '기술 문서',
                'icon': '<path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle>',
                'files': []
            },
            'report': {
                'title': '보고서',
                'icon': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>',
                'files': []
            },
            'other': {
                'title': '기타 문서',
                'icon': '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>',
                'files': []
            }
        }
        
        # 모든 마크다운 파일 찾기
        md_files = glob.glob(os.path.join(base_dir, '**/*.md'), recursive=True)
        
        # 카테고리별 키워드
        category_keywords = {
            'project': ['project', 'plan', 'summary', 'readme', '프로젝트', '계획', '개요'],
            'guide': ['guide', 'tutorial', 'manual', '가이드', '튜토리얼', '매뉴얼', 'deploy', '배포'],
            'tech': ['tech', 'architecture', 'erd', 'api', '기술', '아키텍처', '구조'],
            'report': ['report', 'doc', 'documentation', '보고서', '문서', '기록']
        }
        
        # 파일 분류
        for file_path in md_files:
            rel_path = os.path.relpath(file_path, base_dir)
            filename = os.path.basename(file_path)
            
            # 파일 제목 및 설명 추출
            title = self.get_markdown_title(file_path) or os.path.splitext(filename)[0]
            description = self.get_markdown_description(file_path) or f"{title} 문서"
            
            # 최종 수정 시간
            modified_time = datetime.fromtimestamp(os.path.getmtime(file_path)).strftime('%Y-%m-%d')
            
            # 파일 크기
            size_kb = os.path.getsize(file_path) / 1024
            size_display = f"{size_kb:.1f} KB"
            
            # 카테고리 결정
            category = self.determine_category(file_path, rel_path, title, category_keywords)
            
            # 문서 정보 생성
            doc_info = {
                'path': rel_path,
                'title': title,
                'description': description,
                'modified': modified_time,
                'size': size_display
            }
            
            # 카테고리에 추가
            categories[category]['files'].append(doc_info)
        
        # 각 카테고리 내 파일들을 제목 기준으로 정렬
        for category in categories.values():
            category['files'] = sorted(category['files'], key=lambda x: x['title'].lower())
        
        # 메타데이터 저장
        metadata = {
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_files': len(md_files),
            'categories': categories
        }
        
        # JSON 파일로 저장
        os.makedirs(os.path.dirname(metadata_file), exist_ok=True)
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        self.stdout.write(
            self.style.SUCCESS(f'총 {len(md_files)}개의 마크다운 파일이 스캔되어 {metadata_file}에 저장되었습니다')
        )
    
    def get_markdown_title(self, file_path):
        """마크다운 파일에서 첫 번째 제목(#으로 시작하는 줄)을 추출합니다."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
                if title_match:
                    return title_match.group(1).strip()
        except Exception:
            pass
        return None
    
    def get_markdown_description(self, file_path):
        """마크다운 파일에서 첫 번째 제목 이후의 첫 단락을 추출합니다."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # 첫 번째 제목(#) 이후의 첫 단락 추출
                desc_match = re.search(r'^#.*?\n+(.+?)(?:\n\n|$)', content, re.DOTALL | re.MULTILINE)
                if desc_match:
                    description = desc_match.group(1).strip()
                    # 너무 긴 설명은 요약
                    if len(description) > 150:
                        return description[:147] + "..."
                    return description
        except Exception:
            pass
        return None
    
    def determine_category(self, file_path, rel_path, title, category_keywords):
        """파일 경로, 제목 등을 기반으로 가장 적합한 카테고리를 결정합니다."""
        lower_path = rel_path.lower()
        lower_title = title.lower() if title else ""
        
        # 경로에 GitHub 관련 디렉토리가 있으면 technical
        if '.github/' in lower_path:
            return 'tech'
        
        # 경로나 제목에 "보고서" 또는 "report"가 있으면 report
        if '보고서' in lower_path or 'report' in lower_path:
            return 'report'
        
        # 키워드 기반 카테고리 매칭
        for category, keywords in category_keywords.items():
            for keyword in keywords:
                if keyword in lower_path or keyword in lower_title:
                    return category
        
        # 파일명 패턴 기반 매칭
        filename = os.path.basename(lower_path)
        
        if 'readme' in filename:
            return 'project'
        
        if 'guide' in filename or 'manual' in filename or 'tutorial' in filename:
            return 'guide'
        
        if 'erd' in filename or 'api' in filename or 'arch' in filename:
            return 'tech'
        
        # 기본 카테고리
        return 'other' 