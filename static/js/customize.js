// 커스터마이징 페이지 스크립트 (완전히 새로 작성)
document.addEventListener('DOMContentLoaded', function() {
    // 커스터마이징 요소
    const outfitOptions = document.getElementById('outfitOptions');
    const hatOptions = document.getElementById('hatOptions');
    const shoesOptions = document.getElementById('shoesOptions');
    
    // 미리보기 요소
    const previewOutfit = document.getElementById('previewOutfit');
    const previewHat = document.getElementById('previewHat');
    const previewShoes = document.getElementById('previewShoes');
    
    // 게임 시작 버튼
    const startGameBtn = document.getElementById('startGameBtn');
    
    // 현재 선택된 옵션
    let selectedOutfit = 'default';
    let selectedHat = 'none';
    let selectedShoes = 'default';
    
    // 옵션 선택 이벤트 핸들러
    function setupOptions(container, optionType, previewElement) {
        if (!container) return;
        
        const options = container.querySelectorAll('.item-option');
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                // 이전 선택 해제
                const prevSelected = container.querySelector('.selected');
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
    function updatePreview(type, value, element) {
        if (!element) return;
        
        if ((type === 'hat' && value === 'none') || 
            (type === 'outfit' && value === 'default') || 
            (type === 'shoes' && value === 'default')) {
            element.src = '';
            element.style.display = 'none';
        } else {
            element.src = `/static/assets/customization/${value}.png`;
            element.style.display = 'block';
        }
    }
    
    // 이벤트 리스너 초기화
    setupOptions(outfitOptions, 'outfit', previewOutfit);
    setupOptions(hatOptions, 'hat', previewHat);
    setupOptions(shoesOptions, 'shoes', previewShoes);
    
    // 게임 시작 버튼 이벤트
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            console.log('게임 시작 버튼 클릭됨');
            console.log('선택된 옵션:', { outfit: selectedOutfit, hat: selectedHat, shoes: selectedShoes });
            
            // 플레이어 정보 저장 API 호출
            fetch('/game/api/save-player/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({
                    outfit: selectedOutfit,
                    hat: selectedHat,
                    shoes: selectedShoes
                })
            })
            .then(response => {
                console.log('API 응답 받음:', response);
                return response.json();
            })
            .then(data => {
                console.log('API 응답 데이터:', data);
                if (data.status === 'success') {
                    // 게임 페이지로 이동
                    window.location.href = '/game/play/';
                } else {
                    console.error('플레이어 정보 저장 실패:', data.message);
                    alert('오류가 발생했습니다: ' + data.message);
                }
            })
            .catch(error => {
                console.error('API 호출 오류:', error);
                alert('서버 연결 중 오류가 발생했습니다.');
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