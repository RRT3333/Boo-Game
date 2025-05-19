/**
 * 게임 코어 모듈
 * 게임의 핵심 클래스와 로직을 담당합니다.
 */

import { createPlayer, updateProfessorAnimation } from './game-entities.js';
import { drawGame, drawCountdown } from './game-renderer.js';
import { updateGamePhysics } from './game-physics.js';
import { updateCanvasSize, showCountdown, updateCountdown, updateScore, updateTimer, updateHealth, setupGameOverScreen, handleGameRestart, updateStageProgress } from './game-ui.js';
import { handleInput, spawnObstacle, spawnItem, startStageTransition, setupEventListeners, startGameTimer } from './game-events.js';
import { initAudio, playSound } from './game-audio.js';
import { saveGameResult, setupNicknameButton } from './game-api.js';

// 게임 클래스
export class Game {
    constructor() {
        // 캔버스 초기화
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 기본 설정
        this.baseWidth = 800;
        this.baseHeight = 600;
        this.isMobile = window.innerWidth <= 800;
        
        // 게임 상태 초기화
        this.score = 0;
        this.health = 3;
        this.timeLeft = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.backgroundX = 0;
        this.elapsedGameTime = 0;
        
        // 장애물 속도 조절
        this.obstacleSpeedMultiplier = 1.0;
        
        // 카운트다운 상태
        this.countdownState = {
            active: true,
            value: 3,
            lastCountdownTime: 0,
            initialized: false
        };
        
        // 스테이지 상태
        this.currentStage = 1;
        this.stageTransitioning = false;
        this.stageTransitionProgress = 0;
        this.stageTransitionSpeed = 2;

        // 게임 속도 및 확률
        this.fSpawnRate = 0.02;  // F 등장 확률
        this.aPlusSpawnRate = 0.03; // A+ 등장 확률
        
        // 교수님 상태
        this.professorShown = false;
        this.professorAnimationActive = false;
        this.professorX = -200;
        this.professorData = {
            isActive: false,
            professorX: -200,
            professorWidth: 200,
            professorHeight: 200,
            animationStart: 0,
            animationDuration: 6000
        };
        
        // 게임 통계
        this.itemsCollected = 0;
        this.obstaclesAvoided = 0;
        this.maxCombo = 0;
        
        // 이미지 로드
        this.loadImages();
        
        // 플레이어 생성
        this.updateCanvasSize();
        this.player = createPlayer(this.isMobile, this.canvas.height);
        
        // 오디오 초기화
        this.sounds = initAudio();
        
        // 게임 객체 배열
        this.obstacles = [];
        this.items = [];

        // 데이터 초기화
        this.customization = this.loadCustomization();

        // 타이머 참조
        this.timer = null;
        this.lastFrameTime = 0;

        // 이벤트 리스너 설정
        this.setupEventListeners();
        
        // 게임 시작
        this.init();
        
        // 오디오 컨텍스트 즉시 활성화 시도
        this.activateAudioContext();
        
        // 전역 참조 저장
        window.gameInstance = this;
    }
    
    // 커스터마이징 데이터 로드
    loadCustomization() {
        const gameAssets = document.getElementById('gameAssets');
        
        // 기본 커스터마이징 데이터
        const defaultCustomization = {
            outfit: 'default',
            hat: 'none',
            shoes: 'default'
        };
        
        // 유효한 커스터마이징 옵션 목록
        const validOptions = {
            outfit: ['default', 'casual', 'formal', 'sporty', 'hoodie'],
            hat: ['none', 'cap', 'beanie', 'graduation', 'sunglasses'],
            shoes: ['default', 'sneakers', 'boots', 'sandals', 'dress']
        };
        
        if (!gameAssets) {
            console.warn('gameAssets 요소를 찾을 수 없습니다. 기본값을 사용합니다.');
            return defaultCustomization;
        }
        
        // 데이터 속성에서 값을 가져오고 유효성 검사
        const validateOption = (type, value) => {
            // 값이 없거나 undefined인 경우 기본값 사용
            if (!value || value === 'undefined' || value === 'null') {
                return defaultCustomization[type];
            }
            
            // 소문자로 정규화하여 비교
            const normalizedValue = value.toLowerCase().trim();
            
            // 유효한 옵션 목록에 있는지 확인
            return validOptions[type].includes(normalizedValue) ? 
                   normalizedValue : defaultCustomization[type];
        };
        
        // 속성 가져오기 및 유효성 검사
        const outfit = validateOption('outfit', gameAssets.getAttribute('data-outfit'));
        const hat = validateOption('hat', gameAssets.getAttribute('data-hat'));
        const shoes = validateOption('shoes', gameAssets.getAttribute('data-shoes'));
        
        console.log(`커스터마이징 로드: outfit=${outfit}, hat=${hat}, shoes=${shoes}`);
        
        return { outfit, hat, shoes };
    }
    
