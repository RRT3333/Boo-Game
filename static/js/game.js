/**
 * 게임 메인 진입점
 * ES6 모듈 시스템을 사용하여 전체 게임 초기화 담당
 */

import { Game } from './modules/game-core.js';

// 모바일 환경 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 오디오 컨텍스트 활성화 준비
function prepareAudioContext() {
    // iOS/Safari에서 오디오가 재생되도록 준비
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    
    // 사용자 인터랙션 감지 시 오디오 활성화
    const activateAudio = () => {
        // iOS/모바일 브라우저 오디오 활성화
        const silentAudio = new Audio();
        silentAudio.play().catch(() => {});
        
        // 이벤트 리스너 제거
        document.removeEventListener('touchstart', activateAudio);
        document.removeEventListener('click', activateAudio);
        document.removeEventListener('keydown', activateAudio);
    };
    
    // 사용자 인터랙션 감지 (클릭, 터치, 키보드 입력)
    document.addEventListener('touchstart', activateAudio, { once: true });
    document.addEventListener('click', activateAudio, { once: true });
    document.addEventListener('keydown', activateAudio, { once: true });
}

// DOM이 로드된 후 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 오디오 컨텍스트 준비
    prepareAudioContext();
    
    // 게임 초기화 - 모바일에서는 약간 지연 (오디오 컨텍스트 초기화용)
    if (isMobile) {
        // 모바일에서는 오디오 초기화를 위해 짧은 지연 후 게임 시작
        setTimeout(() => {
            window.gameInstance = new Game();
        }, 100);
    } else {
        // 데스크톱에서는 즉시 시작
        window.gameInstance = new Game();
    }
    
    // 게임 이벤트 시스템 초기화 오류 방지를 위한 안전장치
    setTimeout(() => {
        // 이미 생성된 버튼에 대해 이벤트 핸들러 직접 연결
        const setupButtonHandler = (btnId) => {
            const btn = document.getElementById(btnId);
            if (btn && window.gameInstance) {
                btn.onclick = function() {
                    console.log(`${btnId} 직접 클릭 이벤트 발생`);
                    window.gameInstance.restart();
                    return false;
                };
            }
        };
        
        // 두 개의 재시작 버튼에 적용
        setupButtonHandler('restartButton');
        setupButtonHandler('clearRestartButton');
    }, 1000);
});