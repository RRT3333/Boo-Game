/**
 * 게임 UI 관련 모듈
 * 게임 내 UI 요소 및 화면 관리를 담당합니다.
 */

// 카운트다운 처리
export function updateCountdown(countdownState, timestamp) {
    // 초기 설정 - 카운트다운 DOM 값 설정
    if (!countdownState.initialized) {
        const countdownElement = document.getElementById('countdownNumber');
        if (countdownElement) {
            countdownElement.textContent = countdownState.value;
        }
        countdownState.initialized = true;
        countdownState.lastCountdownTime = timestamp;
        return false;
    }

    // 이미 초기화된 경우 시간 차이 계산
    const deltaTime = timestamp - countdownState.lastCountdownTime;

    if (deltaTime >= 1000) {
        countdownState.value--;
        countdownState.lastCountdownTime = timestamp;

        // 카운트다운 DOM 업데이트
        const countdownElement = document.getElementById('countdownNumber');
        if (countdownElement) {
            if (countdownState.value > 0) {
                countdownElement.textContent = countdownState.value;
            } else {
                countdownElement.textContent = 'GO!';
                return true; // 카운트다운 종료 - 0 없이 바로 GO!
            }
        }
    }
    
    return false;
}

// 카운트다운 UI 표시
export function showCountdown(show) {
    const countdownDiv = document.getElementById('countdown');
    if (countdownDiv) {
        if (show) {
            countdownDiv.classList.add('show');
        } else {
            countdownDiv.classList.remove('show');
            
            // 카운트다운 숨김 시 초기값으로 재설정
            const countdownElement = document.getElementById('countdownNumber');
            if (countdownElement) {
                countdownElement.textContent = "3";
            }
        }
    }
}

// 경고 표시
export function showWarning(isMobile) {
    // 기존 경고 제거
    const existingWarning = document.querySelector('.game-warning');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    // 새 경고 생성
    const warningEl = document.createElement('div');
    warningEl.className = 'game-warning';
    warningEl.textContent = 'WARNING!';
    
    // 모바일에서는 크기 조정 - 더 잘 보이게
    if (isMobile) {
        warningEl.style.fontSize = '40px';
        warningEl.style.padding = '15px 25px';
        warningEl.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        warningEl.style.border = '3px solid red';
        warningEl.style.boxShadow = '0 0 15px rgba(255, 0, 0, 0.7)';
    }
    
    // 게임 컨테이너에 추가
    document.querySelector('.game-container').appendChild(warningEl);
    
    // 이미 몇 초 후 자동으로 사라지도록 설정
    setTimeout(() => {
        if (warningEl && warningEl.parentNode) {
            // 서서히 사라지는 효과
            warningEl.style.transition = 'opacity 0.5s ease-out';
            warningEl.style.opacity = '0';
            
            // 완전히 제거
            setTimeout(() => {
                if (warningEl.parentNode) {
                    warningEl.parentNode.removeChild(warningEl);
                }
            }, 500);
        }
    }, 3000);
}

// 캔버스 크기 업데이트
export function updateCanvasSize(canvas, player, isMobile) {
    const container = canvas.parentElement;
    
    if (isMobile) {
        // 모바일에서는 컨테이너에 맞추기 (세로 모드 최적화)
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        // 게임 요소 비율 조정
        if (player) {
            // 세로 모드에서의 플레이어 위치 조정
            const newPlayerY = Math.min(
                player.y,
                containerHeight - player.height - 10
            );
            player.y = newPlayerY;
            
            // 플레이어 위치 조정 (가로 방향 - x축)
            player.x = Math.min(containerWidth * 0.2, 100);
        }
    } else {
        // 데스크톱에서는 고정 크기 유지
        canvas.width = 800; // 기본 너비
        canvas.height = 600; // 기본 높이
        
        // 플레이어 위치 데스크톱에 맞게 조정
        if (player) {
            player.x = 100;
            player.y = 300;
        }
    }
    
    return {
        width: canvas.width,
        height: canvas.height
    };
}

// 점수 업데이트
export function updateScore(score) {
    document.getElementById('score').textContent = score;
}

