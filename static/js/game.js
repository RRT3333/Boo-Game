class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.baseWidth = 800;  // 기준이 되는 게임 너비
        this.baseHeight = 600; // 기준이 되는 게임 높이
        // this.scale = 1;        // 화면 크기에 따른 스케일 비율 (반응형 주석)
        // this.devicePixelRatio = window.devicePixelRatio || 1; // 디바이스 픽셀 비율 (반응형 주석)
        // this.aspectRatio = this.baseWidth / this.baseHeight; // 캔버스의 기본 비율 (반응형 주석)

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
        this.fSpawnRate = 0.04; // F 등장 확률 초기값 4%
        this.aPlusSpawnRate = 0.03; // A+ 등장 확률 (3배 증가)
        
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
            x: 100,
            y: 300,
            width: 70, // 50에서 70으로 키움
            height: 70, // 50에서 70으로 키움
            velocity: 0,
            gravity: 0.5,
            jumpForce: -10,
            isFlying: false // 날고 있는지 여부
        };

        // Game objects
        this.obstacles = [];
        this.items = [];
        this.backgroundX = 0;

        // Event listeners
        document.addEventListener('keydown', (e) => this.handleInput(e));
        document.addEventListener('click', () => this.handleInput());
        document.getElementById('restartButton').addEventListener('click', () => this.restart());

        // 반응형 리사이즈 핸들러 주석처리
        // window.addEventListener('resize', () => this.handleResize());
        // this.handleResize();

        // 캔버스 고정 크기
        this.canvas.width = this.baseWidth;
        this.canvas.height = this.baseHeight;

        // Start game loop
        this.lastTime = 0;
        this.lastCountdownTime = 0;
        this.init();
    }

    // 반응형 함수 전체 주석처리
    /*
    handleResize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = window.innerHeight - 100; // HUD 영역 고려

        // 캔버스 비율 유지
        if (containerWidth / containerHeight > this.aspectRatio) {
            this.scale = containerHeight / this.baseHeight;
        } else {
            this.scale = containerWidth / this.baseWidth;
        }

        // 캔버스의 CSS 크기와 픽셀 크기 동기화
        this.canvas.style.width = `${this.baseWidth * this.scale}px`;
        this.canvas.style.height = `${this.baseHeight * this.scale}px`;
        this.canvas.width = this.baseWidth * this.scale * this.devicePixelRatio;
        this.canvas.height = this.baseHeight * this.scale * this.devicePixelRatio;

        // 컨텍스트 스케일 설정
        this.ctx.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);

        // 플레이어 크기 조정
        this.player.width = 50 * this.scale;
        this.player.height = 50 * this.scale;
        this.player.y = Math.min(this.player.y, this.canvas.height / this.devicePixelRatio - this.player.height);

        // HUD 크기 조정
        document.querySelector('.hud').style.fontSize = `${16 * this.scale}px`;
    }
    */

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
        this.player.y = 300;
        this.player.velocity = 0;
        this.player.isFlying = false; // 초기 상태는 날개 접은 상태
        this.lastCountdownTime = 0;
        this.elapsedGameTime = 0;  // 게임 경과 시간 초기화
        
        // 스테이지 초기화
        this.currentStage = 1;
        this.stageTransitioning = false;
        this.stageTransitionProgress = 0;
        
        // 프로페서 애니메이션 초기화
        this.professorShown = false;
        this.professorAnimationActive = false;
        this.professorX = -200;
        this.fSpawnRate = 0.04; // F 등장 확률 초기화 (4%)
        this.aPlusSpawnRate = 0.03; // A+ 등장 확률 초기화 (3배로 증가)

        // Clear existing timer if any
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Start game loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));

        // Add touch event listener for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleInput(e));
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
            this.obstacles.push({
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - 40),
                width: 40,
                height: 40,
                type: 'F'
            });
        }
    }

    spawnItem() {
        if (Math.random() < this.aPlusSpawnRate) {  // A+ 등장 확률 변수 사용
            this.items.push({
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - 30),
                width: 30,
                height: 30,
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

        // Update obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= 5;
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
            item.x -= 3;
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
            const now = performance.now();
            const elapsed = now - this.professorAnimationStart;
            
            if (elapsed < this.professorAnimationDuration) {
                // 처음 2초 동안 등장
                if (elapsed < this.professorAnimationDuration / 3) {
                    // 화면 중앙으로 이동 (화면 너비/2 - 교수님 이미지 너비/2)
                    const centerX = this.canvas.width / 2 - 100;
                    this.professorX = Math.min(centerX, -200 + (elapsed / (this.professorAnimationDuration/3)) * (centerX + 200));
                } 
                // 2초 동안 유지
                else if (elapsed < this.professorAnimationDuration * 2/3) {
                    // 화면 중앙에 위치
                    this.professorX = this.canvas.width / 2 - 100;
                }
                // 마지막 2초 동안 퇴장
                else {
                    const reverseElapsed = elapsed - (this.professorAnimationDuration * 2/3);
                    const centerX = this.canvas.width / 2 - 100;
                    this.professorX = centerX - (reverseElapsed / (this.professorAnimationDuration/3)) * (centerX + 200);
                }
            } else {
                this.professorAnimationActive = false;
                this.professorX = -200; // 화면 밖으로
                this.fSpawnRate = 0.055; // 교수님 사라진 후 F 확률 5.5%로 증가 (5%에서 5.5%로 변경)
            }
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
            // 교수님 이미지 그리기
            const professorWidth = 200;
            const professorHeight = 200;
            this.ctx.drawImage(
                this.images.professor,
                this.professorX, 
                this.canvas.height - professorHeight - 20, 
                professorWidth, 
                professorHeight
            );
            
            // 말풍선 그리기
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.beginPath();
            this.ctx.roundRect(this.professorX + professorWidth - 30, this.canvas.height - professorHeight - 70, 250, 50, 10);
            this.ctx.fill();
            
            // 세모 말풍선 꼬리
            this.ctx.beginPath();
            this.ctx.moveTo(this.professorX + professorWidth - 20, this.canvas.height - professorHeight - 25);
            this.ctx.lineTo(this.professorX + professorWidth - 50, this.canvas.height - professorHeight - 45);
            this.ctx.lineTo(this.professorX + professorWidth, this.canvas.height - professorHeight - 45);
            this.ctx.closePath();
            this.ctx.fill();
            
            // 텍스트 그리기
            this.ctx.fillStyle = 'black';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.fillText("자네 대학원 올 생각 없나?", this.professorX + professorWidth, this.canvas.height - professorHeight - 40);
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

        document.getElementById('finalScore').textContent = this.score;
        document.querySelector('.game-over').classList.remove('hidden');

        // Save score (익명)
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
                items_collected: this.itemsCollected,
                obstacles_avoided: this.obstaclesAvoided,
                max_combo: this.maxCombo,
                nickname: '익명의 학생'
            })
        });

        // 이름 저장 버튼 이벤트 등록
        const saveBtn = document.getElementById('saveNicknameBtn');
        if (saveBtn) {
            saveBtn.onclick = () => {
                const nickname = document.getElementById('gameOverNickname').value.trim() || '익명의 학생';
                
                // 버튼 애니메이션
                saveBtn.classList.add('active');
                
                // 저장 사운드 재생
                this.playSound('save');
                
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
                        saveBtn.classList.remove('active');
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
                    saveBtn.classList.remove('active');
                    alert('서버 연결 오류: ' + error);
                });
            };
        }
    }

    restart() {
        document.querySelector('.game-over').classList.add('hidden');
        document.querySelectorAll('.heart').forEach(heart => heart.style.opacity = '1');
        const warning = document.querySelector('.warning');
        if (warning) {
            warning.remove();
        }
        this.init();
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
        
        // 배경 이미지용 설정
        const bgHeight = this.canvas.height * 0.7;  // 캔버스 높이의 70%만 사용
        const bgY = this.canvas.height - bgHeight;  // 하단에 배치
        
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
                let renderWidth = this.canvas.width;
                let renderHeight = renderWidth / bgRatio;
                
                // 높이가 설정한 영역보다 작으면 높이에 맞춤
                if (renderHeight < bgHeight) {
                    renderHeight = bgHeight;
                    renderWidth = renderHeight * bgRatio;
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
            // 전환 중일 때는 두 배경을 블렌딩
            const currentBg = this.images.backgrounds[this.currentStage - 1];
            const nextBg = this.images.backgrounds[this.currentStage];
            
            // 현재 배경 그리기
            if (currentBg && currentBg.complete) {
                // 현재 배경 알파 계산 (80% 기준으로 페이드 아웃)
                this.ctx.globalAlpha = (1 - (this.stageTransitionProgress / 100)) * 0.8;
                
                // 이미지 비율 유지
                const bgRatio = currentBg.naturalWidth / currentBg.naturalHeight;
                let renderWidth = this.canvas.width;
                let renderHeight = renderWidth / bgRatio;
                
                // 높이가 설정한 영역보다 작으면 높이에 맞춤
                if (renderHeight < bgHeight) {
                    renderHeight = bgHeight;
                    renderWidth = renderHeight * bgRatio;
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
            }
            
            // 다음 배경 그리기
            if (nextBg && nextBg.complete) {
                // 다음 배경 알파 계산 (80% 기준으로 페이드 인)
                this.ctx.globalAlpha = (this.stageTransitionProgress / 100) * 0.8;
                
                // 이미지 비율 유지
                const bgRatio = nextBg.naturalWidth / nextBg.naturalHeight;
                let renderWidth = this.canvas.width;
                let renderHeight = renderWidth / bgRatio;
                
                // 높이가 설정한 영역보다 작으면 높이에 맞춤
                if (renderHeight < bgHeight) {
                    renderHeight = bgHeight;
                    renderWidth = renderHeight * bgRatio;
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
    }
}

// Start game when page loads
window.addEventListener('load', () => {
    new Game();
    
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
        }
        
        @keyframes warning-flash {
            from { opacity: 0.5; transform: translate(-50%, -50%) scale(0.9); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
    `;
    document.head.appendChild(style);
});