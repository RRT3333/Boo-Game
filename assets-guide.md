# Boo Game 에셋 가이드

이 문서는 Boo Game의 모든 에셋에 대한 규격과 설명을 제공합니다.

## 📂 에셋 디렉토리 구조

```
static/
└── assets/
    ├── backgrounds/     # 배경 이미지 (6개 스테이지 + 메인/커스터마이징/리더보드)
    ├── character/       # 캐릭터 기본 이미지
    ├── customization/   # 커스터마이징 아이템 (의상, 모자, 신발)
    ├── items/           # 게임 아이템 (A+, 코인 등)
    ├── obstacles/       # 장애물 (F, 폴더, 프로그램, 문 등)
    ├── ui/              # UI 요소 (버튼, 아이콘, QR 코드 등)
    └── effects/         # 특수 효과 (폭발, 반짝임 등)
```

## 🎨 이미지 에셋 규격

### 1. 캐릭터 에셋

| 파일명 | 경로 | 크기 | 포맷 | 설명 |
|-------|-----|------|-----|------|
| duck.png | assets/character/ | 150x150px | PNG (투명 배경) | 기본 캐릭터 (Boo) |

### 2. 커스터마이징 아이템

#### 의상 (5종)

| 파일명 | 경로 | 크기 | 포맷 | 설명 |
|-------|-----|------|-----|------|
| default.png | assets/customization/ | 150x150px | PNG (투명 배경) | 기본 의상 (빈 파일) |
| casual.png | assets/customization/ | 150x150px | PNG (투명 배경) | 캐주얼 의상 |
| formal.png | assets/customization/ | 150x150px | PNG (투명 배경) | 정장 의상 |
| sporty.png | assets/customization/ | 150x150px | PNG (투명 배경) | 스포츠 의상 |
| hoodie.png | assets/customization/ | 150x150px | PNG (투명 배경) | 후드 의상 |

#### 모자 (5종)

| 파일명 | 경로 | 크기 | 포맷 | 설명 |
|-------|-----|------|-----|------|
| none_hat.png | assets/customization/ | 80x60px | PNG (투명 배경) | 없음 (빈 파일) |
| cap.png | assets/customization/ | 80x60px | PNG (투명 배경) | 야구 모자 |
| beanie.png | assets/customization/ | 80x60px | PNG (투명 배경) | 비니 모자 |
| graduation.png | assets/customization/ | 80x60px | PNG (투명 배경) | 졸업 모자 |
| sunglasses.png | assets/customization/ | 80x60px | PNG (투명 배경) | 선글라스 |

#### 신발 (5종)

| 파일명 | 경로 | 크기 | 포맷 | 설명 |
|-------|-----|------|-----|------|
| default_shoes.png | assets/customization/ | 60x40px | PNG (투명 배경) | 기본 신발 (빈 파일) |
| sneakers.png | assets/customization/ | 60x40px | PNG (투명 배경) | 운동화 |
| boots.png | assets/customization/ | 60x40px | PNG (투명 배경) | 부츠 |
| sandals.png | assets/customization/ | 60x40px | PNG (투명 배경) | 샌들 |
| dress.png | assets/customization/ | 60x40px | PNG (투명 배경) | 구두 |

### 3. 게임 오브젝트

#### 장애물 (4종)

| 파일명 | 경로 | 크기 | 포맷 | 설명 |
|-------|-----|------|-----|------|
| f_grade.png | assets/obstacles/ | 100x100px | PNG (투명 배경) | F 학점 장애물 |
| folder.png | assets/obstacles/ | 100x100px | PNG (투명 배경) | 폴더 장애물 |
| program.png | assets/obstacles/ | 100x100px | PNG (투명 배경) | 프로그램 장애물 |
| door.png | assets/obstacles/ | 100x100px | PNG (투명 배경) | 문 장애물 |

#### 아이템 (2종)

| 파일명 | 경로 | 크기 | 포맷 | 설명 |
|-------|-----|------|-----|------|
| a_plus.png | assets/items/ | 80x80px | PNG (투명 배경) | A+ 점수 아이템 |
| coin.png | assets/items/ | 80x80px | PNG (투명 배경) | 코인 아이템 |

#### 특수 캐릭터

