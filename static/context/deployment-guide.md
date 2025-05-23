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

# 테스트 실행 (추가됨)
python manage.py test

# 정적 파일 수집
python manage.py collectstatic

# 마크다운 문서 스캔 (추가됨)
python manage.py scan_markdown_files_new

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

# 테스트 실행 (추가됨)
python manage.py test

# 정적 파일 수집
python manage.py collectstatic

# 마크다운 문서 스캔 (추가됨)
python manage.py scan_markdown_files_new

# 서비스 재시작
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

## 8. CI/CD 파이프라인 설정 (추가됨)

### 8.1 GitHub Actions 설정

프로젝트는 GitHub Actions를 사용하여 지속적 통합 및 배포를 자동화합니다. `.github/workflows/main.yaml` 파일이 이 설정을 정의합니다.

워크플로우 구성:
1. **테스트**: 모든 PR 및 main 브랜치에 푸시할 때 자동으로 테스트 실행
2. **배포**: main 브랜치에 푸시할 때만 AWS 서버에 자동 배포

### 8.2 GitHub Secrets 설정

GitHub 저장소에 다음 Secrets를 설정해야 합니다:

- `SSH_PRIVATE_KEY`: AWS 인스턴스 접속을 위한 SSH 개인 키
- `SSH_HOST`: AWS 인스턴스의 IP 주소 또는 도메인
- `SSH_USERNAME`: SSH 접속 사용자명 (예: ec2-user)
- `DJANGO_SECRET_KEY`: Django 애플리케이션의 시크릿 키

### 8.3 자동 배포 흐름

1. 개발자가 main 브랜치에 코드 변경 사항 푸시
2. GitHub Actions가 자동으로 테스트 실행
3. 테스트 통과 시 AWS 서버에 변경 사항 배포:
   - 코드 업데이트
   - 의존성 설치
   - 마이그레이션 실행
   - 정적 파일 수집
   - 서비스 재시작

### 8.4 수동 배포 트리거

GitHub 저장소의 Actions 탭에서 워크플로우를 수동으로 트리거할 수 있습니다:

1. Actions 탭으로 이동
2. "Deploy to AWS" 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. 브랜치 선택 후 "Run workflow" 클릭

## 9. 테스트 실행 및 관리 (추가됨)

### 9.1 테스트 종류

프로젝트에는 다음과 같은 테스트가 포함되어 있습니다:

- **모델 테스트**: 데이터 모델의 생성 및 검증
- **뷰 테스트**: API 엔드포인트 및 렌더링 확인
- **관리 명령어 테스트**: 커스텀 명령어 기능 검증
- **문서 처리 테스트**: 마크다운 처리 기능 확인

### 9.2 로컬에서 테스트 실행

```bash
# 모든 테스트 실행
python manage.py test

# 특정 앱의 테스트만 실행
python manage.py test game

# 특정 테스트 케이스만 실행
python manage.py test developer.tests.CommandTests
```

### 9.3 테스트 커버리지 확인

테스트 커버리지를 측정하려면:

```bash
# 커버리지 패키지 설치
pip install coverage

# 커버리지 측정과 함께 테스트 실행
coverage run --source='.' manage.py test

# 커버리지 리포트 생성
coverage report

# HTML 보고서 생성 (더 자세한 정보 제공)
coverage html
# 그 후 htmlcov/index.html 파일을 브라우저에서 열기
```

## 10. 모니터링 및 백업

### 10.1 모니터링 설정

- AWS CloudWatch를 사용한 인스턴스 모니터링 설정
- 알람 설정: CPU 사용량, 메모리 사용량 등

### 10.2 자동 백업 설정

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

## 11. 트러블슈팅

### 11.1 일반적인 문제 해결

- **500 Internal Server Error**: 로그 확인 후 서비스 재시작
- **정적 파일 로드 실패**: 경로 확인 및 권한 설정
- **데이터베이스 오류**: 연결 설정 및 마이그레이션 확인

### 11.2 성능 최적화

- 정적 파일 캐싱 설정
- 데이터베이스 인덱싱
- 이미지 최적화

## 12. 추가 기능 구현 (향후)

### 12.1 CDN 설정 (Amazon CloudFront)

1. CloudFront 배포 생성
2. 정적 파일 경로 설정
3. Nginx 설정 업데이트

### 12.2 자동 배포 파이프라인

1. GitHub Actions 또는 AWS CodePipeline 설정
2. 자동 테스트 및 배포 스크립트 작성

## 13. 참고 자료

