/**
 * 게임 오디오 관련 모듈
 * 게임 내 사운드 효과를 관리합니다.
 */

// 오디오 초기화
export function initAudio() {
    const sounds = {
        jump: new Audio('/static/assets/sounds/jump.mp3'),
        coin: new Audio('/static/assets/sounds/coin.mp3'),
        aplus: new Audio('/static/assets/sounds/aplus.mp3'),
        gameover: new Audio('/static/assets/sounds/gameover.mp3'),
        save: new Audio('/static/assets/sounds/save.mp3'),
        button: new Audio('/static/assets/sounds/button.mp3')
    };
    
    // 음량 설정
    Object.values(sounds).forEach(sound => {
        sound.volume = 0.5;
    });
    
    return sounds;
}

// 사운드 재생
export function playSound(sounds, soundName) {
    try {
        if (sounds[soundName]) {
            // 사운드 재생 위치 처음으로 리셋 (중복 재생 가능하게)
            sounds[soundName].currentTime = 0;
            sounds[soundName].play().catch(e => {
                // 사운드 로드 실패 시 조용히 무시 (개발 중 오류 방지)
                console.log('Sound could not be played', e);
            });
        }
    } catch (e) {
        console.log('Sound error:', e);
    }
} 