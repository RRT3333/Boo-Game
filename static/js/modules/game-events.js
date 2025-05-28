/**
 * 게임 이벤트 관련 모듈
 * 게임 내 이벤트 및 사용자 상호작용 처리를 담당합니다.
 */

import { createObstacle, createItem } from './game-entities.js';
import { showWarning, showGraduation } from './game-ui.js';
import { playSound } from './game-audio.js';

// 모바일 환경 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 입력 처리 최적화를 위한 변수
const INPUT_CONFIG = {
    debounceTime: isMobile ? 80 : 50, // 모바일에서는 더 긴 디바운스
    lastInputTime: 0,
    lowPowerInputThrottle: 120, // 저전력 모드에서의 입력 쓰로틀
    pendingJump: false // 클릭/터치 시 점프 지연 처리 플래그
};

// 게임 입력 처리
export function handleInput(player, gameOver, sounds) {
    // 게임오버 상태에서는 무시
    if (gameOver) return false;
    
    // 입력 디바운싱 - 너무 빠른 연속 입력 방지
    const now = Date.now();
    
    // 저전력 모드 감지 (sounds 객체에서 상태 확인)
    const isLowPowerMode = sounds && sounds._lowPowerMode;
    
    // 저전력 모드에서는 더 긴 디바운스 적용
    const effectiveDebounceTime = isLowPowerMode ? 
        INPUT_CONFIG.lowPowerInputThrottle : 
        INPUT_CONFIG.debounceTime;
    
    if (now - INPUT_CONFIG.lastInputTime < effectiveDebounceTime) {
        return false;
    }
    
    // 입력 처리
    player.velocity = player.jumpForce;
    player.isFlying = true; // 점프 시 날개 편 상태로 변경
    
    // 모바일 환경에서 성능 최적화를 위한 오디오 처리
    if (isMobile) {
        // 비동기 플래그 설정 (메인 스레드 차단 방지)
        if (!INPUT_CONFIG.pendingJump) {
            INPUT_CONFIG.pendingJump = true;
            
            // 다음 프레임에서 사운드 재생 (메인 스레드 차단 방지)
            setTimeout(() => {
                // 저전력 모드에서는 가끔만 사운드 재생
                if (!isLowPowerMode || Math.random() > 0.5) {
                    playSound(sounds, 'jump');
                }
                INPUT_CONFIG.pendingJump = false;
            }, 0);
        }
    } else {
        // 데스크톱에서는 일반 재생
        playSound(sounds, 'jump');
    }
    
    // 입력 시간 기록
    INPUT_CONFIG.lastInputTime = now;
    return true;
}

// 이벤트 리스너 등록
export function setupEventListeners(game) {
    // 입력 이벤트 핸들러 - 모든 입력 통합 처리
    const inputHandler = (e) => {
        // 이벤트 전파 방지 (필요시)
        if (e.type === 'touchstart') {
            e.preventDefault();
        }
        
        // 게임 입력 처리
        game.handleInput();
    };
    
    // 키보드 이벤트
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            inputHandler(e);
        }
    });
    
    // 클릭 이벤트 - 데스크톱
    if (!isMobile) {
        document.addEventListener('click', inputHandler);
    }
    
    // 모바일에서 터치 이벤트 최적화
    if (isMobile) {
        // 터치 이벤트 - 모바일 특화
        game.canvas.addEventListener('touchstart', inputHandler, { passive: false });
        
        // 화면 크기 변경 이벤트
        const optimizedResize = debounce(() => game.updateCanvasSize(), 100);
        window.addEventListener('resize', optimizedResize);
        
        // iOS 오디오 컨텍스트 활성화 - 첫 터치에서 오디오 활성화
        document.addEventListener('touchstart', function() {
            // 오디오 컨텍스트가 있는 경우 활성화
            if (window.AudioContext) {
                const dummyAudio = new Audio();
                dummyAudio.play().catch(() => {});
            }
        }, { once: true });
    }
    
    // 다시 시작 버튼에 이벤트 추가
    const restartButton = document.getElementById('restartButton');
    
    // 재시작 버튼 이벤트 - 디바운싱 제거, 직접 호출로 변경
    restartButton.addEventListener('click', () => {
        console.log('재시작 버튼 클릭됨 (click 이벤트)');
        try {
            if (window.gameInstance) {
                window.gameInstance.restart();
            } else {
                console.log('게임 인스턴스가 없어 페이지 리로드로 대체');
                window.location.reload();
            }
        } catch (error) {
            console.error('재시작 중 오류 발생:', error);
            window.location.reload();
        }
    });
    
    // 모바일에서 터치 이벤트 별도 추가 (클릭 이벤트가 제대로 동작하지 않는 경우 대비)
    if (isMobile) {
        restartButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            console.log('재시작 버튼 터치됨 (touchstart)');
            // 시각적 피드백
            restartButton.style.transform = 'scale(0.95)';
        }, { passive: false });
        
        restartButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            console.log('재시작 버튼 터치 종료 (touchend)');
            // 시각적 피드백 복원
            restartButton.style.transform = 'scale(1)';
            // 직접 재시작 호출
            try {
                if (window.gameInstance) {
                    window.gameInstance.restart();
                } else {
                    console.log('게임 인스턴스가 없어 페이지 리로드로 대체');
                    window.location.reload();
                }
            } catch (error) {
                console.error('재시작 중 오류 발생:', error);
                window.location.reload();
            }
        }, { passive: false });
    }
    
    const clearRestartButton = document.getElementById('clearRestartButton');
    if (clearRestartButton) {
        clearRestartButton.addEventListener('click', () => {
            console.log('클리어 재시작 버튼 클릭됨 (click 이벤트)');
            try {
                if (window.gameInstance) {
                    window.gameInstance.restart();
                } else {
                    console.log('게임 인스턴스가 없어 페이지 리로드로 대체');
                    window.location.reload();
                }
            } catch (error) {
                console.error('재시작 중 오류 발생:', error);
                window.location.reload();
            }
        });
        
        // 모바일에서 터치 이벤트 별도 추가
        if (isMobile) {
            clearRestartButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                console.log('클리어 재시작 버튼 터치됨 (touchstart)');
                // 시각적 피드백
                clearRestartButton.style.transform = 'scale(0.95)';
            }, { passive: false });
            
            clearRestartButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                console.log('클리어 재시작 버튼 터치 종료 (touchend)');
                // 시각적 피드백 복원
                clearRestartButton.style.transform = 'scale(1)';
                // 직접 재시작 호출
                try {
                    if (window.gameInstance) {
                        window.gameInstance.restart();
                    } else {
                        console.log('게임 인스턴스가 없어 페이지 리로드로 대체');
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('재시작 중 오류 발생:', error);
                    window.location.reload();
                }
            }, { passive: false });
        }
    }
}

