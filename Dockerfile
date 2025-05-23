# Python 3.11 slim 이미지 사용
FROM python:3.11-slim

# 환경 변수 설정
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 비루트 사용자 추가
RUN groupadd -r django && useradd -r -g django django

# 작업 디렉토리 설정
WORKDIR /app

# requirements 복사 및 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 정적 파일 디렉토리 생성 및 권한 설정
RUN mkdir -p /var/www/staticfiles && \
    chown -R django:django /app /var/www/staticfiles

# 시작 스크립트 복사 및 권한 설정
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && \
    chown django:django /docker-entrypoint.sh

# 비루트 사용자로 전환
USER django

# 포트 노출
EXPOSE 8000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# 시작 스크립트로 실행
ENTRYPOINT ["/docker-entrypoint.sh"] 