    // 이미지 로드
    loadImages() {
        this.images = {
            aPlus: new Image(),
            fGrade: new Image(),
            professor: new Image(),
            character: new Image(),
            flyingCharacter: new Image(),
            backgrounds: [],
            customization: {
                outfit: new Image(),
                flyingOutfit: new Image(),
                hat: new Image(),
                shoes: new Image()
            }
        };
        
        // 이미지 경로 설정
        this.images.aPlus.src = '/static/assets/items/a_plus.png';
        this.images.fGrade.src = '/static/assets/obstacles/f_grade.png';
        this.images.professor.src = '/static/assets/character/professor.png';
        this.images.character.src = '/static/assets/character/character.png';
        this.images.flyingCharacter.src = '/static/assets/character/flying_character.png';
        
        // 배경 이미지 로드
        const backgroundPaths = [
            '/static/assets/backgrounds/stage1_liberal.jpg',
            '/static/assets/backgrounds/stage2_myungsu.jpg',
            '/static/assets/backgrounds/stage3_engineering.jpg',
            '/static/assets/backgrounds/stage4_baekyeon.jpg',
            '/static/assets/backgrounds/stage5_dorm.jpg',
            '/static/assets/backgrounds/stage6_gate.jpg'
        ];
        
        backgroundPaths.forEach(path => {
            const img = new Image();
            img.src = path;
            this.images.backgrounds.push(img);
        });
    }
    
    // 커스터마이징 이미지 로드
    loadCustomizationImages() {
        // 이미지 로드 에러 핸들러
        const handleImageError = (img, type, value) => {
            img.onerror = () => {
                console.warn(`${type} 이미지 로드 실패: ${value}`);
                // 기본 투명한 이미지 설정
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            };
        };
        
        if (this.customization.outfit && this.customization.outfit !== 'default') {
            // 일반 의상 이미지 로드
            this.images.customization.outfit.src = `/static/assets/customization/${this.customization.outfit}.png`;
            handleImageError(this.images.customization.outfit, 'outfit', this.customization.outfit);
            
            // 날개 편 상태의 의상 이미지 로드
            try {
                this.images.customization.flyingOutfit.src = `/static/assets/customization/flying/flying_${this.customization.outfit}.png`;
                handleImageError(this.images.customization.flyingOutfit, 'flyingOutfit', this.customization.outfit);
            } catch (e) {
                console.warn(`날개 편 의상 이미지 로드 실패: ${e.message}`);
            }
        }
        
        if (this.customization.hat && this.customization.hat !== 'none') {
            this.images.customization.hat.src = `/static/assets/customization/${this.customization.hat}.png`;
            handleImageError(this.images.customization.hat, 'hat', this.customization.hat);
        }
        
        if (this.customization.shoes && this.customization.shoes !== 'default') {
            this.images.customization.shoes.src = `/static/assets/customization/${this.customization.shoes}.png`;
            handleImageError(this.images.customization.shoes, 'shoes', this.customization.shoes);
        }
    }
    
    // 캔버스 크기 업데이트
    updateCanvasSize() {
        const canvasSize = updateCanvasSize(this.canvas, this.player, this.isMobile);
        return canvasSize;
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        setupEventListeners(this);
    }
    
    // 입력 처리
    handleInput() {
        return handleInput(this.player, this.gameOver, this.sounds);
    }
    
