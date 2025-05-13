// 발표용 리더보드 스크립트
document.addEventListener('DOMContentLoaded', function() {
    // 자동 새로고침 (10초마다)
    const REFRESH_INTERVAL = 10000; // 10초
    let refreshTimer;
    
    function setupAutoRefresh() {
        refreshTimer = setInterval(fetchLatestLeaderboard, REFRESH_INTERVAL);
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
                        ${score.customization.outfit !== 'default' ? 
                            `<img src="/static/assets/customization/${score.customization.outfit}.png" alt="의상" class="character-outfit">` : ''}
                        ${score.customization.hat !== 'none' ? 
                            `<img src="/static/assets/customization/${score.customization.hat}.png" alt="모자" class="character-hat">` : ''}
                        ${score.customization.shoes !== 'default' ? 
                            `<img src="/static/assets/customization/${score.customization.shoes}.png" alt="신발" class="character-shoes">` : ''}
                    </div>
                </div>
                <div class="player-info">
                    <h3 class="nickname">${score.nickname}</h3>
                    <div class="score-info">
                        <span class="score">${score.score}점</span>
                        <span class="time">${score.time}초</span>
                    </div>
                </div>
            `;
            
            // 애니메이션 효과 (등장 지연)
            playerCard.style.opacity = '0';
            playerCard.style.transform = 'translateY(20px)';
            
            leaderboardGrid.appendChild(playerCard);
            
            // 지연 애니메이션 적용
            setTimeout(() => {
                playerCard.style.opacity = '1';
                playerCard.style.transform = 'translateY(0)';
            }, 100 * index);
        });
        
        // 항목이 없을 경우
        if (leaderboardData.length === 0) {
            const emptyNotice = document.createElement('div');
            emptyNotice.className = 'no-records';
            emptyNotice.textContent = '아직 기록이 없습니다. 첫 번째 졸업자가 되어보세요!';
            leaderboardGrid.appendChild(emptyNotice);
        }
    }
    
    // 초기 설정
    setupAutoRefresh();
    
    // 페이지 이탈시 타이머 정리
    window.addEventListener('beforeunload', function() {
        clearInterval(refreshTimer);
    });
    
    // 전체화면 토글 (F11 키 또는 ESC 키)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F11') {
            toggleFullScreen();
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