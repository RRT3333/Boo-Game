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

## 🛠️ 기술 스택

- **백엔드**: Django
- **프론트엔드**: HTML, CSS, JavaScript (Vanilla)
- **데이터베이스**: SQLite
- **배포**: AWS

[![Tests](https://github.com/username/boo-game/actions/workflows/test.yml/badge.svg)](https://github.com/username/boo-game/actions/workflows/test.yml)

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

## 📊 문서 관리

프로젝트 문서는 주로 `context/` 폴더에서 관리되며, 모든 팀원은 이 폴더에 마크다운(.md) 파일을 업데이트해야 합니다:

1. **문서 저장 위치**: 모든 마크다운 문서는 `context/` 폴더에 저장합니다.
   - 주제별 하위 폴더(예: `context/reports/`, `context/study/`)를 활용하세요.
   - 파일명은 영어 소문자와 하이픈으로 작성하세요 (예: `frontend-guide.md`).

2. **문서 렌더링**: 마크다운 문서는 자동으로 HTML로 렌더링됩니다.
   - 정적 마크다운 파일은 어두운 테마의 스타일로 자동 렌더링됩니다.
   - 핵심 문서(프론트엔드 가이드, ERD 등)는 사용자 경험을 위해 HTML 템플릿으로 제공됩니다.

3. **문서 메타데이터 관리**: 다음 명령어로 문서를 관리할 수 있습니다:

```bash
# 문서 스캔 및 메타데이터 생성
python manage.py scan_markdown_files

# 기존 메타데이터 초기화 후 다시 스캔
python manage.py scan_markdown_files --reset

# 메타데이터 파일 삭제
python manage.py scan_markdown_files --delete
```

스캔된 문서는 개발자 대시보드의 문서 허브(http://localhost:8000/developer/docs/)에서 확인할 수 있습니다.

4. **문서 작성 규칙**:
   - 마크다운 문서의 첫 번째 줄은 반드시 `# 제목` 형식의 제목이어야 합니다.
   - 문서 최상단에 작성일자와 버전 정보를 포함하는 것을 권장합니다.
   - 다이어그램이 필요한 경우 Mermaid.js 문법을 사용하세요.

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
- `.env` 파일은 절대 커밋하지 마세요!
- SECRET_KEY, DB 비밀번호 등 민감 정보는 반드시 환경변수로만 관리하세요.
- 운영 서버에는 DEBUG=False로 설정하세요.

---

## 개발자 가이드

### 1. 에셋 파일 구조
프로젝트에는 다음과 같은 에셋 파일 구조가 있습니다:

```
static/
  ├── css/
  ├── js/
  ├── assets/
      ├── character/     # 캐릭터 기본 이미지
      ├── customization/ # 커스터마이징 아이템 이미지
      ├── sounds/        # 게임 효과음
      └── backgrounds/   # 배경 이미지
```

### 2. 사운드 파일
- `static/assets/sounds/` 디렉토리에 사운드 파일 배치
- 현재 더미 파일이 있으니, 실제 사운드 파일로 교체해주세요:
  - `save.mp3`: 이름 저장 시 효과음

### 3. 게임 디자인 및 스타일
- 게임은 청록색(#00DDFF)과 골드(#FFD700) 컬러를 주 색상으로 사용합니다.
- 레트로 콘솔 게임 스타일의 UI를 기반으로 디자인되었습니다.
- 'Press Start 2P' 폰트를 사용해 게임적인 느낌을 살렸습니다.

### 4. 닉네임 관리
- 게임 커스터마이징 시 닉네임을 입력받지 않고, 게임 오버 시점에 입력받습니다.
- 닉네임 미입력 시 '익명의 학생'으로 자동 저장됩니다.
- 닉네임은 `/game/api/update-nickname/` API를 통해 업데이트됩니다.

---

## 기타
- 추가적인 배포 자동화(CI/CD)는 `.github/workflows/`에 예시 워크플로를 참고하세요.