// 커스터마이징 페이지 스크립트
document.addEventListener('DOMContentLoaded', function() {
    // 커스터마이징 요소
    const outfitOptions = document.getElementById('outfitOptions');
    const hatOptions = document.getElementById('hatOptions');
    const shoesOptions = document.getElementById('shoesOptions');
    
    // 미리보기 요소
    const previewOutfit = document.getElementById('previewOutfit');
    const previewHat = document.getElementById('previewHat');
    const previewShoes = document.getElementById('previewShoes');
    
    // 플레이어 정보
    const nicknameInput = document.getElementById('playerNickname');
    const startGameBtn = document.getElementById('startGameBtn');
    
    // 현재 선택된 옵션
    let selectedOutfit = 'default';
    let selectedHat = 'none';
    let selectedShoes = 'default';
    
    // 옵션 선택 이벤트 핸들러
    function handleOptionClick(optionsContainer, selectedClass, selectedOptions, previewElement, optionType) {
        if (!optionsContainer) return;
        
        const options = optionsContainer.querySelectorAll('.item-option');
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                // 이전 선택 해제
                const prevSelected = optionsContainer.querySelector('.selected');
                if (prevSelected) {
                    prevSelected.classList.remove('selected');
                }
                
                // 새 선택 적용
                option.classList.add('selected');
                const value = option.getAttribute('data-value');
                
                // 선택된 옵션 업데이트
                switch(optionType) {
                    case 'outfit':
                        selectedOutfit = value;
                        break;
                    case 'hat':
                        selectedHat = value;
                        break;
                    case 'shoes':
                        selectedShoes = value;
                        break;
                }
                
                // 미리보기 업데이트
                updatePreview(optionType, value, previewElement);
            });
        });
    }
    
    // 미리보기 업데이트
    function updatePreview(type, value, previewElement) {
        if (!previewElement) return;
        
        if (type === 'hat' && value === 'none') {
            previewElement.src = '';
            previewElement.style.display = 'none';
        } else if (type === 'outfit' && value === 'default') {
            previewElement.src = '';
            previewElement.style.display = 'none';
        } else if (type === 'shoes' && value === 'default') {
            previewElement.src = '';
            previewElement.style.display = 'none';
        } else {
            previewElement.src = `/static/assets/customization/${value}.png`;
            previewElement.style.display = 'block';
        }
    }
    
    // 이벤트 리스너 초기화
    handleOptionClick(outfitOptions, '.selected', selectedOutfit, previewOutfit, 'outfit');
    handleOptionClick(hatOptions, '.selected', selectedHat, previewHat, 'hat');
    handleOptionClick(shoesOptions, '.selected', selectedShoes, previewShoes, 'shoes');
    
    // 게임 시작 버튼 이벤트
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            const nickname = nicknameInput.value.trim() || '익명의 학생';
            
            // 플레이어 정보 저장 API 호출
            fetch('/game/api/save-player/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    nickname: nickname,
                    outfit: selectedOutfit,
                    hat: selectedHat,
                    shoes: selectedShoes
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // 게임 페이지로 이동
                    window.location.href = '/game/play/';
                } else {
                    console.error('플레이어 정보 저장 실패:', data.message);
                }
            })
            .catch(error => {
                console.error('API 오류:', error);
            });
        });
    }
    
    // CSRF 토큰 가져오기 (Django 용)
    function getCookie(name) {
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
}); 