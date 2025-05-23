#!/bin/bash
set -euo pipefail

echo "🚀 Starting Django application..."

# 환경 변수 확인
if [ -z "${DJANGO_SECRET_KEY:-}" ]; then
    echo "❌ DJANGO_SECRET_KEY environment variable is required!"
    exit 1
fi

# 중요 파일 권한 설정
chmod 600 .env 2>/dev/null || true

# 데이터베이스 마이그레이션 실행
echo "📊 Running database migrations..."
python manage.py migrate --noinput

# 정적 파일 수집
echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

# 마크다운 파일 스캔 (있는 경우)
echo "📝 Scanning markdown files..."
python manage.py scan_markdown_files_new --reset || echo "Markdown scan command not found, skipping..."

# Gunicorn으로 애플리케이션 시작
echo "🦄 Starting Gunicorn..."
exec gunicorn \
    --bind unix:/tmp/gunicorn.sock \
    --workers 3 \
    --worker-class gevent \
    --worker-connections 1000 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload \
    --timeout 60 \
    --keepalive 5 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --capture-output \
    --enable-stdio-inheritance \
    boo_game.wsgi:application 