// 디바운스 유틸리티 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 게임 타이머 시작
export function startGameTimer(gameState, callbacks) {
    const {
        onTimerTick,
        onProfessorAppear,
        onStageTransition,
        onGameOver
    } = callbacks;
    
    return setInterval(() => {
        // 시간이 증가하도록 변경
        gameState.timeLeft++;
        gameState.elapsedGameTime++; // 게임 경과 시간 증가
        
        if (onTimerTick) {
            onTimerTick(gameState.timeLeft);
        }
        
        // 게임 시작 후 20초에 교수님 등장
        if (gameState.elapsedGameTime === 20 && !gameState.professorShown) {
            gameState.professorShown = true;
            gameState.professorAnimationActive = true;
            gameState.professorAnimationStart = performance.now();
            
            if (onProfessorAppear) {
                onProfessorAppear();
            }
            
            // showWarning 함수 직접 호출
            showWarning(gameState.isMobile);
        }
        
        // 게임 시작 후 60초에 졸업 축하 메시지 표시
        if (gameState.elapsedGameTime === 60) {
            // 졸업 축하 메시지 표시
            showGraduation(gameState.isMobile);
            
            // 난이도 증가
            gameState.fSpawnRate = 0.03; // F 확률 0.03(3%)으로 설정
            gameState.aPlusSpawnRate = 0.04; // A+ 확률도 소폭 증가
            gameState.obstacleSpeedMultiplier *= 1.2; // 장애물 속도 20% 증가
        }
        
        // 스테이지 전환 확인 (10초마다)
        if (gameState.elapsedGameTime % 10 === 0 && 
            gameState.elapsedGameTime > 0 && 
            gameState.elapsedGameTime <= 60) {  // 50초에서 60초로 증가
            // 6번 전환 (1단계부터 6단계까지)
            if (gameState.currentStage < 6) {
                if (onStageTransition) {
                    onStageTransition(gameState.currentStage + 1);
                }
            }
        }
        
        // 게임은 계속 진행되며 종료 조건은 다른 로직에서 처리
    }, 1000);
}

// 장애물 생성
export function spawnObstacle(gameState) {
    if (Math.random() < gameState.fSpawnRate) {
        gameState.obstacles.push(
            createObstacle(gameState.isMobile, gameState.canvas.width, gameState.canvas.height)
        );
    }
}

// 아이템 생성
export function spawnItem(gameState) {
    if (Math.random() < gameState.aPlusSpawnRate) {
        gameState.items.push(
            createItem(gameState.isMobile, gameState.canvas.width, gameState.canvas.height)
        );
    }
}

// 스테이지 전환 시작
export function startStageTransition(gameState) {
    gameState.stageTransitioning = true;
    gameState.stageTransitionProgress = 0;
} 