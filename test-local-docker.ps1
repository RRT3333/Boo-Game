#!/usr/bin/env pwsh

Write-Host "🧪 로컬 Docker 환경 테스트 시작..." -ForegroundColor Cyan

# 함수 정의
function Write-Success {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Docker 설치 확인
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker가 설치되어 있지 않습니다!"
    Write-Host "Docker Desktop을 설치해주세요: https://docs.docker.com/desktop/windows/"
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Error "Docker Compose가 설치되어 있지 않습니다!"
    Write-Host "Docker Desktop에 포함되어 있습니다. Docker Desktop을 최신 버전으로 업데이트하세요."
    exit 1
}

Write-Success "Docker 및 Docker Compose 설치 확인됨"

# 기존 컨테이너 정지
Write-Host "🛑 기존 컨테이너 정지 중..." -ForegroundColor Yellow
docker-compose -f docker-compose.local.yml down --remove-orphans 2>$null

# 로컬 Docker 이미지 빌드 및 실행
Write-Host "🔨 로컬 Docker 컨테이너 빌드 및 시작 중..." -ForegroundColor Cyan
try {
    docker-compose -f docker-compose.local.yml up --build -d
    Write-Success "컨테이너 빌드 및 시작 완료"
}
catch {
    Write-Error "컨테이너 빌드 실패"
    exit 1
}

# 컨테이너 시작 대기
Write-Host "⏳ 컨테이너 시작 대기 중... (30초)" -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 컨테이너 상태 확인
Write-Host "📋 컨테이너 상태 확인:" -ForegroundColor Cyan
docker-compose -f docker-compose.local.yml ps

# 웹 서비스 헬스체크
Write-Host "🏥 웹 서비스 헬스체크..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/" -TimeoutSec 10 -ErrorAction Stop
    Write-Success "웹 서비스 (포트 8000) 정상 작동"
}
catch {
    Write-Warning "웹 서비스 직접 접근 실패, Nginx를 통해 확인 중..."
}

# Nginx를 통한 접근 확인
Write-Host "🌐 Nginx를 통한 접근 확인..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost/" -TimeoutSec 10 -ErrorAction Stop
    Write-Success "Nginx (포트 80) 정상 작동"
}
catch {
    Write-Error "Nginx 접근 실패"
    Write-Host "로그를 확인해보세요:" -ForegroundColor Yellow
    docker-compose -f docker-compose.local.yml logs nginx
}

# 로그 확인
Write-Host ""
Write-Host "📝 최근 로그 (마지막 10줄):" -ForegroundColor Cyan
Write-Host "=== 웹 컨테이너 로그 ===" -ForegroundColor Yellow
docker-compose -f docker-compose.local.yml logs --tail=10 web

Write-Host ""
Write-Host "=== Nginx 컨테이너 로그 ===" -ForegroundColor Yellow
docker-compose -f docker-compose.local.yml logs --tail=10 nginx

# 접속 안내
Write-Host ""
Write-Host "🎉 로컬 테스트 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 접속 방법:" -ForegroundColor Cyan
Write-Host "  • Nginx를 통한 접속: http://localhost/" -ForegroundColor White
Write-Host "  • 직접 Django 접속: http://localhost:8000/" -ForegroundColor White
Write-Host ""
Write-Host "🔧 유용한 명령어:" -ForegroundColor Cyan
Write-Host "  • 로그 실시간 보기: docker-compose -f docker-compose.local.yml logs -f" -ForegroundColor White
Write-Host "  • 컨테이너 중지: docker-compose -f docker-compose.local.yml down" -ForegroundColor White
Write-Host "  • 컨테이너 재시작: docker-compose -f docker-compose.local.yml restart" -ForegroundColor White
Write-Host ""
Write-Host "🛠️ 디버깅이 필요하다면:" -ForegroundColor Cyan
Write-Host "  • 웹 컨테이너 접속: docker-compose -f docker-compose.local.yml exec web bash" -ForegroundColor White
Write-Host "  • Nginx 컨테이너 접속: docker-compose -f docker-compose.local.yml exec nginx sh" -ForegroundColor White 