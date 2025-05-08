# Boo Game 배포 가이드

이 문서는 Boo Game을 AWS에 배포하기 위한 단계별 가이드입니다.

## 1. 사전 준비

### 1.1 필요한 계정 및 도구

- AWS 계정 (프리 티어 이상)
- Git
- Python 3.8 이상
- pip
- Django 3.2 이상

### 1.2 로컬 설정 확인

배포 전 로컬 환경에서 모든 기능이 정상 작동하는지 확인합니다:

```bash
# 필요한 패키지 설치 확인
pip install -r requirements.txt

# 마이그레이션 적용
python manage.py migrate

# 정적 파일 수집
python manage.py collectstatic

# 개발 서버에서 테스트
python manage.py runserver
```

## 2. AWS 배포 준비

### 2.1 AWS EC2 인스턴스 생성

1. AWS 콘솔에 로그인하여 EC2 대시보드로 이동
2. "인스턴스 시작" 클릭
3. 다음 설정으로 EC2 인스턴스 생성:
   - AMI: Amazon Linux 2 (또는 Ubuntu 20.04)
   - 인스턴스 유형: t2.micro (프리 티어)
   - 스토리지: 기본 8GB
   - 보안 그룹: HTTP(80), HTTPS(443), SSH(22) 포트 오픈
4. 키 페어(.pem) 생성 및 저장 (이후 SSH 접속에 필요)

### 2.2 Elastic IP 생성 및 할당

1. EC2 대시보드의 "탄력적 IP" 섹션으로 이동
2. 새 주소 할당 후 생성된 인스턴스에 연결

## 3. 서버 환경 설정

### 3.1 EC2 인스턴스에 SSH 접속

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@your-elastic-ip
```

### 3.2 필요한 패키지 설치

```bash
# Amazon Linux 2 기준
sudo yum update -y
sudo yum install -y python3 python3-pip python3-devel nginx git

# Python 가상환경 설정
sudo pip3 install virtualenv
```

### 3.3 프로젝트 클론 및 설정

```bash
# 프로젝트 디렉토리 생성
mkdir -p /home/ec2-user/boo-game
cd /home/ec2-user/boo-game

# 저장소 클론
git clone https://github.com/your-username/boo-game.git .

# 가상환경 생성 및 활성화
virtualenv venv
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt
pip install gunicorn

# 환경 변수 설정 (프로덕션 모드)
echo "export DJANGO_SETTINGS_MODULE=boo_game.settings" >> ~/.bashrc
echo "export DJANGO_DEBUG=False" >> ~/.bashrc
echo "export DJANGO_SECRET_KEY='your-secret-key'" >> ~/.bashrc
source ~/.bashrc
```

## 4. 데이터베이스 설정

### 4.1 SQLite 사용 시

```bash
# 디렉토리 권한 설정
sudo chown -R ec2-user:ec2-user /home/ec2-user/boo-game
chmod 664 /home/ec2-user/boo-game/db.sqlite3
chmod 775 /home/ec2-user/boo-game

# 마이그레이션 수행
python manage.py migrate
```

### 4.2 PostgreSQL 사용 시 (권장)

```bash
# PostgreSQL 설치
sudo yum install -y postgresql postgresql-devel

# PostgreSQL 시작 및 활성화
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 데이터베이스 및 사용자 생성
sudo -u postgres createdb boo_game_db
sudo -u postgres createuser boo_game_user
sudo -u postgres psql -c "ALTER USER boo_game_user WITH ENCRYPTED PASSWORD 'your-db-password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE boo_game_db TO boo_game_user;"

# settings.py 데이터베이스 설정 업데이트
```

## 5. Gunicorn 및 Nginx 설정

### 5.1 Gunicorn 설정

Gunicorn 서비스 파일 생성:

```bash
sudo nano /etc/systemd/system/gunicorn.service
```

다음 내용 입력:

```
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/boo-game
ExecStart=/home/ec2-user/boo-game/venv/bin/gunicorn --workers 3 --bind unix:/home/ec2-user/boo-game/boo_game.sock boo_game.wsgi:application

