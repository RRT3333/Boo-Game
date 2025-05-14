/**
 * 게임 엔티티 관련 모듈
 * 플레이어, 장애물, 아이템 등의 객체를 관리합니다.
 */

// 플레이어 기본 설정
export function createPlayer(isMobile, canvasHeight) {
    return {
        x: isMobile ? 80 : 100, // 모바일에서는 왼쪽에 더 가깝게
        y: isMobile ? canvasHeight * 0.4 : 300, // 모바일에서는 화면 상단 40% 위치
        width: 70,
        height: 70,
        velocity: 0,
        gravity: 0.5, // 모든 환경에서 동일한 중력 적용
        jumpForce: -10, // 모든 환경에서 동일한 점프력 적용
        isFlying: false
    };
}

// 장애물 생성
export function createObstacle(isMobile, canvasWidth, canvasHeight) {
    // 세로 모드에서는 화면 오른쪽 전체에서 생성
    const yPos = isMobile ? 
        Math.random() * (canvasHeight - 60) : // 모바일(세로)
        Math.random() * (canvasHeight - 40);  // 데스크톱(가로)
    
    return {
        x: canvasWidth,
        y: yPos,
        width: 40, // 크기 일관성 유지
        height: 40,
        type: 'F'
    };
}

// 아이템 생성
export function createItem(isMobile, canvasWidth, canvasHeight) {
    // 세로 모드에서는 화면 오른쪽 전체에서 생성
    const yPos = isMobile ? 
        Math.random() * (canvasHeight - 50) : // 모바일(세로)
        Math.random() * (canvasHeight - 30);  // 데스크톱(가로)
    
    return {
        x: canvasWidth,
        y: yPos,
        width: 30, // 크기 일관성 유지
        height: 30,
        type: 'A+'
    };
}

// 충돌 검사
export function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect2.height > rect2.y;
}

// 교수님 애니메이션 관련 상태 업데이트
export function updateProfessorAnimation(professorState, canvas, elapsedTime) {
    const {animationStart, animationDuration} = professorState;
    const elapsed = elapsedTime - animationStart;
    
    // 교수님 크기 계산 - 모바일에서는 화면에 맞게 조정
    const isMobile = canvas.width <= 800;
    const professorWidth = isMobile ? 
        Math.min(180, canvas.width * 0.35) : 200; // 모바일에서 더 크게 표시
    const professorHeight = isMobile ? 
        Math.min(180, canvas.height * 0.35) : 200; // 모바일에서 더 크게 표시
    
    let professorX = -professorWidth;
    let isActive = true;
    let fSpawnRateIncrease = false;
    
    if (elapsed < animationDuration) {
        // 처음 1/3 동안 등장
        if (elapsed < animationDuration / 3) {
            // 화면 중앙으로 이동 (화면 너비/2 - 교수님 이미지 너비/2)
            const centerX = canvas.width / 2 - professorWidth / 2;
            professorX = Math.min(centerX, -professorWidth + (elapsed / (animationDuration/3)) * (centerX + professorWidth));
        } 
        // 1/3 ~ 2/3 동안 유지
        else if (elapsed < animationDuration * 2/3) {
            // 화면 중앙에 위치 (모바일에서는 약간 왼쪽으로)
            professorX = isMobile ? 
                canvas.width / 2 - professorWidth * 0.6 : // 모바일에서 더 중앙에 가깝게
                canvas.width / 2 - professorWidth / 2;
        }
        // 마지막 1/3 동안 퇴장
        else {
            const reverseElapsed = elapsed - (animationDuration * 2/3);
            const startX = isMobile ? 
                canvas.width / 2 - professorWidth * 0.6 : // 모바일에서 더 중앙에 가깝게 
                canvas.width / 2 - professorWidth / 2;
            professorX = startX - (reverseElapsed / (animationDuration/3)) * (startX + professorWidth);
        }
    } else {
        isActive = false;
        professorX = -professorWidth; // 화면 밖으로
        fSpawnRateIncrease = true; // 교수님 사라진 후 F 확률 증가
    }
    
    return {
        professorX,
        professorWidth,
        professorHeight,
        isActive,
        fSpawnRateIncrease
    };
} 