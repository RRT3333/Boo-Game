// 메인 페이지 스크립트
document.addEventListener('DOMContentLoaded', function() {
    // 게임 방법 모달 열기
    const howToPlayBtn = document.getElementById('howToPlayBtn');
    const howToPlayModal = document.getElementById('howToPlayModal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    if (howToPlayBtn && howToPlayModal) {
        howToPlayBtn.addEventListener('click', function() {
            howToPlayModal.classList.add('show');
        });
    }
    
    if (closeModalBtn && howToPlayModal) {
        closeModalBtn.addEventListener('click', function() {
            howToPlayModal.classList.remove('show');
        });
    }
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        if (event.target === howToPlayModal) {
            howToPlayModal.classList.remove('show');
        }
    });
    
    // 배경 애니메이션 효과
    const backgroundBlur = document.querySelector('.background-blur');
    let posX = 0;
    
    function animateBackground() {
        posX -= 0.2;
        if (backgroundBlur) {
            backgroundBlur.style.backgroundPosition = `${posX}px center`;
        }
        requestAnimationFrame(animateBackground);
    }
    
    animateBackground();
    
    // 플레이어 카드 애니메이션
    const playerCards = document.querySelectorAll('.player-card');
    
    playerCards.forEach((card, index) => {
        // 지연 애니메이션 효과
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
        
        // 호버 효과 (모바일 터치 대응)
        card.addEventListener('mouseenter', () => {
            card.classList.add('hover');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('hover');
        });
    });
}); 