[Install]
WantedBy=multi-user.target
```

서비스 시작:

```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

### 5.2 Nginx 설정

Nginx 설정 파일 생성:

```bash
sudo nano /etc/nginx/conf.d/boo-game.conf
```

다음 내용 입력:

```
server {
    listen 80;
    server_name your-elastic-ip;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /home/ec2-user/boo-game;
    }
    
    location /media/ {
        root /home/ec2-user/boo-game;
    }
    
    location / {
        include proxy_params;
        proxy_pass http://unix:/home/ec2-user/boo-game/boo_game.sock;
    }
}
```

설정 테스트 및 서비스 재시작:

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 6. SSL 인증서 설정 (HTTPS)

### 6.1 Certbot 설치

```bash
sudo amazon-linux-extras install epel
sudo yum install -y certbot python-certbot-nginx
```

### 6.2 인증서 발급

```bash
sudo certbot --nginx -d your-domain.com
```

## 7. 배포 후 확인 및 유지보수

### 7.1 배포 확인

- 웹 브라우저에서 `http://your-elastic-ip` 또는 `https://your-domain.com` 접속
- 모든 기능 정상 작동 확인
- 모바일 디바이스에서 테스트

### 7.2 로그 확인

```bash
# Nginx 로그
sudo tail -f /var/log/nginx/error.log

# Gunicorn 로그
sudo journalctl -u gunicorn
```

### 7.3 업데이트 배포

```bash
cd /home/ec2-user/boo-game
source venv/bin/activate

# 저장소 업데이트
git pull

# 의존성 업데이트
pip install -r requirements.txt

# 마이그레이션 적용
python manage.py migrate

# 정적 파일 재수집
python manage.py collectstatic --noinput

# 서비스 재시작
sudo systemctl restart gunicorn
```

## 8. 모니터링 및 백업

### 8.1 모니터링 설정

- AWS CloudWatch를 사용한 인스턴스 모니터링 설정
- 알람 설정: CPU 사용량, 메모리 사용량 등

### 8.2 자동 백업 설정

```bash
# 백업 스크립트 생성
nano ~/backup.sh
```

스크립트 내용:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/home/ec2-user/backups"

# 디렉토리 생성
mkdir -p $BACKUP_DIR

# 데이터베이스 백업
sqlite3 /home/ec2-user/boo-game/db.sqlite3 .dump > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# 압축
tar -czf $BACKUP_DIR/boo_game_backup_$TIMESTAMP.tar.gz -C /home/ec2-user/boo-game .

# 오래된 백업 삭제 (30일 이상)
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +30 -delete
find $BACKUP_DIR -name "*.sql" -type f -mtime +30 -delete
```

권한 및 cron 설정:

```bash
chmod +x ~/backup.sh

# 매일 자정에 백업 실행
(crontab -l 2>/dev/null; echo "0 0 * * * /home/ec2-user/backup.sh") | crontab -
```

## 9. 트러블슈팅

### 9.1 일반적인 문제 해결

- **500 Internal Server Error**: 로그 확인 후 서비스 재시작
- **정적 파일 로드 실패**: 경로 확인 및 권한 설정
- **데이터베이스 오류**: 연결 설정 및 마이그레이션 확인

### 9.2 성능 최적화

- 정적 파일 캐싱 설정
- 데이터베이스 인덱싱
- 이미지 최적화

## 10. 추가 기능 구현 (향후)

### 10.1 CDN 설정 (Amazon CloudFront)

1. CloudFront 배포 생성
2. 정적 파일 경로 설정
3. Nginx 설정 업데이트

### 10.2 자동 배포 파이프라인

1. GitHub Actions 또는 AWS CodePipeline 설정
2. 자동 테스트 및 배포 스크립트 작성

## 11. 참고 자료

- [Django 배포 공식 문서](https://docs.djangoproject.com/en/3.2/howto/deployment/)
- [AWS EC2 문서](https://docs.aws.amazon.com/ec2/)
- [Nginx 문서](https://nginx.org/en/docs/)
- [Gunicorn 문서](https://docs.gunicorn.org/en/stable/) 