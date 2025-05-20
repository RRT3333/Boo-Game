/**
 * 게임 렌더링 관련 모듈
 * 게임 내 모든 요소의 렌더링을 담당합니다.
 */

// 게임 배경 그리기
export function drawBackground(ctx, isMobile, canvas, backgroundX, images, currentStage, stageTransitioning, stageTransitionProgress) {
    // 기본 하늘 배경 그리기
    ctx.fillStyle = '#87CEEB';  // 하늘색으로 변경
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 세로 모드에서는 배경 크기와 위치 조정
    let bgHeight, bgY;
    
    if (isMobile) {
        // 모바일 세로 모드: 화면 하단에 배경 이미지 표시
        bgHeight = canvas.height * 0.5;  // 화면 높이의 50%
        bgY = canvas.height - bgHeight;   // 하단에 배치
    } else {
        // 데스크톱 가로 모드: 기존 비율 유지
        bgHeight = canvas.height * 0.7;  // 화면 높이의 70%
        bgY = canvas.height - bgHeight;  // 하단에 배치
    }
    
    // 전환 중이 아니면 현재 스테이지 배경만 그림
    if (!stageTransitioning) {
        // 현재 스테이지 배경 (0부터 시작하므로 -1)
        const currentBg = images.backgrounds[currentStage - 1];
        
        // 배경 이미지 반복 그리기 (무한 스크롤)
        if (currentBg && currentBg.complete) {
            drawSingleBackground(ctx, currentBg, isMobile, canvas, backgroundX, bgY, bgHeight, 0.8);
        }
    } else {
        // 전환 중일 때는 두 배경을 블렌딩 (세로 모드에도 동일하게 적용)
        const currentBg = images.backgrounds[currentStage - 1];
        const nextBg = images.backgrounds[currentStage];
        
        // 현재 배경과 다음 배경 모두 세로 모드에 맞게 조정
        drawTransitionBackground(ctx, currentBg, nextBg, isMobile, canvas, backgroundX, bgY, bgHeight, stageTransitionProgress);
    }
}

// 단일 배경 그리기
function drawSingleBackground(ctx, bgImage, isMobile, canvas, backgroundX, bgY, bgHeight, alpha) {
    // 불투명도 설정
    ctx.globalAlpha = alpha;
    
    // 이미지 비율 유지
    const bgRatio = bgImage.naturalWidth / bgImage.naturalHeight;
    let renderWidth, renderHeight;
    
    // 세로 모드에서 크기 조정 - 비율 유지하면서 맞추기
    if (isMobile) {
        // 세로 모드에서는 높이를 기준으로 너비 계산하여 비율 유지
        renderHeight = bgHeight;
        renderWidth = renderHeight * bgRatio;
        
        // 너비가 화면보다 작으면 화면 너비에 맞추고 높이 조정
        if (renderWidth < canvas.width) {
            renderWidth = canvas.width;
            renderHeight = renderWidth / bgRatio;
        }
    } else {
        // 데스크톱에서는 기존 로직 유지
        renderWidth = canvas.width;
        renderHeight = renderWidth / bgRatio;
        
        // 높이가 설정한 영역보다 작으면 높이에 맞춤
        if (renderHeight < bgHeight) {
            renderHeight = bgHeight;
            renderWidth = renderHeight * bgRatio;
        }
    }
    
    // X 오프셋 계산 (이미지 중앙 정렬)
    const xOffset = (renderWidth - canvas.width) / 2;
    
    // 정확한 반복 간격 계산
    const actualWidth = renderWidth;
    
    // 모듈로 연산자 사용하여 정확한 위치 계산 (backgroundX 값이 계속 감소해도 순환하도록)
    let x1 = (backgroundX % actualWidth) - xOffset;
    if (x1 > 0) x1 -= actualWidth;
    
    // 화면을 완전히 채울 만큼 이미지 반복
    while (x1 < canvas.width) {
        ctx.drawImage(
            bgImage, 
            x1, bgY, 
            renderWidth, renderHeight
        );
        x1 += actualWidth;
    }
    
    // 알파값 초기화
    ctx.globalAlpha = 1;
}

