# Boo Game 에셋 가이드

이 문서는 Boo Game에서 사용되는 에셋의 구조, 형식, 네이밍 컨벤션에 대한 상세한 정보를 제공합니다.

## 디렉토리 구조

```
static/
  ├── css/              # 스타일시트 파일
  ├── js/               # 자바스크립트 파일
  │   ├── modules/      # 모듈화된 게임 코드
  │   │   ├── game-core.js      # 게임 핵심 로직
  │   │   ├── game-entities.js  # 게임 객체 관리
  │   │   ├── game-events.js    # 게임 이벤트 처리
  │   │   ├── game-physics.js   # 게임 물리 엔진
  │   │   ├── game-renderer.js  # 게임 렌더링
  │   │   ├── game-ui.js        # 게임 UI 관리
  │   │   ├── game-audio.js     # 게임 오디오 시스템
  │   │   └── game-api.js       # 게임 API 통신
  │   └── game.js       # 게임 진입점
  └── assets/           # 게임 에셋
      ├── character/     # 캐릭터 기본 이미지
      ├── customization/ # 커스터마이징 아이템 이미지
      ├── backgrounds/   # 배경 이미지
      ├── items/         # 아이템 이미지 (A+, 코인 등)
      ├── obstacles/     # 장애물 이미지 (F 등)
      ├── effects/       # 특수 효과 이미지
      ├── ui/            # UI 요소 이미지
      └── sounds/        # 게임 효과음
```

## 사운드 파일

게임에서 사용되는 모든 사운드 파일은 `static/assets/sounds/` 디렉토리에 위치합니다.

### 사운드 파일 목록

| 파일명 | 설명 | 포맷 | 볼륨 |
|--------|------|------|------|
| jump.mp3 | 플레이어 점프 시 재생 | MP3 | 0.5 |
| coin.mp3 | 코인 획득 시 재생 | MP3 | 0.5 |
| aplus.mp3 | A+ 획득 시 재생 | MP3 | 0.5 |
| gameover.mp3 | 게임 오버 시 재생 | MP3 | 0.5 |
| save.mp3 | 닉네임 저장 시 재생 | MP3 | 0.5 |
| button.mp3 | 버튼 클릭 시 재생 | MP3 | 0.5 |

### 사운드 파일 추가 방법

1. MP3 또는 WAV 형식의 사운드 파일을 `static/assets/sounds/` 폴더에 배치
2. `game-audio.js` 모듈의 `soundPaths` 객체에 새 사운드 추가
3. `playSound()` 함수를 사용하여 적절한 시점에 재생

```javascript
// 사운드 추가 예시 (game-audio.js)
const soundPaths = {
    // 기존 사운드...
    newSound: `${basePath}newSound.${supportedFormat}`
};

// 다른 모듈에서 사운드 재생 예시
import { playSound } from './game-audio.js';

// 사운드 재생
playSound(sounds, 'newSound');
```

## 게임 모듈 구조

게임 코드는 다음과 같은 모듈로 구성되어 있습니다:

- **game-core.js**: 게임의 핵심 클래스와 로직을 담당
- **game-entities.js**: 플레이어, 장애물, 아이템 등의 객체를 관리
- **game-events.js**: 게임 내 이벤트 처리를 담당
- **game-physics.js**: 게임 내 모든 물리 엔진과 상태 업데이트를 담당
- **game-renderer.js**: 게임 화면 렌더링을 담당
- **game-ui.js**: 게임 내 UI 요소 및 화면 관리를 담당
- **game-audio.js**: 게임 내 사운드 효과를 관리
- **game-api.js**: 서버 API 통신을 담당

## 이미지 및 스프라이트

### 캐릭터 이미지

- **기본 위치**: `static/assets/character/`
- **기본 파일**: `duck.png` (기본 캐릭터 이미지)
- **치수**: 100x100px (권장)
- **포맷**: PNG (투명 배경)

### 커스터마이징 아이템

- **기본 위치**: `static/assets/customization/`
- **네이밍 규칙**: 
  - 의상: `{outfit_name}.png` (예: casual.png, formal.png)
  - 모자: `{hat_name}.png` (예: cap.png, beanie.png)
  - 신발: `{shoes_name}.png` (예: sneakers.png, boots.png)
- **치수**: 의상/모자/신발 각각 100x100px (캐릭터와 동일)
- **포맷**: PNG (투명 배경)

### 배경 이미지

- **기본 위치**: `static/assets/backgrounds/`
- **네이밍 규칙**: `{stage_name}_bg.png` (예: library_bg.png)
- **치수**: 1600x600px (화면 스크롤을 위해 너비는 게임 화면의 2배)
- **포맷**: PNG 또는 JPG

### UI 요소

- **기본 위치**: `static/assets/ui/`
- **네이밍 규칙**: `{element_name}.png` (예: button.png, icon_heart.png)
- **포맷**: PNG (투명 배경 권장)

## 스타일 가이드

### 색상 팔레트

게임에서는 다음 색상 팔레트를 사용합니다:

- **주요 색상**: #00DDFF (청록색)
- **강조 색상**: #FFD700 (골드)
- **경고 색상**: #FF1744 (빨간색)
- **다크 색상**: #121212 (거의 검정색)
- **라이트 색상**: #FAFAFA (거의 흰색)

### 폰트

- **주 폰트**: 'Press Start 2P' (픽셀화된 레트로 게임 폰트)
- **보조 폰트**: Arial, sans-serif

### UI 디자인

- **버튼**: 둥근 모서리, 주요/강조 색상, 호버 시 약간 확대 애니메이션
- **창**: 검은 배경, 청록색 테두리, 골드 색상 텍스트 헤더
- **아이콘**: 간결하고 인식하기 쉬운 픽셀 아트 스타일

## 닉네임 관리

게임에서는 커스터마이징 시 닉네임을 입력받지 않고, 게임 오버 시점에 입력받습니다:

- 닉네임 미입력 시 '익명의 학생'으로 자동 저장
- 게임 오버 화면에서 레트로 스타일 콘솔 입력 UI를 통해 입력
- 최대 길이는 12자
- 닉네임 저장 시 `/game/api/update-nickname/` API 호출 (game-api.js 모듈에서 처리)

## 모바일 최적화

게임은 모바일 환경에서도 최적화되어 있습니다:

- 반응형 캔버스 크기 조정
- 터치 입력 최적화 (디바운싱 적용)
- 모바일 기기에 맞는 UI 배치
- 가로 모드 권장 (orientation 감지)
- 모바일에서 더 큰 오디오 볼륨 (0.7)

## 추가 리소스

- 무료 픽셀 아트 리소스: [OpenGameArt](https://opengameart.org/)
- 무료 게임 효과음: [FreeSound](https://freesound.org/)
- 픽셀 아트 에디터: [Piskel](https://www.piskelapp.com/), [Aseprite](https://www.aseprite.org/)
- 게임 폰트: [Google Fonts - Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)

## 에셋 업데이트 워크플로우

1. 새 에셋 준비 (이미지/사운드)
2. 적절한 폴더에 파일 배치
3. 필요한 코드 업데이트 (해당 모듈 파일)
4. 로컬 테스트
5. 변경사항 커밋 및 푸시

---

이 가이드는 개발 중 필요에 따라 지속적으로 업데이트됩니다. 