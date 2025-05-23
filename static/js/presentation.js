// 발표용 리더보드 스크립트
document.addEventListener('DOMContentLoaded', function() {
    // 자동 새로고침 (15초마다 - 스크롤 시간 고려)
    const REFRESH_INTERVAL = 15000; // 15초
    const SCROLL_INTERVAL = 8000; // 8초마다 스크롤
    const SCROLL_DURATION = 3000; // 스크롤 애니메이션 지속 시간
    const SCROLL_PAUSE = 2000; // 스크롤 후 대기 시간
    
    let refreshTimer;
    let scrollTimer;
    let isScrolling = false;
    let currentScrollPosition = 0;
    
    function setupAutoRefresh() {
        refreshTimer = setInterval(fetchLatestLeaderboard, REFRESH_INTERVAL);
    }
    
    function setupAutoScroll() {
        scrollTimer = setInterval(performAutoScroll, SCROLL_INTERVAL);
    }
    
    function performAutoScroll() {
        if (isScrolling) return;
        
        const leaderboardContent = document.querySelector('.leaderboard-content');
        const leaderboardGrid = document.querySelector('.leaderboard-grid');
        
        if (!leaderboardContent || !leaderboardGrid) return;
        
        const contentHeight = leaderboardContent.scrollHeight;
        const visibleHeight = leaderboardContent.clientHeight;
        
        // 스크롤할 필요가 없는 경우 (콘텐츠가 화면에 다 보이는 경우)
        if (contentHeight <= visibleHeight) {
            return;
        }
        
        isScrolling = true;
        
        // 현재 위치에서 아래로 스크롤할지, 위로 돌아갈지 결정
        const maxScroll = contentHeight - visibleHeight;
        const isAtBottom = currentScrollPosition >= maxScroll - 10; // 여유값 10px
        
        let targetPosition;
        if (isAtBottom) {
            // 맨 아래에 있으면 맨 위로
            targetPosition = 0;
        } else {
            // 그렇지 않으면 아래로 스크롤 (한 번에 화면 높이의 80% 정도)
            targetPosition = Math.min(
                currentScrollPosition + (visibleHeight * 0.8),
                maxScroll
            );
        }
        
        smoothScrollTo(leaderboardContent, targetPosition, SCROLL_DURATION, () => {
            currentScrollPosition = targetPosition;
            setTimeout(() => {
                isScrolling = false;
            }, SCROLL_PAUSE);
        });
    }
    
    function smoothScrollTo(element, targetPosition, duration, callback) {
        const startPosition = element.scrollTop;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();
        
        function animation(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // easeInOutCubic 함수로 부드러운 애니메이션
            const easeInOutCubic = progress < 0.5 
                ? 4 * progress * progress * progress 
                : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
            
            element.scrollTop = startPosition + (distance * easeInOutCubic);
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            } else if (callback) {
                callback();
            }
        }
        
        requestAnimationFrame(animation);
    }
    
    function fetchLatestLeaderboard() {
        fetch('/game/api/get-leaderboard/')
            .then(response => response.json())
            .then(data => {
                if (data.leaderboard && data.leaderboard.length > 0) {
                    updateLeaderboardUI(data.leaderboard);
                }
            })
            .catch(error => {
                console.error('리더보드 데이터 로드 실패:', error);
            });
    }
    
    function updateLeaderboardUI(leaderboardData) {
        const leaderboardGrid = document.querySelector('.leaderboard-grid');
        if (!leaderboardGrid) return;
        
        // 스크롤 위치 임시 저장
        const leaderboardContent = document.querySelector('.leaderboard-content');
        const savedScrollPosition = leaderboardContent ? leaderboardContent.scrollTop : 0;
        
        // 기존 항목 제거
        leaderboardGrid.innerHTML = '';
        
        // 새 항목 추가
        leaderboardData.forEach((score, index) => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            // 순위에 따른 클래스 추가
            if (index === 0) {
                playerCard.classList.add('first-place');
            } else if (index === 1) {
                playerCard.classList.add('second-place');
            } else if (index === 2) {
                playerCard.classList.add('third-place');
            }
            
            // 카드 내용 구성
            playerCard.innerHTML = `
                <div class="rank">${index + 1}</div>
                <div class="player-avatar">
                    <div class="avatar-container">
                        <img src="/static/assets/character/duck.png" alt="캐릭터" class="character-base">
                        ${score.customization.outfit !== 'default' && score.customization.outfit !== 'none' ? 
                            `<img src="/static/assets/customization/${score.customization.outfit}.png" alt="의상" class="character-outfit">` : ''}
                        ${score.customization.hat !== 'none' ? 
                            `<img src="/static/assets/customization/${score.customization.hat}.png" alt="모자" class="character-hat">` : ''}
                        ${score.customization.shoes !== 'default' && score.customization.shoes !== 'none' ? 
                            `<img src="/static/assets/customization/${score.customization.shoes}.png" alt="신발" class="character-shoes">` : ''}
                    </div>
                </div>
                <div class="player-info">
                    <h3 class="nickname" title="${score.nickname}">${score.nickname}</h3>
                    <div class="score-info">
                        <span class="score">${score.score}점</span>
                        <span class="time">${score.time}초</span>
                    </div>
                </div>
            `;
            
            // 애니메이션 효과 (등장 지연)
            playerCard.style.opacity = '0';
            playerCard.style.transform = 'translateY(20px)';
            playerCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            leaderboardGrid.appendChild(playerCard);
            
            // 지연 애니메이션 적용
            setTimeout(() => {
                playerCard.style.opacity = '1';
                playerCard.style.transform = 'translateY(0)';
            }, 50 * index);
        });
        
        // 항목이 없을 경우
        if (leaderboardData.length === 0) {
            const emptyNotice = document.createElement('div');
            emptyNotice.className = 'no-records';
            emptyNotice.textContent = '아직 기록이 없습니다. 첫 번째 졸업자가 되어보세요!';
            leaderboardGrid.appendChild(emptyNotice);
        }
        
        // 스크롤 위치 복원 (새로고침으로 인한 위치 리셋 방지)
        if (leaderboardContent && !isScrolling) {
            leaderboardContent.scrollTop = savedScrollPosition;
            currentScrollPosition = savedScrollPosition;
        }
    }
    
    // 수동 스크롤 감지 (사용자가 수동으로 스크롤했을 때 위치 동기화)
    function handleManualScroll() {
        const leaderboardContent = document.querySelector('.leaderboard-content');
        if (leaderboardContent && !isScrolling) {
            currentScrollPosition = leaderboardContent.scrollTop;
        }
    }
    
    // 초기 설정
    setupAutoRefresh();
    setupAutoScroll();
    
    // 수동 스크롤 이벤트 리스너
    const leaderboardContent = document.querySelector('.leaderboard-content');
    if (leaderboardContent) {
        leaderboardContent.addEventListener('scroll', handleManualScroll);
    }
    
    // 페이지 이탈시 타이머 정리
    window.addEventListener('beforeunload', function() {
        clearInterval(refreshTimer);
        clearInterval(scrollTimer);
    });
    
    // 마우스 호버 시 스크롤 일시 정지
    const presentationContainer = document.querySelector('.presentation-container');
    if (presentationContainer) {
        presentationContainer.addEventListener('mouseenter', function() {
            clearInterval(scrollTimer);
        });
        
        presentationContainer.addEventListener('mouseleave', function() {
            setupAutoScroll();
        });
    }
    
    // 전체화면 토글 (F11 키)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F11') {
            toggleFullScreen();
            e.preventDefault();
        }
        
        // 스페이스바로 자동 스크롤 토글
        if (e.code === 'Space') {
            if (scrollTimer) {
                clearInterval(scrollTimer);
                scrollTimer = null;
                console.log('자동 스크롤 정지');
            } else {
                setupAutoScroll();
                console.log('자동 스크롤 시작');
            }
            e.preventDefault();
        }
    });
    
    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
}); 