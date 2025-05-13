# Boo Game - 외대 졸업 대모험

외대 캐릭터 Boo를 조종하여 학교를 졸업시키는 웹 게임입니다. 
F 학점을 피하고 A+를 얻으며 졸업을 향해 나아가세요!

## 🎮 게임 소개

- **게임 형식**: Flappy Bird 스타일의 웹 게임
- **목표**: 모든 스테이지를 거쳐 정문에 도달하여 졸업하기
- **캐릭터**: 외대 캐릭터 Boo (오리)
- **장애물**: F 학점, 프로그램, 폴더, 문 등
- **아이템**: A+ 학점, 코인 등
- **스테이지**: 교양관 → 명수당 → 공대 → 백년관 → 기숙사 → 정문

## 🚀 주요 기능

- **다양한 스테이지**: 6개의 다양한 배경과 특징을 가진 스테이지
- **캐릭터 커스터마이징**: 다양한 의상, 모자, 신발로 나만의 Boo 꾸미기
- **동적 난이도 시스템**: 플레이어 실력에 맞게 자동으로 조절되는 난이도
- **콤보 시스템**: 연속으로 아이템 획득 시 추가 점수와 효과
- **특별 이벤트**: 교수님 등장, 미니게임 등 다양한 게임 이벤트
- **모바일 최적화**: 모바일 기기에서도 편리하게 플레이 가능
- **리더보드**: 성적과 졸업 여부를 친구들과 경쟁

## 🌟 핵심 기술 하이라이트

### 📘 직접 개발한 JavaScript 라이브러리

Boo Game은 자체 개발한 JavaScript 라이브러리를 활용합니다:

- **BooGameAPI**: RESTful API 통신을 단순화하는 클라이언트 라이브러리
  ```javascript
  // 사용 예시
  const api = new BooGameAPI();
  api.saveScore({
    player_id: 'player123',
    score: 5000,
    nickname: 'BooMaster'
  });
  ```

### 💻 개발자 허브 & 문서화 시스템

Boo Game은 개발자 작업 효율성을 높이기 위한 통합 개발자 허브를 제공합니다:

- **통합 문서 허브**: 마크다운 문서를 자동으로 스캔하고 HTML로 렌더링
- **ERD 시각화**: Mermaid.js를 활용한 데이터베이스 다이어그램 자동 생성
- **API 문서**: Swagger와 ReDoc을 통한 RESTful API 문서 자동화
- **디버깅 도구**: 게임 상태 모니터링 및 디버깅을 위한 개발자 도구

개발자 허브는 `http://boogame.kr/developer/` 에서 접근할 수 있습니다.

### 🔄 CI/CD 파이프라인

자동화된 개발 워크플로우로 코드 품질과 배포 효율성을 보장합니다:

- **자동화된 테스트**: GitHub Actions를 통한 단위 및 통합 테스트 자동화
- **코드 품질 검사**: 정적 코드 분석 및 코드 커버리지 리포트 생성
- **자동 배포**: 메인 브랜치 푸시 시 AWS EC2에 자동 배포
- **환경 분리**: 개발, 테스트, 운영 환경 설정 자동화

CI/CD 설정은 `.github/workflows/main.yaml` 파일에서 확인할 수 있습니다.

## 🛠️ 기술 스택

- **백엔드**: Django 5.2, Django REST Framework
- **프론트엔드**: HTML5, CSS3, JavaScript ES6+, 자체 개발 게임 라이브러리
- **데이터베이스**: SQLite(개발), PostgreSQL(운영)
- **배포**: AWS EC2, Nginx, Gunicorn
- **CI/CD**: GitHub Actions
- **문서화**: Swagger, ReDoc, Mermaid.js

