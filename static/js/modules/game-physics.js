/**
 * 게임 물리 관련 모듈
 * 게임 내 모든 물리 엔진과 상태 업데이트를 담당합니다.
 * 
 * 주요 물리 개념:
 * 1. 등가속도 운동 - 중력에 의한 가속도 운동 (v = v0 + at)
 * 2. 속도와 변위 관계 - 속도에 따른 위치 변화 (Δx = vΔt)
 * 3. 충돌 감지 - 두 물체의 경계 상자(Bounding Box) 교차 여부 확인
 * 4. 상대 속도 - 배경과 물체의 상대적인 움직임
 * 5. 시간 기반 물리 - 프레임 속도와 무관한 일관된 물리 구현
 */

import { checkCollision } from './game-entities.js';

// 기본 물리 상수
const BASE_PHYSICS = {
    gravity: 0.6,           // 기본 중력 가속도
    jumpForce: -12,         // 기본 점프력
    baseObstacleSpeed: 5,   // 기본 장애물 속도
    baseItemSpeed: 3,       // 기본 아이템 속도
    backgroundSpeed: 2      // 기본 배경 속도
};

// 플레이어 물리 업데이트
export function updatePlayerPhysics(player, canvas, deltaTime = 1/60) {
    // 시간 기반 물리: deltaTime을 사용하여 프레임 속도와 독립적인 물리 구현
    const timeScale = deltaTime * 60; // 60fps 기준으로 정규화
    
    // 중력 가속도에 의한 속도 변화: v = v0 + at
    player.velocity += player.gravity * timeScale;
    
    // 속도에 따른 위치 변화: Δy = vΔt
    player.y += player.velocity * timeScale;
    
    // 운동 방향에 따른 상태 변화
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
export function updateObstacles(obstacles, player, speed, healthCallback, deltaTime = 1/60) {
    let collisionDetected = false;
    
    // 시간 기반 이동: 속도 * 경과 시간
    const timeScale = deltaTime * 60; // 60fps 기준으로 정규화
    const scaledSpeed = speed * timeScale;
    
    // 등속 운동: x = x0 - vt (왼쪽으로 이동하므로 음의 속도)
    return obstacles.filter(obstacle => {
        obstacle.x -= scaledSpeed;
        
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
export function updateItems(items, player, speed, scoreCallback, deltaTime = 1/60) {
    // 시간 기반 이동: 속도 * 경과 시간
    const timeScale = deltaTime * 60; // 60fps 기준으로 정규화
    const scaledSpeed = speed * timeScale;
    
    // 장애물과 동일한 등속 운동 원리 적용
    return items.filter(item => {
        item.x -= scaledSpeed;
        
        if (checkCollision(player, item)) {
            scoreCallback(item);
            return false;
        }
        
        return item.x > -item.width;
    });
}

// 스테이지 전환 업데이트
export function updateStageTransition(state, deltaTime = 1/60) {
    // 시간 기반 전환: 속도 * 경과 시간
    const timeScale = deltaTime * 60; // 60fps 기준으로 정규화
    
    // 선형 보간(Linear Interpolation)을 통한 부드러운 전환
    // progress = current + (target - current) * speed
    if (!state.stageTransitioning) return false;
    
    state.stageTransitionProgress += state.stageTransitionSpeed * timeScale;
    
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
    
    // 델타 타임 처리 (기본값 = 1/60초)
    const deltaTime = gameState.deltaTime || 1/60;
    
    // 시간 기반 스크롤링(Parallax Scrolling): 시간에 따른 상대 운동
    const timeScale = deltaTime * 60; // 60fps 기준으로 정규화
    gameState.backgroundX -= BASE_PHYSICS.backgroundSpeed * timeScale;
    
    // 스테이지 전환 상태 업데이트
    if (gameState.stageTransitioning) {
        const stageCompleted = updateStageTransition(gameState, deltaTime);
        if (stageCompleted && onStageChanged) {
            onStageChanged(gameState.currentStage);
        }
    }
    
    // 플레이어 물리 상태 업데이트
    const isGameOver = updatePlayerPhysics(gameState.player, gameState.canvas, deltaTime);
    if (isGameOver) {
        if (onGameOver) onGameOver();
        return true;
    }
    
    // 상대 속도 최적화: 모바일과 데스크톱 환경에 따른 속도 조정
    // 속도 승수 적용하여 시간에 따라 장애물 속도 증가
    const baseObstacleSpeed = gameState.isMobile ? 6 : 5;
    const obstacleSpeed = baseObstacleSpeed * (gameState.obstacleSpeedMultiplier || 1.0);
    const itemSpeed = gameState.isMobile ? 4 : 3;
    
    // 장애물과 아이템의 물리 상태 업데이트 - 델타 타임 전달
    gameState.obstacles = updateObstacles(
        gameState.obstacles, 
        gameState.player, 
        obstacleSpeed, 
        () => {
            if (onObstacleCollision) onObstacleCollision();
        },
        deltaTime
    );
    
    gameState.items = updateItems(
        gameState.items,
        gameState.player,
        itemSpeed,
        (item) => {
            if (onItemCollected) onItemCollected(item);
        },
        deltaTime
    );
    
    return false;
} 