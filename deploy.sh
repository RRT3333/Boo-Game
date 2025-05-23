#!/bin/bash
set -euo pipefail

# 배포 스크립트
echo "🚀 Starting Docker deployment..."

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create one based on .env.example"
    exit 1
fi

# 필수 환경 변수 확인
required_vars=(
    "DJANGO_SECRET_KEY"
    "POSTGRES_DB"
    "POSTGRES_USER"
    "POSTGRES_PASSWORD"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var:-}" ]; then
        echo "❌ Required environment variable $var is not set!"
        exit 1
    fi
done

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found! Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found! Please install Docker Compose first."
    exit 1
fi

# 백업 디렉토리 생성
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 데이터베이스 백업 (기존 컨테이너가 실행 중인 경우)
if docker-compose ps | grep -q "boo_game_db"; then
    echo "📂 Creating database backup..."
    docker-compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_DIR/db_backup.sql"
fi

# 현재 설정 백업
cp docker-compose.yml "$BACKUP_DIR/"
cp nginx.conf "$BACKUP_DIR/"
cp -r static "$BACKUP_DIR/" 2>/dev/null || true

# 기존 컨테이너 중지
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# 이미지 빌드 및 컨테이너 시작
echo "🔨 Building and starting containers..."
if ! docker-compose up --build -d; then
    echo "❌ Failed to start containers! Rolling back..."
    docker-compose down
    exit 1
fi

# 마이그레이션 실행
echo "📊 Running database migrations..."
if ! docker-compose exec -T web python manage.py migrate --noinput; then
    echo "❌ Migration failed! Rolling back..."
    if [ -f "$BACKUP_DIR/db_backup.sql" ]; then
        docker-compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB" < "$BACKUP_DIR/db_backup.sql"
    fi
    docker-compose down
    exit 1
fi

# 정적 파일 수집
echo "📦 Collecting static files..."
if ! docker-compose exec -T web python manage.py collectstatic --noinput; then
    echo "❌ Static file collection failed!"
    docker-compose down
    exit 1
fi

# 마크다운 파일 스캔 (있는 경우)
echo "📝 Scanning markdown files..."
docker-compose exec -T web python manage.py scan_markdown_files_new --reset || echo "Markdown scan command not found, skipping..."

# 로그 디렉토리 설정
echo "📝 Setting up log rotation..."
mkdir -p logs
cat > logs/logrotate.conf << EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nginx nginx
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 \`cat /var/run/nginx.pid\`
    endscript
}
EOF

# 컨테이너 상태 확인
echo "📋 Container status:"
docker-compose ps

# 헬스체크
echo "🏥 Running health checks..."
for i in {1..6}; do
    echo "Attempt $i of 6..."
    if curl -f -s http://localhost/ > /dev/null; then
        echo "✅ Deployment successful! App is running at http://localhost/"
        echo "🎉 Deployment completed!"
        exit 0
    fi
    sleep 10
done

echo "❌ Health check failed! Check the logs:"
docker-compose logs

# 헬스체크 실패 시 롤백
echo "🔄 Rolling back due to failed health check..."
docker-compose down
if [ -f "$BACKUP_DIR/db_backup.sql" ]; then
    docker-compose up -d db
    sleep 10
    docker-compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB" < "$BACKUP_DIR/db_backup.sql"
fi

# 이전 설정 복원
cp "$BACKUP_DIR/docker-compose.yml" .
cp "$BACKUP_DIR/nginx.conf" .
cp -r "$BACKUP_DIR/static" . 2>/dev/null || true

echo "❌ Deployment failed and rolled back to previous version."
exit 1 