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
    console.log("경고 메시지 표시 함수 실행");
    
    // 기존 경고 제거
    const existingWarning = document.querySelector('.game-warning');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    // 추가 경고 메시지 제거
    const existingSubWarning = document.querySelector('.game-sub-warning');
    if (existingSubWarning) {
        existingSubWarning.remove();
    }
    
    // 새 경고 생성
    const warningEl = document.createElement('div');
    warningEl.className = 'game-warning';
    warningEl.textContent = 'WARNING!';
    
    // 난이도 상승 경고 메시지 생성
    const difficultyEl = document.createElement('div');
    difficultyEl.className = 'game-sub-warning';
    difficultyEl.innerHTML = '※ 난이도가 올라갑니다.';
    
    // 모바일과 데스크톱에 따라 위치 조정
    if (isMobile) {
        // 모바일 - 화면 상단에 배치
        warningEl.style.fontSize = '40px';
        warningEl.style.top = '20%';
        
        difficultyEl.style.fontSize = '18px';
        difficultyEl.style.top = '28%';
    } else {
        // 데스크톱 - 화면 중앙 상단에 배치
        warningEl.style.fontSize = '60px';
        warningEl.style.top = '25%';
        
        difficultyEl.style.fontSize = '22px';
        difficultyEl.style.top = '35%';
    }
    
    // 게임 컨테이너에 추가
    const gameContainer = document.querySelector('.game-container');
    gameContainer.appendChild(warningEl);
    gameContainer.appendChild(difficultyEl);
    
    console.log("경고 메시지 요소들 추가 완료");
    
    // 일정 시간 후 제거
    setTimeout(() => {
        if (warningEl && warningEl.parentNode) {
            warningEl.style.transition = 'opacity 0.5s ease-out';
            warningEl.style.opacity = '0';
            
            setTimeout(() => {
                if (warningEl.parentNode) {
                    warningEl.parentNode.removeChild(warningEl);
                }
            }, 500);
        }
        
        if (difficultyEl && difficultyEl.parentNode) {
            difficultyEl.style.transition = 'opacity 0.5s ease-out';
            difficultyEl.style.opacity = '0';
            
            setTimeout(() => {
                if (difficultyEl.parentNode) {
                    difficultyEl.parentNode.removeChild(difficultyEl);
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
    document.getElementById('finalTime').textContent = gameState.timeLeft || 0; // 경과 시간을 직접 표시
    document.getElementById('finalStage').textContent = getStageName(gameState.currentStage); // 스테이지 숫자 대신 이름으로 표시
    
    // 게임 클리어 화면도 업데이트 (최종 시간 값 등)
    document.getElementById('clearScore').textContent = gameState.score;
    document.getElementById('clearTime').textContent = gameState.timeLeft || 0; // 경과 시간을 직접 표시
    document.getElementById('clearStage').textContent = getStageName(gameState.currentStage); // 스테이지 이름 표시
    
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
    console.log('게임 재시작 UI 처리 시작');
    
    try {
        // 게임오버 화면 숨기기
        const gameOverEl = document.querySelector('.game-over');
        if (gameOverEl) {
            gameOverEl.classList.add('hidden');
        }
        
        // 모든 모달 요소 숨기기
        const gameClear = document.querySelector('.game-clear');
        if (gameClear) {
            gameClear.classList.add('hidden');
        }
        
        // 경고 메시지 제거
        const warning = document.querySelector('.warning');
        if (warning) {
            warning.remove();
        }
        
        // 경고와 서브 경고 메시지 제거
        const gameWarning = document.querySelector('.game-warning');
        if (gameWarning) {
            gameWarning.remove();
        }
        
        const gameSubWarning = document.querySelector('.game-sub-warning');
        if (gameSubWarning) {
            gameSubWarning.remove();
        }
        
        // 말풍선 제거
        const speechBubble = document.querySelector('.professor-speech');
        if (speechBubble) {
            speechBubble.remove();
        }
        
        // 게임 컨테이너와 캔버스 초기화
        const gameContainer = document.querySelector('.game-container');
        const canvas = document.getElementById('gameCanvas');
        
        // 모바일 환경 감지
        const isMobile = window.innerWidth <= 800;
        
        if (gameContainer) {
            // 스크롤 위치 초기화
            gameContainer.scrollTop = 0;
            
            // 모바일과 데스크톱에 따라 다른 스타일 적용
            if (isMobile) {
                // 모바일 환경에서는 전체 화면 설정
                gameContainer.style.width = '100vw';
                gameContainer.style.height = '100vh';
                gameContainer.style.margin = '0';
                gameContainer.style.padding = '0';
                gameContainer.style.position = 'fixed';
                gameContainer.style.top = '0';
                gameContainer.style.left = '0';
                gameContainer.style.borderRadius = '0';
                gameContainer.style.border = 'none';
            } else {
                // 데스크톱에서는 고정 크기 유지
                gameContainer.style.margin = '0 auto';
                gameContainer.style.left = '0';
                gameContainer.style.right = '0';
                gameContainer.style.position = 'relative';
                gameContainer.style.width = '800px';
                gameContainer.style.height = '600px';
                gameContainer.style.maxWidth = '800px';
                gameContainer.style.maxHeight = '600px';
            }
            
            // CSS 속성 리셋
            gameContainer.style.removeProperty('transform');
            gameContainer.style.removeProperty('translate');
        }
        
        // 캔버스 스타일 재설정
        if (canvas) {
            canvas.style.display = 'block';
            
            if (isMobile) {
                canvas.style.width = '100%';
                canvas.style.height = '100%';
            } else {
                canvas.style.margin = '0 auto';
                canvas.style.position = 'relative';
                canvas.style.left = '0';
                canvas.style.right = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
            }
        }
        
        // 화면 중앙에 위치시키기 위한 추가 설정
        if (!isMobile) {
            document.body.style.display = 'flex';
            document.body.style.justifyContent = 'center';
            document.body.style.alignItems = 'center';
        }
        
        // body 스타일 초기화
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        window.scrollTo(0, 0);
        
        console.log('게임 재시작 UI 처리 완료');
    } catch (error) {
        console.error('게임 재시작 UI 처리 중 오류 발생:', error);
    }
}

// 스테이지 이름 변환 함수
function getStageName(stageNumber) {
    const stageNames = [
        '교양관', '명수당', '공학관', '백년관', '기숙사', '정문'
    ];
    return stageNames[stageNumber - 1] || '교양관';
}

// 스테이지 진행 상태 업데이트
export function updateStageProgress(currentStage, progress) {
    // 진행도 계산 (0-100%)
    const progressPercentage = Math.min(progress, 100); // 100%를 초과하지 않도록 제한
    
    // 스테이지 이름 업데이트
    const currentStageEl = document.getElementById('currentStage');
    if (currentStageEl) {
        currentStageEl.textContent = getStageName(currentStage);
    }
    
    // 진행 바 업데이트
    const progressBarEl = document.getElementById('stageProgress');
    if (progressBarEl) {
        progressBarEl.style.width = `${progressPercentage}%`;
    }
    
    // 캐릭터 위치 업데이트
    const flyingCharacterEl = document.getElementById('flyingCharacter');
    if (flyingCharacterEl) {
        // 스테이지별 위치 계산 (0-100%)
        const stageWidth = 100 / 5; // 5개 구간
        const baseProgress = (currentStage - 1) * stageWidth;
        const currentProgress = baseProgress + (progressPercentage / 100 * stageWidth);
        const characterPosition = Math.min(currentProgress, 100);
        
        // 캐릭터 위치 설정
        flyingCharacterEl.style.left = `${characterPosition}%`;
    }
} 