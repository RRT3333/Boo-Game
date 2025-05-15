/**
 * 게임 오디오 관련 모듈
 * 게임 내 사운드 효과를 관리합니다.
 */

// 오디오 시스템 전역 설정
const AUDIO_CONFIG = {
    poolSize: 3,         // 동일 효과음 동시 재생을 위한 풀 크기
    defaultVolume: 0.5,  // 기본 음량
    mobileVolume: 0.7,   // 모바일 환경에서 음량 (좀 더 크게)
    preloadMode: 'auto', // 자동 사전 로드 (metadata, auto, none)
    audioFormats: ['mp3', 'ogg'], // 지원하는 오디오 포맷
    fadeTime: 50         // 페이드인 시간 (ms)
};

// 모바일 환경 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 오디오 컨텍스트 사용 가능 여부 확인
let audioContext;
let audioSupported = false;

try {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    audioSupported = true;
} catch (e) {
    console.log('Web Audio API not supported in this browser');
    audioSupported = false;
}

// 포맷 지원 확인 (필요시 대체 포맷 로드)
function getSupportedFormat() {
    const audio = new Audio();
    
    for (const format of AUDIO_CONFIG.audioFormats) {
        if (audio.canPlayType(`audio/${format}`) !== '') {
            return format;
        }
    }
    
    return 'mp3'; // 기본값
}

// 지원 포맷
const supportedFormat = getSupportedFormat();

// 오디오 풀 생성 함수
function createAudioPool(path, size) {
    const pool = [];
    let poolIndex = 0;
    
    // 풀에 오디오 객체 추가
    for (let i = 0; i < size; i++) {
        const audio = new Audio(path);
        audio.volume = isMobile ? AUDIO_CONFIG.mobileVolume : AUDIO_CONFIG.defaultVolume;
        audio.preload = AUDIO_CONFIG.preloadMode;
        
        // iOS/Safari 대응 - 사용자 동작 미리 바인딩
        audio.load();
        
        pool.push(audio);
    }
    
    // 풀에서 가용한 오디오 객체 가져오기
    const getFromPool = () => {
        // 현재 재생 중이지 않은 객체 찾기
        for (let i = 0; i < pool.length; i++) {
            if (pool[i].paused) {
                return pool[i];
            }
        }
        
        // 모두 재생 중이면 순환하며 사용
        poolIndex = (poolIndex + 1) % pool.length;
        return pool[poolIndex];
    };
    
    return getFromPool;
}

