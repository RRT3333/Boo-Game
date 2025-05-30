// Customization data debug fixed version

// 페이지 로드 직후 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('디버그 스크립트 시작: 커스터마이징 데이터 확인');
    
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
    
    // 전역 previousCustomization 변수의 존재 여부 확인
    if (typeof previousCustomization === 'undefined') {
        console.warn('previousCustomization 변수가 정의되지 않았습니다. 서버에서 데이터를 가져옵니다.');
        
        // 서버에서 데이터 가져오기
        fetch('/game/api/get-customization/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('서버 응답:', data);
            
            if (data.status === 'success') {
                // 전역 객체에 데이터 설정
                window.previousCustomization = data.customization;
                console.log('서버에서 커스터마이징 데이터를 가져왔습니다:', window.previousCustomization);
                
                // 페이지 새로고침 (소켓 연결이 중단되는 것을 방지하기 위해 1초 후 실행)
                setTimeout(() => {
                    console.log('데이터 로드 완료, 페이지를 새로고침합니다...');
                    location.reload();
                }, 1000);
            } else {
                console.error('서버에서 데이터를 가져오는데 실패했습니다:', data.message);
                
                // 기본값으로 설정
                window.previousCustomization = {
                    outfit: 'default',
                    hat: 'none',
                    shoes: 'default'
                };
            }
        })
        .catch(error => {
            console.error('API 오류:', error);
            
            // 기본값으로 설정
            window.previousCustomization = {
                outfit: 'default',
                hat: 'none',
                shoes: 'default'
            };
        });
    } else {
        console.log('previousCustomization 변수가 이미 존재합니다:', previousCustomization);
    }
});
