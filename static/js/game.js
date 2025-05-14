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
        
        // 이미지 로드
        this.images = {
            aPlus: new Image(),
            fGrade: new Image()
        };
        this.images.aPlus.src = '/static/assets/items/a_plus.png';
        this.images.fGrade.src = '/static/assets/obstacles/f_grade.png';
        
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
            width: 50, // 고정
            height: 50, // 고정
            velocity: 0,
            gravity: 0.5,
            jumpForce: -10
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
        this.lastCountdownTime = 0;

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
                            document.getElementById('gameTimer').textContent = this.timeLeft;
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
        if (Math.random() < 0.05) {
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
        if (Math.random() < 0.01) {
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

        // Keep player in bounds
        if (this.player.y > this.canvas.height - this.player.height) {
            this.endGame();
            return;
        }
        if (this.player.y < 0) {
            this.player.y = 0;
            this.player.velocity = 0;
        }

        // Update background
        this.backgroundX -= 2;
        if (this.backgroundX <= -this.canvas.width) {
            this.backgroundX = 0;
        }

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
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw player (Boo)
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

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
}

// Start game when page loads
window.addEventListener('load', () => {
    new Game();
});