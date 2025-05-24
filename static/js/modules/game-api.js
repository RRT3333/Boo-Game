/**
 * 게임 API 관련 모듈
 * 서버와의 통신 및 게임 데이터 저장을 담당합니다.
 */

// CSRF 토큰 가져오기
export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// 게임 결과 저장
export function saveGameResult(gameState, nickname) {
    // PLAYER_ID 유효성 검사
    const playerId = window.PLAYER_ID || '';
    
    // 문자열 값 안전 변환 
    const safeString = (value, defaultValue = '') => {
        return value !== undefined && value !== null ? String(value) : defaultValue;
    };
    
    // 숫자 값 안전 변환
    const safeNumber = (value, defaultValue = 0) => {
        const num = parseInt(value, 10);
        return !isNaN(num) ? num : defaultValue;
    };
    
    // 게임 데이터 수집 및 유효성 검사
    const gameData = {
        player_id: safeString(playerId),
        score: safeNumber(gameState.score),
        play_time: safeNumber(gameState.timeLeft),
        max_stage: safeNumber(gameState.currentStage, 1),
        items_collected: safeNumber(gameState.itemsCollected),
        obstacles_avoided: safeNumber(gameState.obstaclesAvoided),
        max_combo: safeNumber(gameState.maxCombo),
        nickname: safeString(nickname, '익명의 학생')
    };
    
    console.log('게임 결과 저장:', gameData);
    
    return fetch('/game/api/save-score/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(gameData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status}`);
        }
        return response.json();
    })
    .catch(error => {
        console.error('점수 저장 오류:', error);
        return { status: 'error', message: error.message };
    });
}

// 닉네임 업데이트
export function updateNickname(playerId, nickname) {
    return fetch('/game/api/update-nickname/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            player_id: playerId,
            nickname: nickname
        })
    })
    .then(res => res.json())
    .catch(error => {
        console.error('닉네임 업데이트 오류:', error);
        return { status: 'error', message: error.message };
    });
}

// 닉네임 저장 버튼 이벤트 핸들러
export function setupNicknameButton(sounds, playerId) {
    const saveBtn = document.getElementById('saveNicknameBtn');
    if (saveBtn) {
        saveBtn.onclick = () => {
            const nicknameInput = document.getElementById('gameOverNickname');
            const inputValue = nicknameInput.value.trim();
            const placeholder = nicknameInput.placeholder || '익명의 학생';
            const nickname = inputValue || placeholder;
            
            // 버튼 애니메이션
            saveBtn.classList.add('active');
            
            // 저장 사운드 재생
            if (sounds) {
                import('./game-audio.js').then(audio => {
                    audio.playSound(sounds, 'save');
                });
            }
            
            // 닉네임 업데이트
            updateNickname(playerId, nickname).then(data => {
                setTimeout(() => {
                    if (saveBtn) saveBtn.classList.remove('active');
                    
                    if (data.status === 'success') {
                        // 성공 메시지 표시
                        const hintEl = document.querySelector('.retro-hint');
                        if (hintEl) {
                            hintEl.textContent = '* 이름이 저장되었습니다!';
                            hintEl.style.color = '#00DDFF'; // 청록색으로 변경
                        }
                    } else {
                        alert('이름 저장 실패: ' + data.message);
                    }
                }, 200);
            });
        };
    }
} 