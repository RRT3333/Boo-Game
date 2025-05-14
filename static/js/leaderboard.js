// 리더보드 페이지 스크립트
document.addEventListener('DOMContentLoaded', function() {
    // 리더보드 자동 새로고침 (30초마다)
    let refreshTimer;
    
    function setupAutoRefresh() {
        refreshTimer = setInterval(fetchLatestLeaderboard, 30000);
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
        const leaderboardTable = document.querySelector('.leaderboard-table tbody');
        if (!leaderboardTable) return;
        
        // 기존 항목 제거
        leaderboardTable.innerHTML = '';
        
        // 새 항목 추가
        leaderboardData.forEach((score, index) => {
            const row = document.createElement('tr');
            
            // 순위에 따른 클래스 추가
            if (index === 0) {
                row.classList.add('first-place');
            } else if (index === 1) {
                row.classList.add('second-place');
            } else if (index === 2) {
                row.classList.add('third-place');
            }
            
            // 스테이지 이름 변환
            let stageName;
            switch(score.stage) {
                case 1: stageName = '교양관'; break;
                case 2: stageName = '명수당'; break;
                case 3: stageName = '공대'; break;
                case 4: stageName = '백년관'; break;
                case 5: stageName = '기숙사'; break;
                case 6: stageName = '정문(졸업)'; break;
                default: stageName = '교양관';
            }
            
            // 행 내용 구성
            row.innerHTML = `
                <td class="rank">${index + 1}</td>
                <td class="avatar">
                    <div class="avatar-container">
                        <img src="/static/assets/character/duck.png" alt="캐릭터" class="character-base">
                        ${score.customization.outfit !== 'default' ? 
                            `<img src="/static/assets/customization/${score.customization.outfit}.png" alt="의상" class="character-outfit">` : ''}
                        ${score.customization.hat !== 'none' ? 
                            `<img src="/static/assets/customization/${score.customization.hat}.png" alt="모자" class="character-hat">` : ''}
                        ${score.customization.shoes !== 'default' ? 
                            `<img src="/static/assets/customization/${score.customization.shoes}.png" alt="신발" class="character-shoes">` : ''}
                    </div>
                </td>
                <td class="nickname">${score.nickname}</td>
                <td class="score">${score.score}점</td>
                <td class="time">${score.time}초</td>
                <td class="stage">${stageName}</td>
            `;
            
            leaderboardTable.appendChild(row);
        });
        
        // 항목이 없을 경우
        if (leaderboardData.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `
                <td colspan="6" class="no-records">아직 기록이 없습니다. 첫 번째 졸업자가 되어보세요!</td>
            `;
            leaderboardTable.appendChild(emptyRow);
        }
    }
    
    // 초기 설정
    setupAutoRefresh();
    
    // 페이지 이탈시 타이머 정리
    window.addEventListener('beforeunload', function() {
        clearInterval(refreshTimer);
    });
    
    // 리더보드 항목에 호버 이벤트
    const leaderboardRows = document.querySelectorAll('.leaderboard-table tbody tr');
    leaderboardRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.classList.add('highlight');
        });
        
        row.addEventListener('mouseleave', function() {
            this.classList.remove('highlight');
        });
    });
    
    // 모바일에서 QR 코드 토글 기능
    const qrToggle = document.querySelector('.toggle-qr-mobile');
    const qrCodeImage = document.querySelector('.qr-code-image');
    
    if (qrToggle && qrCodeImage) {
        // 모바일인 경우 기본적으로 QR코드 숨기기
        if (window.innerWidth <= 500) {
            qrCodeImage.classList.remove('show');
        } else {
            qrCodeImage.classList.add('show');
        }
        
        qrToggle.addEventListener('click', function() {
            qrCodeImage.classList.toggle('show');
            qrToggle.textContent = qrCodeImage.classList.contains('show') ? '▲' : '▼';
        });
    }
    
    // 창 크기 변경 감지
    window.addEventListener('resize', function() {
        if (qrCodeImage) {
            if (window.innerWidth <= 500) {
                if (!qrToggle.classList.contains('clicked')) {
                    qrCodeImage.classList.remove('show');
                    qrToggle.textContent = '▼';
                }
            } else {
                qrCodeImage.classList.add('show');
                qrToggle.textContent = '▲';
            }
        }
    });
}); 