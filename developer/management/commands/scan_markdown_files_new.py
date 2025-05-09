import os
import glob
import json
import re
import hashlib
from datetime import datetime
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'context 폴더 내 마크다운 파일을 스캔하고 문서 메타데이터를 생성합니다'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='기존 메타데이터를 초기화하고 새로 생성합니다',
        )
        parser.add_argument(
            '--delete',
            action='store_true',
            help='메타데이터 파일만 삭제하고 종료합니다',
        )
        parser.add_argument(
            '--include-readme',
            action='store_true',
            help='README.md 파일도 포함하여 스캔합니다',
        )

    def handle(self, *args, **options):
        # 기본 디렉토리 설정
        base_dir = settings.BASE_DIR
        metadata_file = os.path.join(base_dir, 'static/markdown_metadata.json')
        
        # --delete 옵션이 있으면 메타데이터 파일만 삭제하고 종료
        if options.get('delete'):
            if os.path.exists(metadata_file):
                os.remove(metadata_file)
                self.stdout.write(self.style.SUCCESS(f'메타데이터 파일이 삭제되었습니다: {metadata_file}'))
            else:
                self.stdout.write(self.style.WARNING(f'메타데이터 파일이 존재하지 않습니다: {metadata_file}'))
            return
        
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
        
        # 기존 메타데이터 로드 (--reset 옵션이 없는 경우에만)
        existing_hashes = set()
        if not options.get('reset') and os.path.exists(metadata_file):
            try:
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    existing_metadata = json.load(f)
                
                # 기존 파일의 콘텐츠 해시 수집
                for category_data in existing_metadata.get('categories', {}).values():
                    for file_data in category_data.get('files', []):
                        if 'content_hash' in file_data:
                            existing_hashes.add(file_data['content_hash'])
                
                self.stdout.write(self.style.SUCCESS(f'기존 메타데이터에서 {len(existing_hashes)}개의 파일 해시를 로드했습니다'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'기존 메타데이터 로드 실패, 새로 시작합니다: {str(e)}'))
                existing_hashes = set()
        
        # 스캔할 파일 목록 생성 
        md_files = []
        
        # 1. context 폴더 내 모든 마크다운 파일 스캔 - 이 폴더만 스캔하도록 수정
        context_dir = os.path.join(base_dir, 'context')
        if os.path.exists(context_dir):
            context_files = glob.glob(os.path.join(context_dir, '**/*.md'), recursive=True)
            md_files.extend(context_files)
            self.stdout.write(self.style.SUCCESS(f'context 폴더에서 {len(context_files)}개의 마크다운 파일을 찾았습니다'))
        else:
            self.stdout.write(self.style.WARNING(f'context 폴더가 존재하지 않습니다: {context_dir}'))
        
        # 2. README.md 파일 추가 (옵션으로 전환)
        include_readme = options.get('include_readme', False)
        readme_path = os.path.join(base_dir, 'README.md')
        if include_readme and os.path.exists(readme_path):
            md_files.append(readme_path)
            self.stdout.write(self.style.SUCCESS('README.md 파일이 스캔 목록에 추가되었습니다'))
        
        # 중복 파일 감지를 위한 해시 집합
        file_hashes = existing_hashes.copy() if not options.get('reset') else set()
        
        # 카테고리별 키워드
        category_keywords = {
            'project': ['project', 'plan', 'summary', 'readme', '프로젝트', '계획', '개요'],
            'guide': ['guide', 'tutorial', 'manual', '가이드', '튜토리얼', '매뉴얼', 'deploy', '배포'],
            'tech': ['tech', 'architecture', 'erd', 'api', '기술', '아키텍처', '구조'],
            'report': ['report', 'doc', 'documentation', '보고서', '문서', '기록']
        }
        
        # 파일 분류
        for file_path in md_files:
            # context 폴더 외부의 파일은 건너뛰기 (README.md 예외)
            if not file_path.startswith(context_dir) and file_path != readme_path:
                self.stdout.write(self.style.WARNING(f'context 폴더 외부 파일 건너뛰기: {file_path}'))
                continue
                
            # 파일 내용에 기반한 해시 생성
            try:
                with open(file_path, 'rb') as f:
                    file_content = f.read()
                    content_hash = hashlib.md5(file_content).hexdigest()
                    
                    # 이미 처리한 파일과 동일한 내용이면 건너뛰기
                    if content_hash in file_hashes:
                        self.stdout.write(self.style.WARNING(f'중복 파일 건너뛰기: {file_path}'))
                        continue
                    
                    # 해시 저장
                    file_hashes.add(content_hash)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'파일 해시 생성 오류: {file_path} - {str(e)}'))
                continue
            
            rel_path = os.path.relpath(file_path, base_dir)
            # Windows 경로를 URL 경로로 변환 (백슬래시를 슬래시로)
            rel_path = rel_path.replace('\\', '/')
            
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
                'size': size_display,
                'content_hash': content_hash  # 추가: 콘텐츠 해시 저장
            }
            
            # 카테고리에 추가
            categories[category]['files'].append(doc_info)
        
        # 각 카테고리 내 파일들을 제목 기준으로 정렬
        for category in categories.values():
            category['files'] = sorted(category['files'], key=lambda x: x['title'].lower())
        
        # 메타데이터 저장
        metadata = {
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'total_files': len(file_hashes),  # 중복 제외한 파일 수
            'categories': categories
        }
        
        # JSON 파일로 저장
        os.makedirs(os.path.dirname(metadata_file), exist_ok=True)
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        # 실행 결과 메시지 생성
        mode = "초기화" if options.get('reset') else "업데이트"
        total_existing = len(existing_hashes) if not options.get('reset') else 0
        total_new = len(file_hashes) - total_existing
        
        self.stdout.write(
            self.style.SUCCESS(
                f'마크다운 파일 메타데이터 {mode} 완료:\n'
                f'- 총 파일 수: {len(file_hashes)}개\n'
                f'- 새로 추가된 파일: {total_new}개\n'
                f'- context 폴더 파일: {len([f for f in md_files if f.startswith(context_dir)])}개\n'
                f'- README 포함: {"예" if include_readme and os.path.exists(readme_path) else "아니오"}\n'
                f'- 메타데이터 파일: {metadata_file}'
            )
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
        if '.github' in lower_path:
            return 'tech'
            
        # 파일 이름이 README.md이면 project로 분류
        if lower_path.endswith('readme.md'):
            return 'project'
        
        # 경로나 제목에 카테고리 키워드가 포함되어 있는지 확인
        for category, keywords in category_keywords.items():
            for keyword in keywords:
                if keyword in lower_path or keyword in lower_title:
                    return category
        
        # 기본적으로는 other 카테고리로 분류
        return 'other' 