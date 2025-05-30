# Boo Game - 개발 계획

## 프로젝트 구조
```
boo_game/
├── boo_game/ (Django 프로젝트 설정)
├── game/ (Django 앱)
│   ├── views.py (메인, 게임, 리더보드, 커스터마이징 뷰)
│   ├── models.py (점수, 플레이어 정보 모델)
│   ├── urls.py (라우팅 설정)
│   └── templates/
│       └── game/
│           ├── index.html (메인 페이지)
│           ├── customize.html (캐릭터 커스터마이징)
│           ├── game.html (게임 화면)
│           ├── leaderboard.html (일반 리더보드)
│           └── presentation.html (발표용 와이드 리더보드)
├── static/
│   ├── js/
│   │   ├── main.js (메인 페이지 스크립트)
│   │   ├── customize.js (커스터마이징 기능)
│   │   ├── game.js (게임 로직)
│   │   └── leaderboard.js (리더보드 기능)
│   ├── css/
│   │   ├── main.css (메인 페이지 스타일)
│   │   ├── customize.css (커스터마이징 스타일)
│   │   ├── game.css (게임 화면 스타일)
│   │   └── leaderboard.css (리더보드 스타일)
│   └── assets/
│       ├── backgrounds/ (배경 이미지)
│       ├── character/ (캐릭터 기본 이미지)
│       ├── items/ (A+, F 등 아이템)
│       ├── customization/ (옷, 모자, 신발 등)
│       ├── obstacles/ (장애물 이미지)
│       ├── ui/ (UI 요소)
│       └── effects/ (효과 이미지, 애니메이션)
```

## 이미지 에셋 규격 가이드라인

### 캐릭터 에셋
- **기본 캐릭터 (Boo)**: 150x150px (PNG, 투명 배경)
- **의상 아이템**: 150x150px (PNG, 투명 배경)
- **모자 아이템**: 80x60px (PNG, 투명 배경)
- **신발 아이템**: 60x40px (PNG, 투명 배경)

### 게임 오브젝트
- **장애물 (F, 프로그램, 폴더, 문)**: 100x100px (PNG, 투명 배경)
- **아이템 (A+, 코인)**: 80x80px (PNG, 투명 배경)
- **교수님 캐릭터**: 180x200px (PNG, 투명 배경)

### 배경 이미지
- **메인 배경**: 1600x900px (JPG/PNG)
- **각 스테이지 배경**: 1600x900px (JPG/PNG)
  - 교양관, 명수당, 공대, 백년관, 기숙사, 정문

### UI 요소
- **버튼**: 200x80px (PNG, 투명 배경)
- **하트 아이콘**: 40x40px (PNG, 투명 배경)
- **말풍선**: 300x200px (PNG, 투명 배경)

## 혁신적 게임 시스템 (기존 PRD에서 확장)

### 1. 동적 난이도 시스템
- 플레이어 실력에 따라 자동으로 난이도 조절
- 연속 성공 시 난이도 상승, 실패 시 일시적 난이도 하락
- 각 스테이지별 고유 장애물 패턴 (예: 공대는 코딩 문제, 명수당은 영어 단어 등)

### 2. 콤보 시스템
- 연속으로 A+ 획득 시 콤보 점수 획득
- 콤보 UI와 효과음으로 피드백 제공
- 특정 콤보 달성 시 추가 보너스 (무적 모드, 점수 2배 등)

### 3. 강의 퀴즈 미니게임
- 랜덤하게 등장하는 교수님의 퀴즈
- 정답 선택 시 큰 점수 보너스
- 오답 선택 시 패널티 없음 (도전 장려)

### 4. 소셜 기능
- 점수 SNS 공유 기능
- 친구 초대 및 점수 경쟁 시스템
- QR코드로 리더보드 공유

### 5. 성취 시스템
- 다양한 업적 달성 시 특별 아이템 획득
- 숨겨진 이스터에그와 비밀 스테이지
- 총장 보스전 (특정 조건 달성 시 등장)

## 개발 우선순위

1. **기본 구조 리팩토링**
   - 페이지 구조 개선
   - 에셋 시스템 구현

2. **핵심 기능 개발**
   - 메인 페이지
   - 커스터마이징 시스템
   - 게임 로직 개선
   - 스테이지 시스템
   - 리더보드 구현

3. **고급 기능 개발**
   - 동적 난이도 시스템
   - 콤보 시스템
   - 퀴즈 미니게임
   - 모바일 최적화

4. **추가 기능 개발**
   - 소셜 기능
   - 성취 시스템
   - 이스터에그

## 기술적 고려사항

- 모바일 최적화를 위한 반응형 디자인 및 터치 컨트롤 개선
- 캔버스 최적화로 부드러운 애니메이션과 게임플레이 구현
- 로컬 스토리지 활용하여 커스터마이징 정보 저장
- 다양한 브라우저와 디바이스 호환성 확보 