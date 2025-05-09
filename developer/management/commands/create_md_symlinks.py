import os
import glob
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = '마크다운 파일을 static 디렉토리에 심볼릭 링크로 생성합니다'

    def handle(self, *args, **options):
        # 기본 디렉토리 설정
        base_dir = settings.BASE_DIR
        static_dir = os.path.join(base_dir, 'static')
        
        # static 디렉토리가 없으면 생성
        if not os.path.exists(static_dir):
            os.makedirs(static_dir)
            self.stdout.write(self.style.SUCCESS(f'"{static_dir}" 디렉토리 생성됨'))
        
        # 모든 .md 파일 찾기
        md_files = glob.glob(os.path.join(base_dir, '**/*.md'), recursive=True)
        
        # 심볼릭 링크 생성을 위한 경로 매핑
        link_created_count = 0
        
        for md_file in md_files:
            # 상대 경로 계산
            rel_path = os.path.relpath(md_file, base_dir)
            
            # static 디렉토리 내의 대상 경로
            target_path = os.path.join(static_dir, rel_path)
            target_dir = os.path.dirname(target_path)
            
            # 대상 디렉토리가 없으면 생성
            if not os.path.exists(target_dir):
                os.makedirs(target_dir, exist_ok=True)
            
            # 기존 링크가 있으면 삭제
            if os.path.exists(target_path):
                if os.path.islink(target_path):
                    os.unlink(target_path)
                else:
                    self.stdout.write(self.style.WARNING(f'"{target_path}"는 파일이 이미 존재하여 건너뜁니다'))
                    continue
            
            # 심볼릭 링크 생성 (Windows에서는 관리자 권한 필요할 수 있음)
            try:
                # 타겟 경로를 위한 상대 경로 계산
                rel_source_path = os.path.relpath(md_file, target_dir)
                os.symlink(rel_source_path, target_path)
                link_created_count += 1
                self.stdout.write(f'"{rel_path}" -> "{target_path}" 링크 생성됨')
            except OSError as e:
                self.stdout.write(self.style.ERROR(f'"{target_path}" 링크 생성 실패: {e}'))
                
                # 링크 생성이 실패하면 파일 복사 시도 (Windows 제한 우회)
                try:
                    import shutil
                    shutil.copy2(md_file, target_path)
                    link_created_count += 1
                    self.stdout.write(f'"{rel_path}" -> "{target_path}" 파일 복사됨 (심볼릭 링크 대신)')
                except Exception as e2:
                    self.stdout.write(self.style.ERROR(f'"{target_path}" 파일 복사 실패: {e2}'))
        
        self.stdout.write(self.style.SUCCESS(f'총 {link_created_count}개의 마크다운 파일 링크가 생성되었습니다')) 