/**
 * 게임 물리 관련 모듈
 * 게임 내 모든 물리 엔진과 상태 업데이트를 담당합니다.
 * 
 * 주요 물리 개념:
 * 1. 등가속도 운동 - 중력에 의한 가속도 운동 (v = v0 + at)
 * 2. 속도와 변위 관계 - 속도에 따른 위치 변화 (Δx = vΔt)
 * 3. 충돌 감지 - 두 물체의 경계 상자(Bounding Box) 교차 여부 확인
 * 4. 상대 속도 - 배경과 물체의 상대적인 움직임
 */

import { checkCollision } from './game-entities.js';

// 플레이어 물리 업데이트
export function updatePlayerPhysics(player, canvas) {
    // 중력 가속도에 의한 속도 변화: v = v0 + at
    // player.gravity는 가속도 a, Δt는 프레임 간격(1로 가정)
    player.velocity += player.gravity;
    
    // 속도에 따른 위치 변화: Δy = vΔt
    // Δt는 프레임 간격(1로 가정)
    player.y += player.velocity;
    
    // 운동 방향에 따른 상태 변화
    // 음의 속도는 상승, 양의 속도는 하강을 의미
    player.isFlying = player.velocity < 0;
    
    let gameOver = false;
    
    // 바닥 충돌: 위치 에너지가 0이 되는 지점
    if (player.y > canvas.height - player.height) {
        gameOver = true;
    }
    
    // 천장 충돌: 운동량 보존 법칙에 따라 속도를 0으로 초기화
    if (player.y < 0) {
        player.y = 0;
        player.velocity = 0;
        player.isFlying = false;
    }
    
    return gameOver;
}

// 장애물 업데이트
export function updateObstacles(obstacles, player, speed, healthCallback) {
    let collisionDetected = false;
    
    // 등속 운동: x = x0 - vt (왼쪽으로 이동하므로 음의 속도)
    return obstacles.filter(obstacle => {
        obstacle.x -= speed;
        
        // AABB(Axis-Aligned Bounding Box) 충돌 감지
        if (checkCollision(player, obstacle)) {
            collisionDetected = true;
            healthCallback();
            return false;
        }
        
        return obstacle.x > -obstacle.width;
    });
}

// 아이템 업데이트
export function updateItems(items, player, speed, scoreCallback) {
    // 장애물과 동일한 등속 운동 원리 적용
    return items.filter(item => {
        item.x -= speed;
        
        if (checkCollision(player, item)) {
            scoreCallback(item);
            return false;
        }
        
        return item.x > -item.width;
    });
}

// 스테이지 전환 업데이트
export function updateStageTransition(state) {
    // 선형 보간(Linear Interpolation)을 통한 부드러운 전환
    // progress = current + (target - current) * speed
    if (!state.stageTransitioning) return false;
    
    state.stageTransitionProgress += state.stageTransitionSpeed;
    
    if (state.stageTransitionProgress >= 100) {
        state.stageTransitioning = false;
        state.stageTransitionProgress = 0;
        state.currentStage++;
        
        if (state.currentStage > 6) {
            state.currentStage = 6;
        }
        
        return true;
    }
    
    return false;
}

// 전체 게임 물리 업데이트
export function updateGamePhysics(gameState, callbacks) {
    const { 
        onObstacleCollision, onItemCollected,
        onStageChanged, onGameOver
    } = callbacks;
    
    // 시차 스크롤링(Parallax Scrolling): 상대 운동 원리 적용
    gameState.backgroundX -= 2;
    
    // 스테이지 전환 상태 업데이트
    if (gameState.stageTransitioning) {
        const stageCompleted = updateStageTransition(gameState);
        if (stageCompleted && onStageChanged) {
            onStageChanged(gameState.currentStage);
        }
    }
    
    // 플레이어 물리 상태 업데이트
    const isGameOver = updatePlayerPhysics(gameState.player, gameState.canvas);
    if (isGameOver) {
        if (onGameOver) onGameOver();
        return true;
    }
    
    // 상대 속도 최적화: 모바일과 데스크톱 환경에 따른 속도 조정
    const obstacleSpeed = gameState.isMobile ? 6 : 5;
    const itemSpeed = gameState.isMobile ? 4 : 3;
    
    // 장애물과 아이템의 물리 상태 업데이트
    gameState.obstacles = updateObstacles(
        gameState.obstacles, 
        gameState.player, 
        obstacleSpeed, 
        () => {
            if (onObstacleCollision) onObstacleCollision();
        }
    );
    
    gameState.items = updateItems(
        gameState.items,
        gameState.player,
        itemSpeed,
        (item) => {
            if (onItemCollected) onItemCollected(item);
        }
    );
    
    return false;
} 