[![CI/CD Status](https://github.com/username/boo-game/actions/workflows/main.yaml/badge.svg)](https://github.com/username/boo-game/actions/workflows/main.yaml)

## 🔧 개발 환경 설정

### 1. 요구 사항

- Python 3.8 이상
- pip (Python 패키지 관리자)
- Git

### 2. 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/boo-game.git
cd boo-game

# 가상 환경 생성 및 활성화
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 또는
venv\Scripts\activate  # Windows

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 마이그레이션
python manage.py migrate

# 개발 서버 실행
python manage.py runserver
```

이제 브라우저에서 http://localhost:8000 으로 게임에 접속할 수 있습니다.

### 3. 테스트 실행

Boo Game은 자동화된 테스트를 통해 코드 품질을 유지합니다. 테스트를 실행하려면:

```bash
# 모든 테스트 실행
python manage.py test

# 특정 앱 테스트
python manage.py test developer
python manage.py test game

# 테스트 커버리지 확인 (coverage 패키지 필요)
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

테스트에 대한 자세한 정보는 `deployment-guide.md`의 "테스트 및 CI/CD 가이드" 섹션을 참조하세요.

## 🎨 에셋 정보

게임에 사용되는 모든 에셋 정보와 규격은 `assets-guide.md` 파일에 상세히 기록되어 있습니다.

## 📋 기능 명세서

상세한 기능 명세는 `context/prd.md` 파일에서 확인할 수 있습니다.

## 📝 프로젝트 문서

모든 프로젝트 문서는 `context/` 폴더에 정리되어 있습니다:

- `context/prd.md`: 제품 요구사항 문서
- `context/project-plan.md`: 프로젝트 계획
- `context/project-summary.md`: 프로젝트 요약
- `context/erd.md`: ERD 및 데이터베이스 설계
- `context/deployment-guide.md`: 배포 가이드
- `context/assets-guide.md`: 에셋 가이드
- `context/frontend-guide.md`: 프론트엔드 개발 가이드
- `context/reports/`: 주차별 보고서
- `context/study/`: 학습 자료

## 📊 문서 관리 시스템

프로젝트는 강력한 문서 관리 시스템을 갖추고 있으며, 모든 문서는 `context/` 폴더에서 관리됩니다:

1. **자동 스캔 및 렌더링**: 모든 마크다운 파일이 자동으로 스캔되어 HTML로 렌더링됩니다.
   ```bash
   # 문서 스캔 및 메타데이터 생성
   python manage.py scan_markdown_files
   ```

2. **시각적 문서 허브**: 개발자 대시보드에서 모든 문서에 쉽게 접근하고 검색할 수 있습니다.
   - 문서는 카테고리별로 자동 분류됩니다
   - 다크 테마의 가독성 높은 인터페이스 제공
   - 코드 하이라이팅과 다이어그램 지원

3. **문서 버전 관리**: 문서 버전 관리와 업데이트 이력 추적 기능

4. **개발 중 자동 업데이트**: CI/CD 파이프라인에 통합되어 배포 시 문서가 자동으로 업데이트됩니다.

개발자 문서 허브는 `http://localhost:8000/developer/docs/`에서 접근할 수 있습니다.

## 📋 역할 분담

- **김수민**: 디자인 컴포넌트, PPT 제작
- **홍다오**: 서버 개발, 배포, 최종 보고서 작성
- **이주형**: 프론트엔드 개발

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 공개되어 있습니다. 자세한 내용은 LICENSE 파일을 참조하세요.

## 환경별 설정 및 배포 가이드

### 1. 환경 변수 파일 (.env)
- **로컬 개발:** `.env.local` 파일을 프로젝트 루트에 복사 후 `.env`로 이름 변경
- **운영 배포:** `.env.production` 파일을 프로젝트 루트에 복사 후 `.env`로 이름 변경
- `.env` 파일은 절대 깃허브에 커밋하지 마세요! (보안)

#### .env 예시
```
# .env.local
DJANGO_ENV=local
DJANGO_SECRET_KEY=your-local-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=sqlite:///db.sqlite3
STATIC_ROOT=staticfiles

# .env.production
DJANGO_ENV=production
DJANGO_SECRET_KEY=your-prod-secret-key
DEBUG=False
ALLOWED_HOSTS=your.domain.com
DATABASE_URL=postgres://user:password@host:5432/dbname
STATIC_ROOT=/var/www/boo_game/static/
```

### 2. settings.py 환경 분기
- `.env`의 `DJANGO_ENV` 값에 따라 개발/운영 설정이 자동 분기됩니다.
- SECRET_KEY, DB, ALLOWED_HOSTS 등은 반드시 환경변수에서만 읽습니다.
- settings.py, manage.py, wsgi.py, asgi.py 모두 .env를 자동 로드합니다.

### 3. requirements.txt
- 운영/개발 공통 패키지: `requirements.txt`
- 개발 전용 패키지: `requirements-dev.txt` (옵션)

### 4. 배포 환경
- 운영 서버: AWS EC2 (Linux, gunicorn, nginx)
- 소스코드: Github Actions 등 CI/CD로 배포 가능
- gunicorn, nginx 설정은 서버에 직접 적용 (레포에는 예시만 제공)

### 5. 보안 주의사항
- `.env`