// 오디오 초기화 (미리 풀 생성)
export function initAudio() {
    // 효과음 경로 기본 설정
    const basePath = '/static/assets/sounds/';
    
    // 풀 생성
    const poolSize = isMobile ? 2 : AUDIO_CONFIG.poolSize;
    
    // 각 효과음 별 풀 생성 - 실제 오디오 객체는 사용자 인터랙션 이후 생성
    const soundPaths = {
        jump: `${basePath}jump.${supportedFormat}`,
        coin: `${basePath}coin.${supportedFormat}`,
        aplus: `${basePath}aplus.${supportedFormat}`,
        gameover: `${basePath}gameover.${supportedFormat}`,
        save: `${basePath}save.${supportedFormat}`,
        button: `${basePath}button.${supportedFormat}`,
        background_music: `${basePath}background_music.${supportedFormat}`
    };
    
    // 풀 초기화 (아직 오디오 객체는 생성하지 않음)
    const sounds = {
        _initialized: false,
        _paths: soundPaths,
        _pools: {},
        _lastPlayed: {}
    };
    
    // 사용자 인터랙션 감지 시 오디오 초기화
    const initOnUserInteraction = () => {
        if (sounds._initialized) return;
        
        console.log('사용자 인터랙션 감지, 오디오 초기화');
        
        // 풀 실제 생성
        for (const soundName in soundPaths) {
            sounds._pools[soundName] = [];
            
            // 풀 크기 계산 (효과음별 다르게)
            const size = (soundName === 'gameover' || soundName === 'save') ? 1 : poolSize;
            
            // 오디오 객체 생성하여 풀에 추가
            for (let i = 0; i < size; i++) {
                const audio = new Audio(soundPaths[soundName]);
                audio.volume = isMobile ? AUDIO_CONFIG.mobileVolume : AUDIO_CONFIG.defaultVolume;
                audio.preload = AUDIO_CONFIG.preloadMode;
                
                // iOS/Safari 대응 - 사용자 동작 미리 바인딩
                audio.load();
                
                sounds._pools[soundName].push(audio);
            }
        }
        
        // 초기화 완료 표시
        sounds._initialized = true;
        
        // 오디오 컨텍스트 활성화
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().catch(e => console.log('오디오 컨텍스트 활성화 실패:', e));
        }
        
        // 이벤트 리스너 제거
        document.removeEventListener('touchstart', initOnUserInteraction);
        document.removeEventListener('click', initOnUserInteraction);
        
        console.log('오디오 초기화 완료');
    };
    
    // 게임에서 사용할 함수들
    sounds.getAudio = function(soundName) {
        // 아직 초기화되지 않았다면 빈 객체 반환 (재생 시도하지 않음)
        if (!this._initialized) {
            return { 
                play: () => Promise.resolve(),
                pause: () => {},
                volume: 0,
                currentTime: 0,
                paused: true
            };
        }
        
        // 풀에서 사용 가능한 오디오 찾기
        const pool = this._pools[soundName];
        if (!pool || pool.length === 0) {
            return null;
        }
        
        // 현재 재생 중이지 않은 객체 찾기
        for (let i = 0; i < pool.length; i++) {
            if (pool[i].paused) {
                return pool[i];
            }
        }
        
        // 모두 재생 중이면 첫 번째 객체 반환
        return pool[0];
    };
    
    // 오디오 준비하기 위한 이벤트 리스너 등록
    document.addEventListener('touchstart', initOnUserInteraction, { once: false });
    document.addEventListener('click', initOnUserInteraction, { once: false });
    
    return sounds;
}

// 사운드 재생
export function playSound(sounds, soundName) {
    // 성능 최적화를 위한 debounce - 동일 효과음이 너무 빠르게 중복 재생되는 것 방지
    const now = Date.now();
    
    if (!sounds._lastPlayed) {
        sounds._lastPlayed = {};
    }
    
    // 너무 빠른 반복 재생 방지 (모바일에서 더 긴 간격 적용)
    const minInterval = isMobile ? 80 : 50;
    
    if (sounds._lastPlayed[soundName] && (now - sounds._lastPlayed[soundName] < minInterval)) {
        // 너무 빠르게 재생 요청이 들어오면 건너뜀 (모바일 성능 보호)
        return;
    }
    
    try {
        // 오디오 객체 가져오기
        const audio = sounds.getAudio(soundName);
        
        // 오디오가 없거나 초기화되지 않은 경우 무시
        if (!audio || !sounds._initialized) {
            return;
        }
        
        // 볼륨 페이드인 효과 (크래킹 방지)
        if (isMobile) {
            // 모바일에서 크래킹 방지를 위한 볼륨 조정
            const targetVolume = audio.volume;
            audio.volume = targetVolume * 0.3;
            
            setTimeout(() => {
                audio.volume = targetVolume;
            }, 20);
        }
        
        // 재생 위치 처음으로 (이미 설정되어 있을 수 있음)
        audio.currentTime = 0;
        
        // 재생 (사용자 인터랙션 문제로 오류가 발생해도 무시)
        audio.play().catch(e => {
            // 오류 발생 시 조용히 무시 (개발 모드에서만 로그)
            if (e.name !== 'NotAllowedError') {
                console.log(`Sound play error: ${e.message}`);
            }
        });
        
        // 마지막 재생 시간 기록
        sounds._lastPlayed[soundName] = now;
    } catch (e) {
        // 오류 발생 시 조용히 무시
        console.log(`Sound error for ${soundName}:`, e);
    }
} 