// 시간 업데이트
export function updateTimer(timeLeft) {
    document.getElementById('gameTimer').textContent = timeLeft;
}

// 체력 업데이트
export function updateHealth(health) {
    document.querySelectorAll('.heart').forEach((heart, index) => {
        heart.style.opacity = index < health ? '1' : '0.2';
    });
    
    // 학사경고 표시
    if (health === 1) {
        const warningEl = document.createElement('div');
        warningEl.className = 'warning';
        warningEl.textContent = '학사경고!';
        
        const hud = document.querySelector('.hud');
        if (hud && !hud.querySelector('.warning')) {
            hud.insertAdjacentHTML('beforeend', '<div class="warning">학사경고!</div>');
        }
    }
}

// 게임 오버 화면 설정
export function setupGameOverScreen(gameState) {
    // 게임 결과 업데이트
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalTime').textContent = (60 - gameState.timeLeft) || 0;
    document.getElementById('finalStage').textContent = `스테이지 ${gameState.currentStage}`;
    
    // 모바일에서는 body 스크롤 허용
    if (gameState.isMobile) {
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        
        // 게임 캔버스 숨기기
        gameState.canvas.style.display = 'none';
    }
    
    // 게임오버 화면 표시
    const gameOverElement = document.querySelector('.game-over');
    gameOverElement.classList.remove('hidden');
    
    // 모바일 화면 레이아웃 처리
    if (gameState.isMobile) {
        setupGameOverLayout();
    }
    
    // 게임오버 화면이 보이도록 스크롤
    setTimeout(() => {
        gameOverElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    // 닉네임 입력 필드에 포커스 (모바일 외에서만)
    if (!gameState.isMobile) {
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
}

// 게임 오버 레이아웃 설정 (모바일)
export function setupGameOverLayout() {
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

// 게임 재시작 UI 처리
export function handleGameRestart() {
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
    
    // 말풍선 제거
    const speechBubble = document.querySelector('.professor-speech');
    if (speechBubble) {
        speechBubble.remove();
    }
    
    // 게임 컨테이너와 캔버스 초기화
    const gameContainer = document.querySelector('.game-container');
    const canvas = document.getElementById('gameCanvas');
    
    if (gameContainer) {
        // 스크롤 위치 초기화
        gameContainer.scrollTop = 0;
        
        // 중앙 정렬 강제 적용
        gameContainer.style.margin = '0 auto !important';
        gameContainer.style.left = '0 !important';
        gameContainer.style.right = '0 !important';
        gameContainer.style.position = 'relative !important';
        
        // CSS 속성 리셋
        gameContainer.style.removeProperty('transform');
        gameContainer.style.removeProperty('translate');
        
        // 데스크톱에서는 고정 크기 유지
        if (window.innerWidth > 800) {
            gameContainer.style.width = '800px';
            gameContainer.style.height = '600px';
            gameContainer.style.maxWidth = '800px';
            gameContainer.style.maxHeight = '600px';
        }
    }
    
    // 캔버스 스타일 재설정
    if (canvas) {
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto !important';
        canvas.style.position = 'relative !important';
        canvas.style.left = '0 !important';
        canvas.style.right = '0 !important';
        
        // 모바일이 아닌 경우 크기 재설정
        if (window.innerWidth > 800) {
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        }
    }
    
    // 화면 중앙에 위치시키기 위한 추가 설정
    if (window.innerWidth > 800) {
        document.body.style.display = 'flex';
        document.body.style.justifyContent = 'center';
        document.body.style.alignItems = 'center';
    }
    
    // body 스타일 초기화
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    window.scrollTo(0, 0);
    
    // CSS 강제 리페인트를 위한 타임아웃
    setTimeout(() => {
        if (gameContainer) {
            gameContainer.style.margin = '0 auto !important';
            gameContainer.style.left = '0 !important';
            gameContainer.style.right = '0 !important';
        }
        
        if (canvas) {
            canvas.style.margin = '0 auto !important';
            canvas.style.position = 'relative !important';
            canvas.style.left = '0 !important';
        }
    }, 50);
} 