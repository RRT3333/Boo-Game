# Boo 게임 프론트엔드 개발 가이드

이 문서는 Boo의 졸업 대모험 웹 게임의 프론트엔드 개발에 참여하는 개발자를 위한 가이드입니다.

## 기술 스택

- **템플릿 엔진**: Django 템플릿 (Django Template Language)
- **JavaScript**: ES6+
- **CSS**: 순수 CSS (프레임워크 없음)
- **캔버스 게임**: HTML5 Canvas API
- **API 통신**: Fetch API

## 디렉토리 구조

```
static/
  ├── css/                    # CSS 파일
  │   ├── main.css            # 메인 페이지 스타일
  │   ├── game.css            # 게임 플레이 스타일
  │   ├── customize.css       # 캐릭터 커스터마이징 스타일
  │   └── leaderboard.css     # 리더보드 스타일
  │
  ├── js/                     # JavaScript 파일
  │   ├── main.js             # 메인 페이지 스크립트
  │   ├── game.js             # 게임 로직 및 캔버스 처리
  │   ├── api-client.js       # API 클라이언트 라이브러리
  │   ├── customize.js        # 캐릭터 커스터마이징 스크립트
  │   └── leaderboard.js      # 리더보드 스크립트
  │
  ├── assets/                 # 게임 에셋
  │   ├── character/          # 캐릭터 이미지
  │   ├── customization/      # 커스터마이징 아이템 이미지
  │   ├── obstacles/          # 장애물 이미지
  │   ├── items/              # 아이템 이미지
  │   ├── backgrounds/        # 배경 이미지
  │   ├── ui/                 # UI 요소 이미지
  │   └── sounds/             # 사운드 파일
  │
  └── images/                 # 기타 이미지
      ├── favicon/            # 파비콘
      └── social/             # 소셜 미디어 공유 이미지
```

## 템플릿 구조

```
game/templates/game/
  ├── base.html              # 기본 템플릿 (공통 요소, SEO, 메타태그)
  ├── index.html             # 메인 페이지
  ├── game.html              # 게임 플레이 페이지
  ├── customize.html         # 캐릭터 커스터마이징 페이지
  ├── leaderboard.html       # 리더보드 페이지
  └── presentation.html      # 발표용 리더보드 페이지
```

## API 문서

API 문서는 Swagger UI를 통해 제공됩니다:
- Swagger UI: `/swagger/`
- ReDoc: `/redoc/`

## JavaScript API 클라이언트

프론트엔드 개발을 위한 JavaScript API 클라이언트가 제공됩니다:
- 파일 위치: `static/js/api-client.js`

### 사용 예시

```javascript
// API 클라이언트 인스턴스 (전역 변수로 이미 제공됨)
const api = window.booGameAPI;

// 또는 ES 모듈 방식으로 임포트
// import BooGameAPI from './api-client.js';
// const api = new BooGameAPI();

// 플레이어 커스터마이징 저장
async function savePlayerCustomization() {
  try {
    const result = await api.savePlayer({
      outfit: 'casual',
      hat: 'cap',
      shoes: 'sneakers'
    });
    console.log('Player saved:', result);
  } catch (error) {
    console.error('Failed to save player:', error);
  }
}

// 게임 점수 저장
async function saveGameScore(playerId) {
  try {
    const result = await api.saveScore({
      player_id: playerId,
      score: 1500,
      play_time: 120,
      max_stage: 3,
      items_collected: 25,
      obstacles_avoided: 42,
      max_combo: 8,
      nickname: '졸업맨'
    });
    console.log('Score saved:', result);
  } catch (error) {
    console.error('Failed to save score:', error);
  }
}

// 리더보드 데이터 가져오기
async function loadLeaderboard() {
  try {
    const data = await api.getLeaderboard();
    console.log('Leaderboard data:', data);
    return data.leaderboard;
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return [];
  }
}

// 닉네임 업데이트
async function updatePlayerNickname(playerId, newNickname) {
  try {
    const result = await api.updateNickname({
      player_id: playerId,
      nickname: newNickname
    });
    console.log('Nickname updated:', result);
  } catch (error) {
    console.error('Failed to update nickname:', error);
  }
}
```

## 게임 엔진 (Canvas API)

게임은 HTML5 Canvas API를 사용하여 구현되어 있습니다:

- `game.js`에서 캔버스 렌더링 및 게임 로직을 처리
- 캔버스 크기는 동적으로 조정됨 (반응형)
- 사용자 입력은 키보드(PC) 및 터치 이벤트(모바일)로 처리

### 중요 함수

- `initGame()`: 게임 초기화
- `startGame()`: 게임 시작
- `updateGame()`: 게임 상태 업데이트
- `drawGame()`: 캔버스에 게임 요소 그리기
- `handleCollision()`: 충돌 감지 및 처리
- `resetGame()`: 게임 리셋

## 세션 관리

Django 세션을 통해 플레이어 정보를 관리합니다:
- 플레이어 ID는 `request.session['player_id']`에 저장
- 커스터마이징 정보는 `request.session['outfit']`, `request.session['hat']`, `request.session['shoes']`에 저장

## CSRF 토큰

Django의 CSRF 보호 메커니즘이 활성화되어 있습니다. Ajax 요청 시 CSRF 토큰을 포함해야 합니다:

```javascript
// Django 템플릿에서 CSRF 토큰 가져오기
const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

// fetch 요청에 포함
fetch('/api/endpoint/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken
  },
  body: JSON.stringify(data)
});
```

## 개발 환경 설정

1. 프로젝트 루트에서 가상 환경 활성화:
   ```
   .\venv\Scripts\activate
   ```

2. 개발 서버 실행:
   ```
   python manage.py runserver
   ```

3. 브라우저에서 `http://localhost:8000` 접속

## 배포 시 주의사항

- 정적 파일은 `python manage.py collectstatic` 명령으로 수집
- 프로덕션 환경에서는 디버그 모드가 비활성화됨
- JavaScript 코드에서 API 엔드포인트 URL이 환경에 맞게 설정되어야 함 