| 파일명 | 경로 | 크기 | 포맷 | 설명 |
|-------|-----|------|-----|------|
| professor.png | assets/character/ | 180x200px | PNG (투명 배경) | 교수님 캐릭터 |

### 4. 배경 이미지

#### 스테이지 배경 (6종)

| 파일명 | 경로 | 크기 | 포맷 | 설명 |
|-------|-----|------|-----|------|
| stage1_liberal.jpg | assets/backgrounds/ | 1600x900px | JPG | 1단계: 교양관 배경 |
| stage2_myungsu.jpg | assets/backgrounds/ | 1600x900px | JPG | 2단계: 명수당 배경 |
| stage3_engineering.jpg | assets/backgrounds/ | 1600x900px | JPG | 3단계: 공대 배경 |
| stage4_baekyeon.jpg | assets/backgrounds/ | 1600x900px | JPG | 4단계: 백년관 배경 |
| stage5_dorm.jpg | assets/backgrounds/ | 1600x900px | JPG | 5단계: 기숙사 배경 |
| stage6_gate.jpg | assets/backgrounds/ | 1600x900px | JPG | 6단계: 정문 배경 |

#### 페이지 배경 (4종)

| 파일명 | 경로 | 크기 | 포맷 | 설명 |
|-------|-----|------|-----|------|
| main_bg.jpg | assets/backgrounds/ | 1600x900px | JPG | 메인 페이지 배경 |
| customize_bg.jpg | assets/backgrounds/ | 1600x900px | JPG | 커스터마이징 페이지 배경 |
| leaderboard_bg.jpg | assets/backgrounds/ | 1600x900px | JPG | 리더보드 페이지 배경 |
| presentation_bg.jpg | assets/backgrounds/ | 1920x1080px | JPG | 발표용 와이드 스크린 배경 |

### 5. UI 요소

#### 버튼 및 아이콘

| 파일명 | 경로 | 크기 | 포맷 | 설명 |
|-------|-----|------|-----|------|
| heart.png | assets/ui/ | 40x40px | PNG (투명 배경) | 하트 아이콘 |
| qr_code.png | assets/ui/ | 200x200px | PNG | QR 코드 이미지 |
| school_logo.png | assets/ui/ | 200x200px | PNG (투명 배경) | 학교 로고 |

#### 특수 효과

| 파일명 | 경로 | 크기 | 포맷 | 설명 |
|-------|-----|------|-----|------|
| speech_bubble.png | assets/ui/ | 300x200px | PNG (투명 배경) | 말풍선 UI |
| combo_effect.png | assets/effects/ | 120x60px | PNG (투명 배경) | 콤보 이펙트 |
| stage_clear.png | assets/effects/ | 400x200px | PNG (투명 배경) | 스테이지 클리어 효과 |

## 📝 에셋 제작 가이드라인

1. **일관된 스타일**: 모든 에셋은 동일한 시각적 스타일(픽셀 아트 또는 플랫 디자인 등)로 제작
2. **투명 배경**: 캐릭터, 아이템, 장애물 등은 모두 배경이 투명한 PNG 파일로 제작
3. **최적화**: 용량을 최소화하면서 선명한 이미지 품질 유지
4. **반응형 고려**: 다양한 화면 크기에서 문제없이 표시될 수 있도록 제작

## 👨‍🎨 에셋 미리보기 및 배치

커스터마이징 아이템은 기본 캐릭터 위에 레이어로 배치됩니다:
- 모자: 캐릭터 머리 위에 배치
- 의상: 캐릭터 몸 위에 배치
- 신발: 캐릭터 발 아래 배치

## 🎯 우선 구현 순서

1. 기본 캐릭터 (duck.png)
2. 기본 장애물 및 아이템 (f_grade.png, a_plus.png)
3. 스테이지 배경 (6종)
4. 커스터마이징 아이템 (의상, 모자, 신발)
5. UI 요소 및 특수 효과

## 📋 추가 참고 사항

- 모든 에셋은 이 문서에 기재된 명명 규칙을 준수해야 합니다.
- 배경 이미지는 게임 스타일과 분위기에 맞게 제작하되, 게임 플레이에 방해가 되지 않아야 합니다.
- 캐릭터와 아이템은 선명하고 눈에 잘 띄어야 합니다.
- 모든 이미지는 고해상도로 제작 후 명시된 크기로 다운샘플링하는 것을 권장합니다. 