    // 게임 초기화
    init() {
        // 상태 초기화
        this.score = 0;
        this.health = 3;
        this.timeLeft = 0;
        this.gameOver = false;
        this.gameStarted = false;
        
        // 카운트다운 상태 완전 초기화
        this.countdownState = {
            active: true,
            value: 3,
            lastCountdownTime: 0,
            initialized: false
        };
        
        // 오디오 활성화 시도
        if (this.sounds && typeof this.sounds.activateAudio === 'function') {
            console.log('게임 초기화: 오디오 활성화 시도');
            this.sounds.activateAudio();
        }
        
        this.obstacles = [];
        this.items = [];
        this.backgroundX = 0;
        this.elapsedGameTime = 0;
        
        // 장애물 속도 승수 초기화
        this.obstacleSpeedMultiplier = 1.0;
        
        // 커스터마이징 이미지 로드
        this.loadCustomizationImages();
        
        // 플레이어 위치 초기화
        const container = this.canvas.parentElement;
        if (this.isMobile) {
            this.player.x = Math.min(container.clientWidth * 0.2, 100);
            this.player.y = container.clientHeight * 0.4;
        } else {
            this.player.x = 100;
            this.player.y = 300;
        }
        
        this.player.velocity = 0;
        this.player.isFlying = false;
        
        // 통계 초기화
        this.itemsCollected = 0;
        this.obstaclesAvoided = 0;
        this.maxCombo = 0;
        
        // 스테이지 초기화
        this.currentStage = 1;
        this.stageTransitioning = false;
        this.stageTransitionProgress = 0;
        
        // 교수님 초기화
        this.professorShown = false;
        this.professorAnimationActive = false;
        this.professorX = -200;
        this.professorData = {
            isActive: false,
            professorX: -200,
            professorWidth: 200,
            professorHeight: 200,
            animationStart: 0,
            animationDuration: 6000
        };
        
        this.fSpawnRate = 0.02;
        this.aPlusSpawnRate = 0.03;
        
        // UI 초기화
        updateHealth(this.health);
        updateScore(this.score);
        updateTimer(this.timeLeft);
        updateStageProgress(this.currentStage, 0);
        
        // 프로그레스바 표시 초기화
        const stageIndicator = document.querySelector('.stage-indicator');
        if (stageIndicator) {
            stageIndicator.style.display = 'flex';
        }
        
        // 모바일 환경 초기화
        if (this.isMobile) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            window.scrollTo(0, 0);
        } else {
            // 데스크톱 환경에서 게임 컨테이너와 캔버스 중앙 정렬
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.style.margin = '0 auto !important';
                gameContainer.style.left = '0 !important';
                gameContainer.style.right = '0 !important';
                
                // 고정 크기 설정
                gameContainer.style.width = '800px';
                gameContainer.style.height = '600px';
                gameContainer.style.maxWidth = '800px';
                gameContainer.style.maxHeight = '600px';
                gameContainer.style.transform = 'none !important';
            }
            
