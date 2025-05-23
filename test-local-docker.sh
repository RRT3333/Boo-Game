#!/bin/bash

echo "🧪 로컬 Docker 환경 테스트 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 함수: 성공 메시지
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 함수: 경고 메시지
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 함수: 오류 메시지
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Docker 설치 확인
if ! command -v docker &> /dev/null; then
    error "Docker가 설치되어 있지 않습니다!"
    echo "Docker를 설치해주세요: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose가 설치되어 있지 않습니다!"
    echo "Docker Compose를 설치해주세요: https://docs.docker.com/compose/install/"
    exit 1
fi

success "Docker 및 Docker Compose 설치 확인됨"

# 기존 컨테이너 정지
echo "🛑 기존 컨테이너 정지 중..."
docker-compose -f docker-compose.local.yml down --remove-orphans 2>/dev/null || true

# 로컬 Docker 이미지 빌드 및 실행
echo "🔨 로컬 Docker 컨테이너 빌드 및 시작 중..."
if docker-compose -f docker-compose.local.yml up --build -d; then
    success "컨테이너 빌드 및 시작 완료"
else
    error "컨테이너 빌드 실패"
    exit 1
fi

# 컨테이너 시작 대기
echo "⏳ 컨테이너 시작 대기 중... (30초)"
sleep 30

# 컨테이너 상태 확인
echo "📋 컨테이너 상태 확인:"
docker-compose -f docker-compose.local.yml ps

# 웹 서비스 헬스체크
echo "🏥 웹 서비스 헬스체크..."
if curl -f -s http://localhost:8000/ > /dev/null 2>&1; then
    success "웹 서비스 (포트 8000) 정상 작동"
else
    warning "웹 서비스 직접 접근 실패, Nginx를 통해 확인 중..."
fi

# Nginx를 통한 접근 확인
echo "🌐 Nginx를 통한 접근 확인..."
if curl -f -s http://localhost/ > /dev/null 2>&1; then
    success "Nginx (포트 80) 정상 작동"
else
    error "Nginx 접근 실패"
    echo "로그를 확인해보세요:"
    docker-compose -f docker-compose.local.yml logs nginx
fi

# 로그 확인
echo ""
echo "📝 최근 로그 (마지막 10줄):"
echo "=== 웹 컨테이너 로그 ==="
docker-compose -f docker-compose.local.yml logs --tail=10 web

echo ""
echo "=== Nginx 컨테이너 로그 ==="
docker-compose -f docker-compose.local.yml logs --tail=10 nginx

# 접속 안내
echo ""
echo "🎉 로컬 테스트 완료!"
echo ""
echo "📱 접속 방법:"
echo "  • Nginx를 통한 접속: http://localhost/"
echo "  • 직접 Django 접속: http://localhost:8000/"
echo ""
echo "🔧 유용한 명령어:"
echo "  • 로그 실시간 보기: docker-compose -f docker-compose.local.yml logs -f"
echo "  • 컨테이너 중지: docker-compose -f docker-compose.local.yml down"
echo "  • 컨테이너 재시작: docker-compose -f docker-compose.local.yml restart"
echo ""
echo "🛠️  디버깅이 필요하다면:"
echo "  • 웹 컨테이너 접속: docker-compose -f docker-compose.local.yml exec web bash"
echo "  • Nginx 컨테이너 접속: docker-compose -f docker-compose.local.yml exec nginx sh" 