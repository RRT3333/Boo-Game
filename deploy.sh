#!/bin/bash

# 배포 스크립트
echo "🚀 Starting Docker deployment..."

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create one based on .env.example"
    exit 1
fi

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found! Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found! Please install Docker Compose first."
    exit 1
fi

# 기존 컨테이너 중지
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# 이미지 빌드 및 컨테이너 시작
echo "🔨 Building and starting containers..."
docker-compose up --build -d

# 마이그레이션 실행
echo "📊 Running database migrations..."
docker-compose exec web python manage.py migrate

# 마크다운 파일 스캔 (있는 경우)
echo "📝 Scanning markdown files..."
docker-compose exec web python manage.py scan_markdown_files_new --reset || echo "Markdown scan command not found, skipping..."

# 컨테이너 상태 확인
echo "📋 Container status:"
docker-compose ps

# 헬스체크
echo "🏥 Health check..."
sleep 10
if curl -f -s http://localhost/ > /dev/null; then
    echo "✅ Deployment successful! App is running at http://localhost/"
else
    echo "❌ Health check failed! Check the logs:"
    docker-compose logs web
fi

echo "🎉 Deployment completed!" 