            // 캔버스 스타일 설정
            this.canvas.style.margin = '0 auto !important';
            this.canvas.style.position = 'relative !important';
            this.canvas.style.left = '0 !important';
            this.canvas.style.right = '0 !important';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            
            // 화면 중앙 정렬을 위한 body 스타일
            document.body.style.display = 'flex';
            document.body.style.justifyContent = 'center';
            document.body.style.alignItems = 'center';
        }
        
        // 타이머 정리
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // 게임 루프 시작
        this.lastFrameTime = 0;
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    // 게임 루프
    gameLoop(timestamp) {
        if (this.lastFrameTime === 0) {
            this.lastFrameTime = timestamp;
        }
        
        if (!this.gameOver) {
            if (this.countdownState.active) {
                // 카운트다운 처리
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#87CEEB';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // 카운트다운 UI 표시
                showCountdown(true);
                
                // 카운트다운 업데이트
                const countdownCompleted = updateCountdown(this.countdownState, timestamp);
                if (countdownCompleted) {
                    this.countdownState.active = false;
                    this.gameStarted = true;
                    this.startGameTimer();
                }
                
                // 카운트다운 렌더링
                drawCountdown(this.ctx, this.canvas);
            } else {
                // 카운트다운 UI 숨기기
                showCountdown(false);
                
                // 교수님 애니메이션 업데이트
                if (this.professorData.isActive) {
                    const professorUpdate = updateProfessorAnimation(
                        this.professorData, 
                        this.canvas, 
                        performance.now()
                    );
                    
                    this.professorData = {
                        ...this.professorData,
                        ...professorUpdate
                    };
                    
                    if (professorUpdate.fSpawnRateIncrease) {
                        // 교수님 사라진 후에도 60초까지는 F 확률 5% 유지
                        if (this.timeLeft > 60) {
                            this.fSpawnRate = 0.03;
                        } else {
                            this.fSpawnRate = 0.05;
                        }
                    }
                }
                
                // 게임 상태 업데이트
                const gameState = {
                    canvas: this.canvas,
                    isMobile: this.isMobile,
                    player: this.player,
                    obstacles: this.obstacles,
                    items: this.items,
                    backgroundX: this.backgroundX,
                    currentStage: this.currentStage,
                    stageTransitioning: this.stageTransitioning,
                    stageTransitionProgress: this.stageTransitionProgress,
                    stageTransitionSpeed: this.stageTransitionSpeed,
                    fSpawnRate: this.fSpawnRate,
                    aPlusSpawnRate: this.aPlusSpawnRate
                };
                
                // 물리 업데이트
                const isGameOver = updateGamePhysics(gameState, {
                    onObstacleCollision: () => {
                        this.health--;
                        updateHealth(this.health);
                        
                        if (this.health <= 0) {
                            this.endGame();
                        }
                    },
                    onItemCollected: (item) => {
                        if (item.type === 'A+') {
                            this.score += 100;
                            playSound(this.sounds, 'aplus');
                        } else {
                            this.score += 50;
                            playSound(this.sounds, 'coin');
                        }
                        this.itemsCollected++;
                        updateScore(this.score);
                    },
                    onStageChanged: (newStage) => {
                        this.currentStage = newStage;
                        updateStageProgress(this.currentStage, 0);
                    },
                    onGameOver: () => {
                        this.endGame();
                    }
                });
                
                // 스테이지 UI 업데이트 추가
                updateStageProgress(this.currentStage, this.stageTransitionProgress);
                
                // 게임 상태 업데이트
                this.obstacles = gameState.obstacles;
                this.items = gameState.items;
                this.backgroundX = gameState.backgroundX;
                this.stageTransitioning = gameState.stageTransitioning;
                this.stageTransitionProgress = gameState.stageTransitionProgress;
                
                if (!isGameOver) {
                    // 새 장애물과 아이템 생성
                    spawnObstacle(this);
                    spawnItem(this);
                    
                    // 게임 렌더링
                    const renderState = {
                        canvas: this.canvas,
                        isMobile: this.isMobile,
                        player: this.player,
                        customization: this.customization,
                        obstacles: this.obstacles,
                        items: this.items,
                        backgroundX: this.backgroundX,
                        currentStage: this.currentStage,
                        stageTransitioning: this.stageTransitioning,
                        stageTransitionProgress: this.stageTransitionProgress,
                        professorData: this.professorData
                    };
                    
                    drawGame(this.ctx, renderState, this.images);
                }
            }
            
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
        
        this.lastFrameTime = timestamp;
    }
    
    // 게임 타이머 시작
    startGameTimer() {
        this.timer = startGameTimer(this, {
            onTimerTick: (timeLeft) => {
                updateTimer(timeLeft);
                this.timeLeft = timeLeft;
                
                // 시간에 따라 장애물 속도 선형적으로 증가
                if (timeLeft <= 60) {
                    // 1초부터 60초까지 1.0에서 2.0배로 선형 증가
                    this.obstacleSpeedMultiplier = 1.0 + (timeLeft / 60);
                } else {
                    // 60초 이후에는 2.0에서 5.0배로 가파르게 증가
                    const additionalTime = timeLeft - 60;
                    // 40초 동안 5.0배까지 증가 (100초에 도달)
                    this.obstacleSpeedMultiplier = 2.0 + (Math.min(additionalTime, 40) / 40 * 3.0);
                }
                
                // 60초 이후 F 등장 확률 조정
                if (timeLeft > 60) {
                    this.fSpawnRate = 0.03; // 60초 이후 F 확률 3%로 감소
                    
                    // 프로그레스바 숨기기
                    const stageIndicator = document.querySelector('.stage-indicator');
                    if (stageIndicator) {
                        stageIndicator.style.display = 'none';
                    }
                }
            },
            onProfessorAppear: () => {
                this.professorData = {
                    isActive: true,
                    professorX: -200,
                    professorWidth: this.isMobile ? 
                        Math.min(180, this.canvas.width * 0.35) : 200,
                    professorHeight: this.isMobile ? 
                        Math.min(180, this.canvas.height * 0.35) : 200,
                    animationStart: performance.now(),
                    animationDuration: 6000
                };
                this.fSpawnRate = 0.05; // 교수님 등장과 동시에 F 확률 5%로 증가
            },
            onStageTransition: () => {
                startStageTransition(this);
            },
            onGameOver: () => {
                this.endGame();
            }
        });
    }
    
    // 게임 종료
    endGame() {
        this.gameOver = true;
        
        // 게임오버 사운드 재생
        playSound(this.sounds, 'gameover');
        
        // 타이머 정리
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        // 게임 상태 준비
        const gameState = {
            score: this.score,
            timeLeft: this.timeLeft,
            currentStage: this.currentStage,
            itemsCollected: this.itemsCollected || 0,
            obstaclesAvoided: this.obstaclesAvoided || 0,
            maxCombo: this.maxCombo || 0
        };
        
        // 게임오버 화면 설정
        setupGameOverScreen({
            canvas: this.canvas,
            isMobile: this.isMobile,
            score: this.score,
            timeLeft: this.timeLeft,
            currentStage: this.currentStage
        });
        
        // 닉네임 입력 필드에서 플레이스홀더(이전 닉네임) 가져오기
        const nicknameInput = document.getElementById('gameOverNickname');
        const previousNickname = nicknameInput ? nicknameInput.placeholder : '익명의 학생';
        
        // 게임 결과 저장 (이전 닉네임 사용)
        saveGameResult(gameState, previousNickname);
        
        // 닉네임 저장 버튼 설정
        setupNicknameButton(this.sounds, window.PLAYER_ID);
    }
    
    // 게임 재시작
    restart() {
        console.log('재시작 메서드 호출됨 - 페이지 리로드 방식으로 변경');
        
        // 모바일 기기에서는 위치 새로고침을 사용하여 더 안정적으로 재시작
        window.location.reload();
        
        // 아래 코드는 브라우저가 새로고침을 실행하지 않을 경우를 대비한 대체 코드임
        // UI 재설정
        handleGameRestart();
        
        // 중앙 정렬을 위한 강력한 스타일 적용
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
        
        // 카운트다운 요소 초기화
        const countdownElement = document.getElementById('countdownNumber');
        if (countdownElement) {
            countdownElement.textContent = "3";
        }
        
        // 캔버스 다시 표시 및 스타일 설정
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto !important';
        this.canvas.style.position = 'relative !important';
        this.canvas.style.left = '0 !important';
        this.canvas.style.right = '0 !important';
        
        // 게임 컨테이너 스타일 설정 (중앙 정렬 강제)
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.margin = '0 auto !important';
            gameContainer.style.left = '0 !important';
            gameContainer.style.right = '0 !important';
            gameContainer.style.position = 'relative !important';
            gameContainer.style.transform = 'none !important';
            
            // 데스크톱 환경일 경우 고정 크기 설정
            if (!this.isMobile) {
                gameContainer.style.width = this.baseWidth + 'px';
                gameContainer.style.height = this.baseHeight + 'px';
                gameContainer.style.maxWidth = this.baseWidth + 'px';
                gameContainer.style.maxHeight = this.baseHeight + 'px';
            }
        }
        
        // 게임 초기화
        this.init();
        
        // 캔버스 크기 업데이트
        this.updateCanvasSize();
        
        // 게임 화면 강제 재정렬 (시간차를 두고 여러번 적용)
        setTimeout(() => {
            if (gameContainer) {
                gameContainer.style.margin = '0 auto !important';
                gameContainer.style.left = '0 !important';
                gameContainer.style.right = '0 !important';
            }
            this.canvas.style.margin = '0 auto !important';
            this.canvas.style.position = 'relative !important';
            this.canvas.style.left = '0 !important';
        }, 50);
        
        setTimeout(() => {
            if (gameContainer) {
                gameContainer.style.margin = '0 auto !important';
                gameContainer.style.left = '0 !important';
                gameContainer.style.right = '0 !important';
            }
            this.canvas.style.margin = '0 auto !important';
            this.canvas.style.position = 'relative !important';
            this.canvas.style.left = '0 !important';
            
            // 화면을 강제로 다시 그리기
            window.dispatchEvent(new Event('resize'));
        }, 200);
    }
    
    // 오디오 컨텍스트 활성화
    activateAudioContext() {
        try {
            // 무음 오디오를 재생하여 오디오 컨텍스트 활성화 시도
            const silentAudio = new Audio();
            silentAudio.volume = 0.01;
            silentAudio.play().catch(() => {
                console.log('첫 오디오 재생 시도 실패: 사용자 상호작용 필요');
                
                // 사용자가 키보드를 누르면 즉시 오디오 활성화
                const keyHandler = () => {
                    const audio = new Audio();
                    audio.volume = 0.01;
                    audio.play().catch(() => {});
                    document.removeEventListener('keydown', keyHandler);
                };
                document.addEventListener('keydown', keyHandler, { once: true });
            });
        } catch (e) {
            console.warn('오디오 컨텍스트 활성화 실패:', e);
        }
    }
} 