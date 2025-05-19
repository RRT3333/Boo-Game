/**
 * 게임 메인 진입점
 * ES6 모듈 시스템을 사용하여 전체 게임 초기화 담당
 */

import { Game } from './modules/game-core.js';

// 모바일 환경 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 전역 변수
window.gameReady = false;
window.audioActivated = false;

// 오디오 컨텍스트 활성화 준비
function prepareAudioContext() {
    // iOS/Safari에서 오디오가 재생되도록 준비
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    
    // 사용자 인터랙션 감지 시 오디오 활성화
    const activateAudio = (e) => {
        console.log('사용자 인터랙션 감지됨:', e.type);
        
        // 오디오 활성화 상태 설정
        window.audioActivated = true;
        
        // 무음 오디오 재생으로 오디오 시스템 활성화
        const silentAudio = new Audio();
        silentAudio.volume = 0.01;
        silentAudio.muted = false;
        
        // 강제 활성화를 위해 여러 번 시도
        const activateSilentAudio = () => {
            silentAudio.play().then(() => {
                console.log('오디오 활성화 성공 (사용자 인터랙션)');
                
                // 게임 인스턴스 오디오 시스템도 활성화
                if (window.gameInstance && window.gameInstance.sounds) {
                    console.log('게임 오디오 시스템 활성화 시도');
                    window.gameInstance.sounds.activateAudio();
                    
                    // 초기화 상태 강제 설정
                    window.gameInstance.sounds._initialized = true;
                    window.gameInstance.sounds._audioEnabled = true;
                    
                    // AudioContext도 활성화
                    if (window.gameInstance.activateAudioContext) {
                        window.gameInstance.activateAudioContext();
                    }
                }
            }).catch(() => {
                console.log('오디오 활성화 실패 (사용자 인터랙션) - 다시 시도');
                // 실패 시 다시 시도
                setTimeout(activateSilentAudio, 100);
            });
        };
        
        // 첫 번째 시도
        activateSilentAudio();
        
        // 저전력 모드 감지를 위한 준비
        detectLowPowerMode();
        
        // 이벤트 리스너 제거
        document.removeEventListener('touchstart', activateAudio);
        document.removeEventListener('click', activateAudio);
        document.removeEventListener('keydown', activateAudio);
    };
    
    // 사용자 인터랙션 감지 (클릭, 터치, 키보드 입력)
    // once:true를 제거하여 여러 번의 인터랙션도 처리 가능하게 함
    document.addEventListener('touchstart', activateAudio);
    document.addEventListener('click', activateAudio);
    document.addEventListener('keydown', activateAudio);
    
    // 추가: 모든 오디오 객체 음소거 해제를 위한 백업 함수
    window.unmuteSounds = function() {
        console.log('모든 소리 음소거 해제 시도 (백업)');
        if (window.gameInstance && window.gameInstance.sounds) {
            const sounds = window.gameInstance.sounds;
            // 초기화 상태 강제 설정
            sounds._initialized = true;
            sounds._audioEnabled = true;
            
            // 모든 오디오 객체 음소거 해제
            Object.values(sounds._pools || {}).forEach(pool => {
                pool.forEach(audio => {
                    audio.muted = false;
                });
            });
        }
    };
}

// 저전력 모드 감지
function detectLowPowerMode() {
    // 배터리 API 확인
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const isLowPower = battery.level < 0.3 || battery.charging === false;
            
            if (isLowPower && window.gameInstance) {
                console.log('배터리 저전력 감지됨: 성능 최적화 활성화');
                window.gameInstance.lowPowerModeDetected = true;
                
                if (window.gameInstance.sounds) {
                    window.gameInstance.sounds._lowPowerMode = true;
                }
            }
        }).catch(e => {
            console.log('배터리 API 에러:', e);
        });
    }
    
    // 프레임 레이트 체크 (저전력 모드에서는 프레임 레이트가 낮아짐)
    let lastTime = 0;
    let slowFrames = 0;
    
    function checkFrameRate(timestamp) {
        if (lastTime !== 0) {
            const delta = timestamp - lastTime;
            
            // 프레임 간격이 큰 경우 (저전력 모드 가능성)
            if (delta > 33) { // 30fps 미만
                slowFrames++;
                
                if (slowFrames > 10 && window.gameInstance) {
                    console.log('저전력 모드 감지됨: 낮은 프레임 레이트');
                    window.gameInstance.lowPowerModeDetected = true;
                    
                    if (window.gameInstance.sounds) {
                        window.gameInstance.sounds._lowPowerMode = true;
                    }
                    
                    return; // 감지 완료 후 중단
                }
            } else {
                // 정상 프레임 카운터 리셋
                slowFrames = Math.max(0, slowFrames - 1);
            }
        }
        
        lastTime = timestamp;
        requestAnimationFrame(checkFrameRate);
    }
    
    requestAnimationFrame(checkFrameRate);
}

// DOM이 로드된 후 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 오디오 컨텍스트 준비
    prepareAudioContext();
    
    // 게임 초기화 - 모바일에서는 약간 지연 (오디오 컨텍스트 초기화용)
    const initGame = () => {
        // 이미 초기화되었으면 무시
        if (window.gameReady) return;
        
        window.gameReady = true;
        window.gameInstance = new Game();
        
        // 모바일에서 저전력 모드 감지 시작
        if (isMobile) {
            detectLowPowerMode();
        }
    };
    
    if (isMobile) {
        // 모바일에서는 사용자 인터랙션 후 게임 초기화
        const startOnInteraction = (e) => {
            // 약간의 지연 후 게임 초기화 (오디오 컨텍스트 초기화 대기)
            setTimeout(initGame, 100);
            
            // 이벤트 리스너 제거
            document.removeEventListener('touchstart', startOnInteraction);
            document.removeEventListener('click', startOnInteraction);
        };
        
        document.addEventListener('touchstart', startOnInteraction, { once: true });
        document.addEventListener('click', startOnInteraction, { once: true });
        
        // 백업으로 시간 경과 후 초기화
        setTimeout(initGame, 1000);
    } else {
        // 데스크톱에서는 즉시 시작
        initGame();
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