// 배경 전환 그리기
function drawTransitionBackground(ctx, currentBg, nextBg, isMobile, canvas, backgroundX, bgY, bgHeight, transitionProgress) {
    if (currentBg && currentBg.complete) {
        // 현재 배경 알파 계산 (80% 기준으로 페이드 아웃)
        const alpha = (1 - (transitionProgress / 100)) * 0.8;
        drawSingleBackground(ctx, currentBg, isMobile, canvas, backgroundX, bgY, bgHeight, alpha);
    }
    
    // 다음 배경 그리기
    if (nextBg && nextBg.complete) {
        // 다음 배경 알파 계산 (80% 기준으로 페이드 인)
        const alpha = (transitionProgress / 100) * 0.8;
        drawSingleBackground(ctx, nextBg, isMobile, canvas, backgroundX, bgY, bgHeight, alpha);
    }
}

// 플레이어 그리기
export function drawPlayer(ctx, player, images, customization) {
    // 기본 캐릭터 이미지
    const characterImg = player.isFlying ? images.flyingCharacter : images.character;
    ctx.drawImage(
        characterImg,
        player.x, 
        player.y, 
        player.width, 
        player.height
    );
    
    // 커스터마이징 아이템 그리기
    // 의상 그리기 - 날고 있는지 여부에 따라 다른 의상 적용
    if (customization.outfit !== 'default') {
        // 날고 있는 상태인지에 따라 다른 의상 이미지 사용
        const outfitImg = player.isFlying && images.customization.flyingOutfit.complete ? 
                        images.customization.flyingOutfit : 
                        images.customization.outfit;
        
        if (outfitImg.complete) {
            ctx.drawImage(
                outfitImg,
                player.x,
                player.y,
                player.width,
                player.height
            );
        }
    }
    
    // 모자 그리기
    if (customization.hat !== 'none' && images.customization.hat.complete) {
        // 비니 모자일 경우 2픽셀 더 내림
        const hatYOffset = customization.hat === 'beanie' ? 4 : 2;
        
        ctx.drawImage(
            images.customization.hat,
            player.x,
            player.y + hatYOffset, // 모자별 위치 조정
            player.width,
            42 // 모자 높이 조정 (비율 유지)
        );
    }
    
    // 신발 그리기
    if (customization.shoes !== 'default' && images.customization.shoes.complete) {
        ctx.drawImage(
            images.customization.shoes,
            player.x,
            player.y + player.height - 21, // 발 위치에 맞춤 (비율 유지)
            player.width,
            21 // 신발 높이 조정 (비율 유지)
        );
    }
}

// 장애물 그리기
export function drawObstacles(ctx, obstacles, images) {
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'F') {
            ctx.drawImage(
                images.fGrade,
                obstacle.x, 
                obstacle.y, 
                obstacle.width, 
                obstacle.height
            );
        } else {
            ctx.fillStyle = '#000000';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            if (typeof obstacle.type === 'string' && obstacle.type) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '20px Arial';
                ctx.fillText(obstacle.type, 
                    obstacle.x + 15, 
                    obstacle.y + 25);
            }
        }
    });
}

// 아이템 그리기
export function drawItems(ctx, items, images) {
    items.forEach(item => {
        if (item.type === 'A+') {
            ctx.drawImage(
                images.aPlus,
                item.x, 
                item.y, 
                item.width, 
                item.height
            );
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(item.x, item.y, item.width, item.height);
            if (typeof item.type === 'string' && item.type) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '16px Arial';
                ctx.fillText(item.type, 
                    item.x + 5, 
                    item.y + 20);
            }
        }
    });
}