- [Django 배포 공식 문서](https://docs.djangoproject.com/en/3.2/howto/deployment/)
- [AWS EC2 문서](https://docs.aws.amazon.com/ec2/)
- [Nginx 문서](https://nginx.org/en/docs/)
- [Gunicorn 문서](https://docs.gunicorn.org/en/stable/)

## 테스트 및 CI/CD 가이드

Boo Game 프로젝트는 자동화된 테스트 시스템을 갖추고 있으며, 이를 통해 코드 변경 시 기존 기능이 정상적으로 작동하는지 확인할 수 있습니다. 특히 개발자 앱(`developer`) 에는 포괄적인 테스트 코드가 구현되어 있습니다.

### 자동화된 테스트 실행

모든 앱에 대한 테스트를 실행하려면:

```bash
python manage.py test
```

특정 앱에 대한 테스트만 실행하려면:

```bash
python manage.py test developer  # 개발자 앱 테스트
python manage.py test game       # 게임 앱 테스트
```

특정 테스트 클래스나 메서드를 실행하려면:

```bash
python manage.py test developer.tests.DeveloperViewsTestCase  # 특정 테스트 클래스
python manage.py test developer.tests.DeveloperViewsTestCase.test_docs_hub_view  # 특정 테스트 메서드
```

### 테스트 구조

개발자 앱의 테스트는 크게 세 부분으로 구성되어 있습니다:

1. **뷰 테스트 (`DeveloperViewsTestCase`)**
   - 대시보드, 문서 허브, API 클라이언트 문서 등 모든 뷰의 정상 작동 확인
   - 마크다운 렌더링 기능 검증
   - HTTP 응답 코드와 템플릿 렌더링 테스트

2. **메타데이터 테스트 (`MarkdownMetadataTestCase`)**
   - 마크다운 메타데이터 관리 기능 검증
   - 파일 존재 여부에 따른 동작 테스트

3. **관리 명령어 테스트 (`ManagementCommandsTestCase`)**
   - 마크다운 파일 스캔 및 메타데이터 생성 명령어 테스트
   - 심볼릭 링크 생성 명령어 테스트

### CI/CD 파이프라인에서의 테스트

CI/CD 파이프라인에서 테스트를 활용하려면 다음 단계를 따르세요:

1. **테스트 환경 설정**
   - 테스트용 데이터베이스 구성 (Django는 자동으로 테스트용 DB 생성)
   - 테스트에 필요한 환경 변수 설정 
   - 필요한 의존성 설치

2. **테스트 실행**
   - 아래 예시와 같이 GitHub Actions 워크플로에 테스트 단계 추가

   ```yaml
   # .github/workflows/test.yml 예시
   name: Django Tests
   
   on:
     push:
       branches: [ main, develop ]
     pull_request:
       branches: [ main, develop ]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v3
       - name: Set up Python
         uses: actions/setup-python@v4
         with:
           python-version: '3.11'
       - name: Install dependencies
         run: |
           python -m pip install --upgrade pip
           pip install -r requirements.txt
       - name: Run tests
         run: |
           python manage.py test
   ```

3. **테스트 보고서 생성**
   - 테스트 커버리지 보고서를 생성하려면 `coverage` 패키지 활용:

   ```bash
   pip install coverage
   coverage run --source='.' manage.py test
   coverage report
   coverage html  # HTML 보고서 생성
   ```

### 테스트 작성 가이드

새로운 기능 개발 시 테스트를 작성하려면:

1. 각 앱의 `tests.py` 파일에 테스트 클래스 및 메서드 추가
2. Django의 `TestCase` 클래스 확장
3. 각 테스트 메서드는 `test_`로 시작
4. 모의 객체(mock)를 활용하여 외부 의존성 분리
5. `assert` 메서드를 사용하여 예상 결과 검증

예시:
```python
from django.test import TestCase
from django.urls import reverse

class MyFeatureTest(TestCase):
    def setUp(self):
        # 테스트 사전 설정
        pass
        
    def test_feature_works(self):
        response = self.client.get(reverse('my-view-name'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '예상되는 내용')
```

### 테스트 모범 사례

1. 각 테스트는 독립적이고 반복 가능하게 작성
2. 테스트 간에 상태를 공유하지 않도록 주의
3. 외부 의존성(파일 시스템, 데이터베이스 등)은 모의 객체로 대체
4. 테스트 케이스는 간결하고 집중적으로 작성
5. 조건부 로직을 테스트할 때는 경계 조건도 함께 테스트
6. 중요한 오류 사례도 테스트에 포함

이러한 테스트 시스템을 활용함으로써 개발 과정에서 기존 기능의 유지보수성을 높이고, 코드 변경으로 인한 회귀 문제를 조기에 발견할 수 있습니다. 