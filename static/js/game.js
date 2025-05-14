class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.baseWidth = 800;  // 기준이 되는 게임 너비
        this.baseHeight = 600; // 기준이 되는 게임 높이
        
        // 모바일 환경 감지
        this.isMobile = window.innerWidth <= 800;
        
        // 캔버스 비율 유지하면서 화면에 맞추기
        this.updateCanvasSize();
        
        // 게임 설정 - 모바일/데스크톱 구분 없이 동일하게 설정
        this.fSpawnRate = 0.04;  // F 등장 확률 (4%)
        this.aPlusSpawnRate = 0.03; // A+ 등장 확률 (3%)
        this.jumpForce = -10;  // 점프력
        this.gravity = 0.5;    // 중력

        // Game state
        this.score = 0;
        this.health = 3;
        this.timeLeft = 60;
        this.gameOver = false;
        this.gameStarted = false;
        this.countdownValue = 3;
        this.isCountingDown = true;
        this.timer = null;  // 타이머 참조 추가
        this.elapsedGameTime = 0;  // 게임 시작 후 경과 시간
        
        // 스테이지 관련 변수
        this.currentStage = 1;
        this.stageTransitioning = false;
        this.stageTransitionProgress = 0; // 0-100% 전환 진행도
        this.stageTransitionSpeed = 2; // 전환 속도

        // 커스터마이징 데이터 가져오기
        const gameAssets = document.getElementById('gameAssets');
        this.customization = {
            outfit: gameAssets ? gameAssets.getAttribute('data-outfit') || 'default' : 'default',
            hat: gameAssets ? gameAssets.getAttribute('data-hat') || 'none' : 'none',
            shoes: gameAssets ? gameAssets.getAttribute('data-shoes') || 'default' : 'default'
        };

        // 프로페서 애니메이션 관련 변수
        this.professorShown = false;
        this.professorAnimationActive = false;
        this.professorX = -200; // 화면 밖에서 시작
        this.professorAnimationStart = 0;
        this.professorAnimationDuration = 6000; // 총 6초 (등장 2초, 머무름 2초, 퇴장 2초)
        
        // 게임 통계
        this.itemsCollected = 0;
        this.obstaclesAvoided = 0;
        this.maxCombo = 0;
        
        // 이미지 로드
        this.images = {
            aPlus: new Image(),
            fGrade: new Image(),
            professor: new Image(),
            character: new Image(),
            flyingCharacter: new Image(),
            backgrounds: [],
            // 커스터마이징 이미지
            customization: {
                outfit: new Image(),
                flyingOutfit: new Image(), // 날개 편 상태의 의상
                hat: new Image(),
                shoes: new Image()
            }
        };
        this.images.aPlus.src = '/static/assets/items/a_plus.png';
        this.images.fGrade.src = '/static/assets/obstacles/f_grade.png';
        this.images.professor.src = '/static/assets/character/professor.png';
        this.images.character.src = '/static/assets/character/character.png';
        this.images.flyingCharacter.src = '/static/assets/character/flying_character.png';
        
        // 커스터마이징 이미지 로드
        if (this.customization.outfit !== 'default') {
            // 일반 의상 이미지 로드
            this.images.customization.outfit.src = `/static/assets/customization/${this.customization.outfit}.png`;
            
            // 날개 편 상태의 의상 이미지 로드 (flying 폴더 내에 있음)
            this.images.customization.flyingOutfit.src = `/static/assets/customization/flying/flying_${this.customization.outfit}.png`;
        }
        if (this.customization.hat !== 'none') {
            this.images.customization.hat.src = `/static/assets/customization/${this.customization.hat}.png`;
        }
        if (this.customization.shoes !== 'default') {
            this.images.customization.shoes.src = `/static/assets/customization/${this.customization.shoes}.png`;
        }
        
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
        
        // 사운드 효과 로드
        this.sounds = {
            jump: new Audio('/static/assets/sounds/jump.mp3'),
            coin: new Audio('/static/assets/sounds/coin.mp3'),
            aplus: new Audio('/static/assets/sounds/aplus.mp3'),
            gameover: new Audio('/static/assets/sounds/gameover.mp3'),
            save: new Audio('/static/assets/sounds/save.mp3'),
            button: new Audio('/static/assets/sounds/button.mp3')
        };
        
        // 음량 설정
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.5;
        });

        // Player (Boo)
        this.player = {
            x: this.isMobile ? 80 : 100, // 모바일에서는 왼쪽에 더 가깝게
            y: this.isMobile ? this.canvas.height * 0.4 : 300, // 모바일에서는 화면 상단 40% 위치
            width: 70,
            height: 70,
            velocity: 0,
            gravity: 0.5, // 모든 환경에서 동일한 중력 적용
            jumpForce: -10, // 모든 환경에서 동일한 점프력 적용
            isFlying: false
        };

        // Game objects
        this.obstacles = [];
        this.items = [];
        this.backgroundX = 0;

        // Event listeners
        document.addEventListener('keydown', (e) => this.handleInput(e));
        document.addEventListener('click', () => this.handleInput());
        
        // 모든 다시 시작 버튼에 이벤트 추가
        document.getElementById('restartButton').addEventListener('click', () => this.restart());
        const clearRestartButton = document.getElementById('clearRestartButton');
        if (clearRestartButton) {
            clearRestartButton.addEventListener('click', () => this.restart());
        }
        
        // 모바일에서 터치 이벤트 추가
        if (this.isMobile) {
            this.canvas.addEventListener('touchstart', (e) => {
                e.preventDefault(); // 기본 동작 방지
                this.handleInput();
            }, { passive: false });
            
            // 화면 방향 변경 리스너
            window.addEventListener('resize', () => this.updateCanvasSize());
            window.addEventListener('orientationchange', () => {
                // 방향 변경 후 약간의 지연을 두고 크기 조정 (iOS 해결책)
                setTimeout(() => {
                    this.updateCanvasSize();
                    // 게임 오버 상태일 경우 레이아웃 업데이트
                    if (this.gameOver) {
                        this.setupGameOverLayout();
                    }
                }, 300);
            });
            
            // 초기 화면 방향 확인
            const isLandscape = window.innerWidth > window.innerHeight;
            const orientationMsg = document.getElementById('orientationMessage');
            if (orientationMsg) {
                orientationMsg.style.display = isLandscape ? 'none' : 'flex';
            }
        }

        // 캔버스 고정 크기 (모바일이 아닐 때만 기본 크기 적용)
        if (!this.isMobile) {
            this.canvas.width = this.baseWidth;
            this.canvas.height = this.baseHeight;
        }

        // Start game loop
        this.lastTime = 0;
        this.lastCountdownTime = 0;
        this.init();

        // 전역 참조 저장 (HTML 스크립트에서 접근 가능하도록)
        window.gameInstance = this;
    }
    
    // 캔버스 크기 업데이트 (모바일 대응 - 세로 화면 최적화)
    updateCanvasSize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        if (this.isMobile) {
            // 모바일에서는 컨테이너에 맞추기 (세로 모드 최적화)
            this.canvas.width = containerWidth;
            this.canvas.height = containerHeight;
            
            // 방향 관련 안내 메시지 제거
            const orientationMsg = document.getElementById('orientationMessage');
            if (orientationMsg) {
                orientationMsg.style.display = 'none';
            }
            
            // 게임 요소 비율 조정
            if (this.player) {
                // 세로 모드에서의 플레이어 위치 조정
                const newPlayerY = Math.min(
                    this.player.y,
                    containerHeight - this.player.height - 10
                );
                this.player.y = newPlayerY;
                
                // 플레이어 위치 조정 (가로 방향 - x축)
                this.player.x = Math.min(containerWidth * 0.2, 100);
            }
        } else {
            // 데스크톱에서는 고정 크기 유지
            this.canvas.width = this.baseWidth;
            this.canvas.height = this.baseHeight;
        }
    }

    handleInput(e) {
        if (e && (e.code === 'Space' || e.type === 'touchstart') || !e) {
            if (!this.gameOver) {
                this.player.velocity = this.player.jumpForce;
                this.player.isFlying = true; // 점프 시 날개 편 상태로 변경
                
                // 점프 사운드 재생
                this.playSound('jump');
            }
        }
    }

    init() {
        // Reset game state
        this.score = 0;
        this.health = 3;
        this.timeLeft = 60;
        this.gameOver = false;
        this.gameStarted = false;
        this.countdownValue = 3;
        this.isCountingDown = true;
        this.obstacles = [];
        this.items = [];
        this.backgroundX = 0;
        
        // 플레이어 위치 초기화 (세로 모드 최적화)
        const container = this.canvas.parentElement;
        if (this.isMobile) {
            // 세로 모드에서는 플레이어를 화면 좌측 중간에 위치
            this.player.x = Math.min(container.clientWidth * 0.2, 100);
            this.player.y = container.clientHeight * 0.4; // 화면 상단에서 40% 위치
        } else {
            // 데스크톱에서는 기존 위치 유지
            this.player.x = 100;
            this.player.y = 300;
        }
        
        this.player.velocity = 0;
        this.player.isFlying = false; // 초기 상태는 날개 접은 상태
        this.lastCountdownTime = 0;
        this.elapsedGameTime = 0;  // 게임 경과 시간 초기화
        
        // 게임 통계 초기화
        this.itemsCollected = 0;
        this.obstaclesAvoided = 0;
        this.maxCombo = 0;
        
        // 스테이지 초기화
        this.currentStage = 1;
        this.stageTransitioning = false;
        this.stageTransitionProgress = 0;
        
        // 프로페서 애니메이션 초기화
        this.professorShown = false;
        this.professorAnimationActive = false;
        this.professorX = -200;
        this.fSpawnRate = 0.04; // F 등장 확률 초기화 (4%)
        this.aPlusSpawnRate = 0.03; // A+ 등장 확률 초기화

        // UI 초기화
        document.querySelectorAll('.heart').forEach(heart => heart.style.opacity = '1');
        document.getElementById('score').textContent = '0';
        document.getElementById('gameTimer').textContent = this.timeLeft;
        
        // 화면 & 스크롤 초기화 (특히 모바일에서 중요)
        if (this.isMobile) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            window.scrollTo(0, 0);
        }

        // Clear existing timer if any
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Start game loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    handleCountdown(timestamp) {
        if (!this.lastCountdownTime) {
            this.lastCountdownTime = timestamp;
            return;
        }

        const deltaTime = timestamp - this.lastCountdownTime;

        if (deltaTime >= 1000) {
            this.countdownValue--;
            this.lastCountdownTime = timestamp;

            if (this.countdownValue < 0) {
                this.isCountingDown = false;
                this.gameStarted = true;
                
                // Start timer only if not already running
                if (!this.timer) {
                    this.timer = setInterval(() => {
                        if (this.timeLeft > 0) {
                            this.timeLeft--;
                            this.elapsedGameTime++; // 게임 경과 시간 증가
                            document.getElementById('gameTimer').textContent = this.timeLeft;
                            
                            // 게임 시작 후 20초에 교수님 등장
                            if (this.elapsedGameTime === 20 && !this.professorShown) {
                                this.professorShown = true;
                                this.professorAnimationActive = true;
                                this.professorAnimationStart = performance.now();
                                
                                // WARNING 표시
                                const warningEl = document.createElement('div');
                                warningEl.className = 'game-warning';
                                warningEl.textContent = 'WARNING!';
                                
                                // 모바일에서는 크기 조정 - 더 잘 보이게
                                if (this.isMobile) {
                                    warningEl.style.fontSize = '40px';
                                    warningEl.style.padding = '15px 25px';
                                    warningEl.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                                    warningEl.style.border = '3px solid red';
                                    warningEl.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.7)';
                                }
                                
                                document.querySelector('.game-container').appendChild(warningEl);
                                
                                // 3초 후 WARNING 제거
                                setTimeout(() => {
                                    if (warningEl.parentNode) {
                                        warningEl.parentNode.removeChild(warningEl);
                                    }
                                }, 3000);
                            }
                            
                            // 스테이지 전환 확인 (10초마다)
                            if (this.elapsedGameTime % 10 === 0 && this.elapsedGameTime > 0 && this.elapsedGameTime <= 50) {
                                // 5번만 전환 (6단계까지)
                                if (this.currentStage < 6) {
                                    this.startStageTransition();
                                }
                            }
                            
                            if (this.timeLeft === 0) {
                                this.endGame();
                            }
                        }
                    }, 1000);
                }
            }
        }
    }

    drawCountdown() {
        // 항상 clearRect와 배경 그리기 (gameLoop에서 이미 했지만, 안전하게 중복 호출)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 카운트다운 값을 DOM에만 표시하고 캔버스에는 그리지 않음
        const countdownElement = document.getElementById('countdownNumber');
        if (countdownElement) {
            if (this.countdownValue >= 0) {
                countdownElement.textContent = this.countdownValue;
            } else {
                countdownElement.textContent = 'GO!';
            }
        }
    }

    spawnObstacle() {
        if (Math.random() < this.fSpawnRate) {  // 변수로 관리하는 F 등장 확률 사용
            // 세로 모드에서는 화면 오른쪽 전체에서 생성
            const yPos = this.isMobile ? 
                Math.random() * (this.canvas.height - 60) : // 모바일(세로)
                Math.random() * (this.canvas.height - 40);  // 데스크톱(가로)
            
            this.obstacles.push({
                x: this.canvas.width,
                y: yPos,
                width: this.isMobile ? 40 : 40, // 크기 유지
                height: this.isMobile ? 40 : 40,
                type: 'F'
            });
        }
    }

    spawnItem() {
        if (Math.random() < this.aPlusSpawnRate) {  // A+ 등장 확률 변수 사용
            // 세로 모드에서는 화면 오른쪽 전체에서 생성
            const yPos = this.isMobile ? 
                Math.random() * (this.canvas.height - 50) : // 모바일(세로)
                Math.random() * (this.canvas.height - 30);  // 데스크톱(가로)
            
            this.items.push({
                x: this.canvas.width,
                y: yPos,
                width: this.isMobile ? 30 : 30, // 크기 유지
                height: this.isMobile ? 30 : 30,
                type: 'A+'
            });
        }
    }

    updateGame() {
        // Update player
        this.player.velocity += this.player.gravity;
        this.player.y += this.player.velocity;
        
        // 캐릭터 상태 업데이트 (상승 중이면 날개 편 상태, 하강 중이면 기본 상태)
        this.player.isFlying = this.player.velocity < 0;

        // Keep player in bounds
        if (this.player.y > this.canvas.height - this.player.height) {
            this.endGame();
            return;
        }
        if (this.player.y < 0) {
            this.player.y = 0;
            this.player.velocity = 0;
            this.player.isFlying = false; // 천장에 닿으면 날개 접기
        }

        // Update background - 리셋하지 않고 계속 감소하도록 변경
        this.backgroundX -= 2;
        // 리셋 코드 제거 (backgroundX가 계속 감소하도록 둡니다)

        // 스테이지 전환 업데이트
        this.updateStageTransition();

        // 모바일(세로)에서의 이동 속도 조정
        const obstacleSpeed = this.isMobile ? 6 : 5;
        const itemSpeed = this.isMobile ? 4 : 3;

        // Update obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= obstacleSpeed;  // 세로 모드에서는 더 빠르게 이동
            if (this.checkCollision(this.player, obstacle)) {
                this.health--;
                document.querySelectorAll('.heart')[this.health].style.opacity = '0.2';
                if (this.health === 1) {
                    document.querySelector('.hud').insertAdjacentHTML('beforeend', 
                        '<div class="warning">학사경고!</div>');
                }
                if (this.health <= 0) {
                    this.endGame();
                }
                return false;
            }
            return obstacle.x > -obstacle.width;
        });

        // Update items
        this.items = this.items.filter(item => {
            item.x -= itemSpeed;  // 세로 모드에서는 더 빠르게 이동
            if (this.checkCollision(this.player, item)) {
                if (item.type === 'A+') {
                    this.score += 100;
                    this.playSound('aplus');
                } else {
                    this.score += 50;
                    this.playSound('coin');
                }
                document.getElementById('score').textContent = this.score;
                return false;
            }
            return item.x > -item.width;
        });

        // Spawn new objects
        this.spawnObstacle();
        this.spawnItem();
        
        // 교수님 애니메이션 업데이트
        if (this.professorAnimationActive) {
            this.updateProfessorAnimation();
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect2.height > rect2.y;
    }

    drawGame() {
        // 항상 clearRect와 배경 그리기
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 배경 그리기 (스테이지에 따라 다른 배경)
        this.drawBackground();

        // Draw player (Boo) - 이미지로 교체 (상태에 따라 다른 이미지 사용)
        const characterImg = this.player.isFlying ? this.images.flyingCharacter : this.images.character;
        this.ctx.drawImage(
            characterImg,
            this.player.x, 
            this.player.y, 
            this.player.width, 
            this.player.height
        );
        
        // 커스터마이징 아이템 그리기
        // 의상 그리기 - 날고 있는지 여부에 따라 다른 의상 적용
        if (this.customization.outfit !== 'default') {
            // 날고 있는 상태인지에 따라 다른 의상 이미지 사용
            const outfitImg = this.player.isFlying && this.images.customization.flyingOutfit.complete ? 
                            this.images.customization.flyingOutfit : 
                            this.images.customization.outfit;
            
            if (outfitImg.complete) {
                this.ctx.drawImage(
                    outfitImg,
                    this.player.x,
                    this.player.y,
                    this.player.width,
                    this.player.height
                );
            }
        }
        
        // 모자 그리기
        if (this.customization.hat !== 'none' && this.images.customization.hat.complete) {
            // 비니 모자일 경우 2픽셀 더 내림
            const hatYOffset = this.customization.hat === 'beanie' ? 4 : 2;
            
            this.ctx.drawImage(
                this.images.customization.hat,
                this.player.x,
                this.player.y + hatYOffset, // 모자별 위치 조정
                this.player.width,
                42 // 모자 높이 조정 (비율 유지)
            );
        }
        
        // 신발 그리기
        if (this.customization.shoes !== 'default' && this.images.customization.shoes.complete) {
            this.ctx.drawImage(
                this.images.customization.shoes,
                this.player.x,
                this.player.y + this.player.height - 21, // 발 위치에 맞춤 (비율 유지)
                this.player.width,
                21 // 신발 높이 조정 (비율 유지)
            );
        }

        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'F') {
                this.ctx.drawImage(
                    this.images.fGrade,
                    obstacle.x, 
                    obstacle.y, 
                    obstacle.width, 
                    obstacle.height
                );
            } else {
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                if (typeof obstacle.type === 'string' && obstacle.type) {
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.font = '20px Arial';
                    this.ctx.fillText(obstacle.type, 
                        obstacle.x + 15, 
                        obstacle.y + 25);
                }
            }
        });

        // Draw items
        this.items.forEach(item => {
            if (item.type === 'A+') {
                this.ctx.drawImage(
                    this.images.aPlus,
                    item.x, 
                    item.y, 
                    item.width, 
                    item.height
                );
            } else {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fillRect(item.x, item.y, item.width, item.height);
                if (typeof item.type === 'string' && item.type) {
                    this.ctx.fillStyle = '#FFFFFF';
                    this.ctx.font = '16px Arial';
                    this.ctx.fillText(item.type, 
                        item.x + 5, 
                        item.y + 20);
                }
            }
        });
        
        // 교수님 애니메이션 그리기
        if (this.professorAnimationActive) {
            // 교수님 이미지 그리기 (모바일에서는 크기 조정하여 더 크게)
            let professorWidth = this.isMobile ? Math.min(180, this.canvas.width * 0.35) : 200;
            let professorHeight = this.isMobile ? Math.min(180, this.canvas.height * 0.35) : 200;
            
            // 화면 높이에 따라 교수님 위치 조정 (모바일에서 잘리지 않도록)
            const bottomMargin = this.isMobile ? 20 : 20;
            const professorY = this.canvas.height - professorHeight - bottomMargin;
            
            this.ctx.drawImage(
                this.images.professor,
                this.professorX, 
                professorY, 
                professorWidth, 
                professorHeight
            );
            
            // 말풍선 크기 및 위치 계산 (모바일에서는 크기 조정)
            const bubbleWidth = this.isMobile ? Math.min(220, this.canvas.width * 0.5) : 250;
            const bubbleHeight = this.isMobile ? 50 : 50;
            const bubbleMargin = this.isMobile ? 50 : 70;
            const bubbleX = this.professorX + professorWidth - 30;
            const bubbleY = professorY - bubbleMargin;
            
            // 말풍선이 화면 밖으로 나가지 않도록 조정
            const adjustedBubbleX = Math.min(bubbleX, this.canvas.width - bubbleWidth - 10);
            
            // 말풍선 그리기
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'; // 더 불투명하게
            this.ctx.beginPath();
            this.ctx.roundRect(adjustedBubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);
            this.ctx.fill();
            
            // 말풍선 테두리 추가 (모바일에서 더 잘 보이게)
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // 세모 말풍선 꼬리
            this.ctx.beginPath();
            this.ctx.moveTo(this.professorX + professorWidth - 20, professorY - 5);
            this.ctx.lineTo(this.professorX + professorWidth - 50, professorY - 25);
            this.ctx.lineTo(this.professorX + professorWidth - 10, professorY - 25);
            this.ctx.closePath();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            this.ctx.fill();
            this.ctx.stroke();
            
            // 텍스트 크기 조정 - 모바일에서 더 크게
            const fontSize = this.isMobile ? 16 : 16;
            
            // 텍스트 그리기
            this.ctx.fillStyle = 'black';
            this.ctx.font = `bold ${fontSize}px Arial`;
            
            // 텍스트가 말풍선 안에 들어가도록 위치 조정
            const textX = adjustedBubbleX + 10;
            const textY = bubbleY + bubbleHeight/2 + fontSize/3;
            
            this.ctx.fillText("자네 대학원 올 생각 없나?", textX, textY);
        }
    }

    gameLoop(timestamp) {
        if (this.lastTime === 0) {
            this.lastTime = timestamp;
        }

        if (!this.gameOver) {
            if (this.isCountingDown) {
                // 카운트다운만 그림
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#87CEEB';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                this.handleCountdown(timestamp);
                this.drawCountdown();
                
                // 카운트다운 DOM 요소 표시
                const countdownDiv = document.getElementById('countdown');
                if (countdownDiv) {
                    countdownDiv.classList.add('show');
                }
            } else {
                // 카운트다운 종료 시 DOM 요소 숨김
                const countdownDiv = document.getElementById('countdown');
                if (countdownDiv) {
                    countdownDiv.classList.remove('show');
                }
                
                this.updateGame();
                this.drawGame();
            }
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        }
        this.lastTime = timestamp;
    }

    endGame() {
        this.gameOver = true;
        
        // 게임오버 사운드 재생
        this.playSound('gameover');
        
        // Clear the timer
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // 게임 결과 업데이트
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalTime').textContent = (60 - this.timeLeft) || 0;
        document.getElementById('finalStage').textContent = `스테이지 ${this.currentStage}`;
        
        // 모바일에서는 방향 안내 메시지 숨기기
        const orientationMsg = document.getElementById('orientationMessage');
        if (orientationMsg) {
            orientationMsg.style.display = 'none';
        }
        
        // 모바일에서는 body 스크롤 허용
        if (this.isMobile) {
            document.body.style.overflow = 'auto';
            document.body.style.position = 'static';
            
            // 게임 캔버스 숨기기
            this.canvas.style.display = 'none';
        }
        
        // 게임오버 화면 표시
        const gameOverElement = document.querySelector('.game-over');
        gameOverElement.classList.remove('hidden');
        
        // 모바일 화면 레이아웃 처리
        this.setupGameOverLayout();
        
        // 게임오버 화면이 보이도록 스크롤
        setTimeout(() => {
            gameOverElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        // 닉네임 입력 필드에 포커스 (모바일 외에서만)
        if (!this.isMobile) {
            const nicknameInput = document.getElementById('gameOverNickname');
            if (nicknameInput) {
                setTimeout(() => {
                    try {
                        nicknameInput.focus();
                    } catch (e) {
                        console.log('닉네임 입력창 포커스 실패:', e);
                    }
                }, 500);
            }
        }
        
        // 게임 결과 저장 (익명)
        this.saveGameResult('익명의 학생');

        // 이름 저장 버튼 이벤트 등록
        const saveBtn = document.getElementById('saveNicknameBtn');
        if (saveBtn) {
            saveBtn.onclick = () => {
                const nickname = document.getElementById('gameOverNickname').value.trim() || '익명의 학생';
                
                // 버튼 애니메이션
                saveBtn.classList.add('active');
                
                // 저장 사운드 재생
                this.playSound('save');
                
                // 새 닉네임으로 결과 업데이트
                this.updateNickname(nickname);
            };
        }
    }
    
    // 게임 결과 저장 함수 (분리)
    saveGameResult(nickname) {
        fetch('/game/api/save-score/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCookie('csrftoken')
            },
            body: JSON.stringify({
                player_id: window.PLAYER_ID,
                score: this.score,
                play_time: this.timeLeft,
                max_stage: this.currentStage,
                items_collected: this.itemsCollected || 0,
                obstacles_avoided: this.obstaclesAvoided || 0,
                max_combo: this.maxCombo || 0,
                nickname: nickname
            })
        }).catch(error => {
            console.error('점수 저장 오류:', error);
        });
    }
    
    // 닉네임 업데이트 함수 (분리)
    updateNickname(nickname) {
        fetch('/game/api/update-nickname/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCookie('csrftoken')
            },
            body: JSON.stringify({
                player_id: window.PLAYER_ID,
                nickname: nickname
            })
        }).then(res => res.json()).then(data => {
            setTimeout(() => {
                const saveBtn = document.getElementById('saveNicknameBtn');
                if (saveBtn) saveBtn.classList.remove('active');
                
                if (data.status === 'success') {
                    // 성공 메시지 표시
                    const hintEl = document.querySelector('.retro-hint');
                    if (hintEl) {
                        hintEl.textContent = '* 이름이 저장되었습니다!';
                        hintEl.style.color = '#00DDFF'; // 청록색으로 변경
                    }
                } else {
                    alert('이름 저장 실패: ' + data.message);
                }
            }, 200);
        }).catch(error => {
            const saveBtn = document.getElementById('saveNicknameBtn');
            if (saveBtn) saveBtn.classList.remove('active');
            console.error('닉네임 업데이트 오류:', error);
        });
    }
    
    // 화면 크기에 따라 게임오버 레이아웃 설정
    setupGameOverLayout() {
        if (!this.isMobile) return;
        
        // 모바일 환경에서 게임오버 화면 설정 - 단순화
        const gameOver = document.querySelector('.game-over');
        if (gameOver) {
            // 항상 스크롤 가능하도록 설정
            gameOver.style.overflowY = 'auto';
            gameOver.style.maxHeight = '100vh';
            gameOver.style.display = 'block';
            gameOver.style.padding = '20px 10px';
            
            // 게임오버 콘텐츠 요소 가져오기
            const gameOverContent = gameOver.querySelector('.game-over-content');
            const gameStats = gameOver.querySelector('.game-stats');
            const gameInputs = gameOver.querySelector('.game-inputs');
            
            if (gameOverContent) {
                // 기본 세로 레이아웃 적용 (단순화)
                gameOverContent.style.flexDirection = 'column';
                gameOverContent.style.alignItems = 'center';
                gameOverContent.style.width = '100%';
                gameOverContent.style.maxWidth = '100%';
                
                if (gameStats) {
                    gameStats.style.width = '100%';
                    gameStats.style.marginBottom = '20px';
                    gameStats.style.textAlign = 'center';
                }
                
                if (gameInputs) {
                    gameInputs.style.width = '100%';
                    gameInputs.style.maxWidth = '400px';
                }
            }
            
            // 닉네임 입력 컨테이너
            const nicknameContainer = gameOver.querySelector('.nickname-save-container');
            if (nicknameContainer) {
                nicknameContainer.style.width = '100%';
                nicknameContainer.style.margin = '10px auto';
            }
            
            // 입력란과 버튼
            const inputWrapper = gameOver.querySelector('.retro-input-wrapper');
            if (inputWrapper) {
                inputWrapper.style.flexDirection = 'column';
                inputWrapper.style.width = '100%';
                
                const nicknameInput = inputWrapper.querySelector('input');
                const saveButton = inputWrapper.querySelector('button');
                
                if (nicknameInput) {
                    nicknameInput.style.width = '100%';
                    nicknameInput.style.marginBottom = '10px';
                }
                
                if (saveButton) {
                    saveButton.style.width = '100%';
                }
            }
            
            // 액션 버튼
            const actionButtons = gameOver.querySelector('.action-buttons');
            if (actionButtons) {
                actionButtons.style.width = '100%';
                actionButtons.style.display = 'flex';
                actionButtons.style.justifyContent = 'center';
                actionButtons.style.gap = '10px';
                actionButtons.style.marginTop = '20px';
                
                // 각 버튼의 크기 조정
                const buttons = actionButtons.querySelectorAll('button, a');
                buttons.forEach(button => {
                    button.style.flex = '1';
                    button.style.minWidth = 'auto';
                    button.style.textAlign = 'center';
                });
            }
        }
    }

    restart() {
        // 게임오버 화면 숨기기
        document.querySelector('.game-over').classList.add('hidden');
        
        // 모든 모달 요소 숨기기
        const gameClear = document.querySelector('.game-clear');
        if (gameClear) gameClear.classList.add('hidden');
        
        // 경고 메시지 제거
        const warning = document.querySelector('.warning');
        if (warning) {
            warning.remove();
        }
        
        // 게임 컨테이너와 캔버스 초기화
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            // 스크롤 위치 초기화
            gameContainer.scrollTop = 0;
        }
        
        // body 스타일 초기화
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        window.scrollTo(0, 0);
        
        // 캔버스 다시 표시
        this.canvas.style.display = 'block';
        
        // 방향 메시지 업데이트 (세로 모드일 때만 표시)
        const orientationMsg = document.getElementById('orientationMessage');
        if (orientationMsg && this.isMobile) {
            const isPortrait = window.innerWidth < window.innerHeight;
            orientationMsg.style.display = isPortrait ? 'flex' : 'none';
        }
        
        // 게임 초기화
        this.init();
        
        // 캔버스 크기 업데이트
        this.updateCanvasSize();
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // 사운드 재생 함수
    playSound(soundName) {
        try {
            if (this.sounds[soundName]) {
                // 사운드 재생 위치 처음으로 리셋 (중복 재생 가능하게)
                this.sounds[soundName].currentTime = 0;
                this.sounds[soundName].play().catch(e => {
                    // 사운드 로드 실패 시 조용히 무시 (개발 중 오류 방지)
                    console.log('Sound could not be played', e);
                });
            }
        } catch (e) {
            console.log('Sound error:', e);
        }
    }

    // 스테이지 전환 시작
    startStageTransition() {
        this.stageTransitioning = true;
        this.stageTransitionProgress = 0;
    }
    
    // 스테이지 전환 업데이트
    updateStageTransition() {
        if (!this.stageTransitioning) return;
        
        this.stageTransitionProgress += this.stageTransitionSpeed;
        
        if (this.stageTransitionProgress >= 100) {
            // 전환 완료
            this.stageTransitioning = false;
            this.stageTransitionProgress = 0;
            this.currentStage++;
            
            // 마지막 스테이지 체크
            if (this.currentStage > 6) {
                this.currentStage = 6;
            }
        }
    }

    // 배경 그리기 함수
    drawBackground() {
        // 기본 하늘 배경 그리기
        this.ctx.fillStyle = '#87CEEB';  // 하늘색으로 변경
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 세로 모드에서는 배경 크기와 위치 조정
        let bgHeight, bgY;
        
        if (this.isMobile) {
            // 모바일 세로 모드: 화면 하단에 배경 이미지 표시
            bgHeight = this.canvas.height * 0.5;  // 화면 높이의 50%
            bgY = this.canvas.height - bgHeight;   // 하단에 배치
        } else {
            // 데스크톱 가로 모드: 기존 비율 유지
            bgHeight = this.canvas.height * 0.7;  // 화면 높이의 70%
            bgY = this.canvas.height - bgHeight;  // 하단에 배치
        }
        
        // 전환 중이 아니면 현재 스테이지 배경만 그림
        if (!this.stageTransitioning) {
            // 현재 스테이지 배경 (0부터 시작하므로 -1)
            const currentBg = this.images.backgrounds[this.currentStage - 1];
            
            // 배경 이미지 반복 그리기 (무한 스크롤)
            if (currentBg && currentBg.complete) {
                // 불투명도 80%로 설정
                this.ctx.globalAlpha = 0.8;
                
                // 이미지 비율 유지
                const bgRatio = currentBg.naturalWidth / currentBg.naturalHeight;
                let renderWidth, renderHeight;
                
                // 세로 모드에서 크기 조정 - 비율 유지하면서 맞추기
                if (this.isMobile) {
                    // 세로 모드에서는 높이를 기준으로 너비 계산하여 비율 유지
                    renderHeight = bgHeight;
                    renderWidth = renderHeight * bgRatio;
                    
                    // 너비가 화면보다 작으면 화면 너비에 맞추고 높이 조정
                    if (renderWidth < this.canvas.width) {
                        renderWidth = this.canvas.width;
                        renderHeight = renderWidth / bgRatio;
                    }
                } else {
                    // 데스크톱에서는 기존 로직 유지
                    renderWidth = this.canvas.width;
                    renderHeight = renderWidth / bgRatio;
                    
                    // 높이가 설정한 영역보다 작으면 높이에 맞춤
                    if (renderHeight < bgHeight) {
                        renderHeight = bgHeight;
                        renderWidth = renderHeight * bgRatio;
                    }
                }
                
                // X 오프셋 계산 (이미지 중앙 정렬)
                const xOffset = (renderWidth - this.canvas.width) / 2;
                
                // 정확한 반복 간격 계산
                const actualWidth = renderWidth;
                
                // 모듈로 연산자 사용하여 정확한 위치 계산 (backgroundX 값이 계속 감소해도 순환하도록)
                let x1 = (this.backgroundX % actualWidth) - xOffset;
                if (x1 > 0) x1 -= actualWidth;
                
                // 화면을 완전히 채울 만큼 이미지 반복
                while (x1 < this.canvas.width) {
                    this.ctx.drawImage(
                        currentBg, 
                        x1, bgY, 
                        renderWidth, renderHeight
                    );
                    x1 += actualWidth;
                }
                
                // 알파값 초기화
                this.ctx.globalAlpha = 1;
            }
        } else {
            // 전환 중일 때는 두 배경을 블렌딩 (세로 모드에도 동일하게 적용)
            const currentBg = this.images.backgrounds[this.currentStage - 1];
            const nextBg = this.images.backgrounds[this.currentStage];
            
            // 현재 배경과 다음 배경 모두 세로 모드에 맞게 조정
            this.drawTransitionBackground(currentBg, nextBg, bgY, bgHeight);
        }
    }

    // 배경 전환 그리기 함수 (세로 모드 대응)
    drawTransitionBackground(currentBg, nextBg, bgY, bgHeight) {
        if (currentBg && currentBg.complete) {
            // 현재 배경 알파 계산 (80% 기준으로 페이드 아웃)
            this.ctx.globalAlpha = (1 - (this.stageTransitionProgress / 100)) * 0.8;
            
            // 이미지 비율 유지
            const bgRatio = currentBg.naturalWidth / currentBg.naturalHeight;
            let renderWidth, renderHeight;
            
            // 세로 모드에서 크기 조정 - 비율 유지하면서 맞추기
            if (this.isMobile) {
                // 세로 모드에서는 높이를 기준으로 너비 계산하여 비율 유지
                renderHeight = bgHeight;
                renderWidth = renderHeight * bgRatio;
                
                // 너비가 화면보다 작으면 화면 너비에 맞추고 높이 조정
                if (renderWidth < this.canvas.width) {
                    renderWidth = this.canvas.width;
                    renderHeight = renderWidth / bgRatio;
                }
            } else {
                // 데스크톱에서는 기존 로직 유지
                renderWidth = this.canvas.width;
                renderHeight = renderWidth / bgRatio;
                
                // 높이가 설정한 영역보다 작으면 높이에 맞춤
                if (renderHeight < bgHeight) {
                    renderHeight = bgHeight;
                    renderWidth = renderHeight * bgRatio;
                }
            }
            
            // X 오프셋 계산 (이미지 중앙 정렬)
            const xOffset = (renderWidth - this.canvas.width) / 2;
            
            // 정확한 반복 간격 계산
            const actualWidth = renderWidth;
            
            // 모듈로 연산자 사용하여 정확한 위치 계산
            let x1 = (this.backgroundX % actualWidth) - xOffset;
            if (x1 > 0) x1 -= actualWidth;
            
            // 화면을 완전히 채울 만큼 이미지 반복
            while (x1 < this.canvas.width) {
                this.ctx.drawImage(
                    currentBg, 
                    x1, bgY, 
                    renderWidth, renderHeight
                );
                x1 += actualWidth;
            }
        }
        
        // 다음 배경 그리기
        if (nextBg && nextBg.complete) {
            // 다음 배경 알파 계산 (80% 기준으로 페이드 인)
            this.ctx.globalAlpha = (this.stageTransitionProgress / 100) * 0.8;
            
            // 이미지 비율 유지
            const bgRatio = nextBg.naturalWidth / nextBg.naturalHeight;
            let renderWidth, renderHeight;
            
            // 세로 모드에서 크기 조정 - 비율 유지하면서 맞추기
            if (this.isMobile) {
                // 세로 모드에서는 높이를 기준으로 너비 계산하여 비율 유지
                renderHeight = bgHeight;
                renderWidth = renderHeight * bgRatio;
                
                // 너비가 화면보다 작으면 화면 너비에 맞추고 높이 조정
                if (renderWidth < this.canvas.width) {
                    renderWidth = this.canvas.width;
                    renderHeight = renderWidth / bgRatio;
                }
            } else {
                // 데스크톱에서는 기존 로직 유지
                renderWidth = this.canvas.width;
                renderHeight = renderWidth / bgRatio;
                
                // 높이가 설정한 영역보다 작으면 높이에 맞춤
                if (renderHeight < bgHeight) {
                    renderHeight = bgHeight;
                    renderWidth = renderHeight * bgRatio;
                }
            }
            
            // X 오프셋 계산 (이미지 중앙 정렬)
            const xOffset = (renderWidth - this.canvas.width) / 2;
            
            // 정확한 반복 간격 계산
            const actualWidth = renderWidth;
            
            // 모듈로 연산자 사용하여 정확한 위치 계산
            let x1 = (this.backgroundX % actualWidth) - xOffset;
            if (x1 > 0) x1 -= actualWidth;
            
            // 화면을 완전히 채울 만큼 이미지 반복
            while (x1 < this.canvas.width) {
                this.ctx.drawImage(
                    nextBg, 
                    x1, bgY, 
                    renderWidth, renderHeight
                );
                x1 += actualWidth;
            }
        }
        
        // 알파값 초기화
        this.ctx.globalAlpha = 1;
    }

    updateProfessorAnimation() {
        const now = performance.now();
        const elapsed = now - this.professorAnimationStart;
        
        // 교수님 크기 계산 - 모바일에서는 화면에 맞게 조정
        const professorWidth = this.isMobile ? 
            Math.min(180, this.canvas.width * 0.35) : 200; // 모바일에서 더 크게 표시
        const professorHeight = this.isMobile ? 
            Math.min(180, this.canvas.height * 0.35) : 200; // 모바일에서 더 크게 표시
        
        if (elapsed < this.professorAnimationDuration) {
            // 처음 2초 동안 등장
            if (elapsed < this.professorAnimationDuration / 3) {
                // 화면 중앙으로 이동 (화면 너비/2 - 교수님 이미지 너비/2)
                const centerX = this.canvas.width / 2 - professorWidth / 2;
                this.professorX = Math.min(centerX, -professorWidth + (elapsed / (this.professorAnimationDuration/3)) * (centerX + professorWidth));
            } 
            // 2초 동안 유지
            else if (elapsed < this.professorAnimationDuration * 2/3) {
                // 화면 중앙에 위치 (모바일에서는 약간 왼쪽으로)
                this.professorX = this.isMobile ? 
                    this.canvas.width / 2 - professorWidth * 0.6 : // 모바일에서 더 중앙에 가깝게
                    this.canvas.width / 2 - professorWidth / 2;
            }
            // 마지막 2초 동안 퇴장
            else {
                const reverseElapsed = elapsed - (this.professorAnimationDuration * 2/3);
                const startX = this.isMobile ? 
                    this.canvas.width / 2 - professorWidth * 0.6 : // 모바일에서 더 중앙에 가깝게 
                    this.canvas.width / 2 - professorWidth / 2;
                this.professorX = startX - (reverseElapsed / (this.professorAnimationDuration/3)) * (startX + professorWidth);
            }
        } else {
            this.professorAnimationActive = false;
            this.professorX = -professorWidth; // 화면 밖으로
            this.fSpawnRate = 0.055; // 교수님 사라진 후 F 확률 5.5%로 증가
        }
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    // 게임 인스턴스 생성
    const game = new Game();
    
    // 경고 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        .game-warning {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: red;
            font-size: 48px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            animation: warning-flash 0.5s infinite alternate;
            z-index: 100;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 10px 20px;
            border-radius: 10px;
        }
        
        @keyframes warning-flash {
            from { opacity: 0.5; transform: translate(-50%, -50%) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
        
        /* 모바일 경고 스타일 */
        @media (max-width: 800px) {
            .game-warning {
                font-size: 36px;
                padding: 8px 16px;
                white-space: nowrap;
            }
        }
        
        /* 매우 작은 화면 대응 */
        @media (max-width: 400px), (max-height: 400px) {
            .game-warning {
                font-size: 28px;
                padding: 5px 10px;
            }
        }
    `;
    document.head.appendChild(style);
});