// 교수님 그리기
export function drawProfessor(ctx, isMobile, professorData, canvas, images) {
    if (!professorData.isActive) return;
    
    const { professorX, professorWidth, professorHeight } = professorData;
    
    // 화면 높이에 따라 교수님 위치 조정 (모바일에서 잘리지 않도록)
    const bottomMargin = isMobile ? 20 : 20;
    const professorY = canvas.height - professorHeight - bottomMargin;
    
    ctx.drawImage(
        images.professor,
        professorX, 
        professorY, 
        professorWidth, 
        professorHeight
    );
    
    // 교수님이 화면에 완전히 보일 때만 말풍선 표시
    if (professorX > 0 && professorX < canvas.width - professorWidth/2) {
        // DOM으로 말풍선 생성 또는 업데이트 (한 번만 생성)
        let speechBubble = document.querySelector('.professor-speech');
        
        if (!speechBubble) {
            speechBubble = document.createElement('div');
            speechBubble.className = 'professor-speech';
            
            // 말풍선 메시지 변경 - 교수님 한마디로
            speechBubble.textContent = "자네 대학원 올 생각 없나?";
            
            // DOM에 추가
            document.querySelector('.game-container').appendChild(speechBubble);
        }
        
        // 모바일에서는 교수님 위에 말풍선 배치, 데스크톱에서는 오른쪽에 배치
        if (isMobile) {
            // 모바일에서 교수님 이미지의 중앙 상단에 위치하도록 설정
            const bubbleLeft = professorX + (professorWidth / 2) - 100; // 말풍선 폭의 절반만큼 왼쪽으로 이동
            
            // 말풍선이 화면 밖으로 나가지 않도록 조정
            const maxLeft = canvas.width - 200; // 모바일에서 말풍선 최대 폭 200px
            const minLeft = 10; // 최소 여백
            const adjustedLeft = Math.min(Math.max(bubbleLeft, minLeft), maxLeft);
            
            speechBubble.style.left = adjustedLeft + 'px';
            // 교수님 이미지 위에 표시 (교수님 상단에서 말풍선 높이 + 여백만큼 위로)
            speechBubble.style.bottom = (canvas.height - professorY + 20) + 'px';
            
            // 말풍선 꼬리 위치 조정을 위한 클래스 추가
            speechBubble.classList.add('mobile-position');
        } else {
            // 데스크톱에서는 기존 방식 유지 (오른쪽에 배치)
            const bubbleLeft = professorX + professorWidth - 50;
            
            // 말풍선이 화면 밖으로 나가지 않도록 조정
            const maxLeft = canvas.width - 250;
            const adjustedLeft = Math.min(bubbleLeft, maxLeft);
            
            speechBubble.style.left = adjustedLeft + 'px';
            speechBubble.style.bottom = '150px';
            
            // 모바일 위치 클래스 제거
            speechBubble.classList.remove('mobile-position');
        }
    } else {
        // 교수님이 화면 밖으로 나가면 말풍선 제거
        const speechBubble = document.querySelector('.professor-speech');
        if (speechBubble) {
            speechBubble.remove();
        }
    }
}

// 카운트다운 그리기
export function drawCountdown(ctx, canvas) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 게임 전체 그리기
export function drawGame(ctx, gameState, images) {
    const { 
        canvas, isMobile, player, customization, obstacles, items, 
        backgroundX, currentStage, stageTransitioning, stageTransitionProgress,
        professorData
    } = gameState;
    
    // 화면 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 배경 그리기
    drawBackground(ctx, isMobile, canvas, backgroundX, images, currentStage, 
                   stageTransitioning, stageTransitionProgress);
    
    // 플레이어 그리기
    drawPlayer(ctx, player, images, customization);
    
    // 장애물 그리기
    drawObstacles(ctx, obstacles, images);
    
    // 아이템 그리기
    drawItems(ctx, items, images);
    
    // 교수님 그리기 (활성화된 경우)
    if (professorData && professorData.isActive) {
        drawProfessor(ctx, isMobile, professorData, canvas, images);
    }
} 