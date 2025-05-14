/**
 * 게임 이벤트 관련 모듈
 * 게임 내 이벤트 처리를 담당합니다.
 */

import { showWarning } from './game-ui.js';
import { playSound } from './game-audio.js';
import { createObstacle, createItem } from './game-entities.js';

// 게임 입력 처리
export function handleInput(player, gameOver, sounds) {
    if (!gameOver) {
        player.velocity = player.jumpForce;
        player.isFlying = true; // 점프 시 날개 편 상태로 변경
        
        // 점프 사운드 재생
        playSound(sounds, 'jump');
        return true;
    }
    return false;
}

// 이벤트 리스너 등록
export function setupEventListeners(game) {
    // 키보드 이벤트
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            game.handleInput();
        }
    });
    
    // 클릭 이벤트
    document.addEventListener('click', () => {
        game.handleInput();
    });
    
    // 모바일에서 터치 이벤트 추가
    if (game.isMobile) {
        game.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 기본 동작 방지
            game.handleInput();
        }, { passive: false });
        
        // 화면 크기 변경 이벤트
        window.addEventListener('resize', () => game.updateCanvasSize());
    }
    
    // 다시 시작 버튼에 이벤트 추가
    document.getElementById('restartButton').addEventListener('click', () => game.restart());
    const clearRestartButton = document.getElementById('clearRestartButton');
    if (clearRestartButton) {
        clearRestartButton.addEventListener('click', () => game.restart());
    }
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
        if (gameState.timeLeft > 0) {
            gameState.timeLeft--;
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
                
                // WARNING 표시 (원래 코드로 변경)
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
            if (gameState.elapsedGameTime % 10 === 0 && 
                gameState.elapsedGameTime > 0 && 
                gameState.elapsedGameTime <= 50) {
                // 5번만 전환 (6단계까지)
                if (gameState.currentStage < 6) {
                    if (onStageTransition) {
                        onStageTransition(gameState.currentStage + 1);
                    }
                }
            }
            
            if (gameState.timeLeft === 0) {
                if (onGameOver) {
                    onGameOver();
                }
            }
        }
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