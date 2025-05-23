#!/bin/bash
set -e

echo "🚀 Starting Django application (LOCAL MODE)..."

# 환경 변수 확인 (로컬에서는 기본값 사용)
if [ -z "$DJANGO_SECRET_KEY" ]; then
    echo "⚠️  Using default secret key for local development"
    export DJANGO_SECRET_KEY="local-development-secret-key-12345"
fi

# 데이터베이스 마이그레이션 실행
echo "📊 Running database migrations..."
python manage.py migrate --noinput

# 정적 파일 수집
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

# 마크다운 파일 스캔 (있는 경우)
echo "📝 Scanning markdown files..."
python manage.py scan_markdown_files_new --reset || echo "Markdown scan command not found, skipping..."

# 로컬 개발을 위한 Gunicorn 설정 (더 간단한 설정)
echo "🦄 Starting Gunicorn (Local Development Mode)..."
exec gunicorn \
    --bind unix:/tmp/gunicorn.sock \
    --workers 3 \
    --worker-class sync \
    --timeout 60 \
    --access-logfile - \
    --error-logfile - \
    --log-level debug \
    boo_game.wsgi:application
