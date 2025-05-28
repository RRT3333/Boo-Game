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
    fadeTime: 50,        // 페이드인 시간 (ms)
    // 성능 최적화 설정 추가
    jumpSoundThrottle: 200,  // 점프 사운드 쓰로틀 시간 (ms)
    mobileJumpSoundThrottle: 300 // 모바일에서 점프 사운드 쓰로틀 시간 (ms)
};

// 모바일 환경 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// iOS 디바이스 감지
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

// 오디오 컨텍스트 관리 (전역 단일 인스턴스로 관리)
let audioContext = null;
let audioContextActivated = false;
let userInteractionOccurred = false;

// 오디오 초기화 시스템 함수 - 모듈 레벨에서 선언
let initAudioSystem;

// 오디오 컨텍스트 초기화 함수 (지연 생성 패턴)
function getAudioContext() {
    if (!audioContext) {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            // console.log('AudioContext 생성됨 (상태: ' + audioContext.state + ')');
        } catch (e) {
            // console.log('Web Audio API not supported in this browser');
            return null;
        }
    }
    return audioContext;
}

// 오디오 컨텍스트 활성화 (사용자 인터랙션 후 호출)
function activateAudioContext() {
    if (audioContextActivated) return Promise.resolve();
    
    const ctx = getAudioContext();
    if (!ctx) return Promise.resolve();
    
    if (ctx.state === 'running') {
        audioContextActivated = true;
        return Promise.resolve();
    }
    
    // console.log('AudioContext 활성화 시도...');
    
    // 사용자 인터랙션 없이는 시작할 수 없음 - 인터랙션 발생 시에만 시도
    if (!userInteractionOccurred) {
        return new Promise(resolve => {
            // 사용자 인터랙션 감지 대기
            const onInteraction = () => {
                userInteractionOccurred = true;
                ctx.resume().then(() => {
                    audioContextActivated = true;
                    // console.log('AudioContext 활성화됨 (인터랙션 이후)');
                    resolve();
                }).catch(e => {
                    // console.warn('AudioContext 활성화 실패:', e);
                    resolve();
                });
                
                // 이벤트 리스너 제거
                ['click', 'touchstart', 'keydown'].forEach(eventType => {
                    document.removeEventListener(eventType, onInteraction);
                });
            };
            
            // 이벤트 리스너 등록
            ['click', 'touchstart', 'keydown'].forEach(eventType => {
                document.addEventListener(eventType, onInteraction, { once: true });
            });
        });
    }
    
    // 사용자 인터랙션이 있었으면 즉시 활성화 시도
    return ctx.resume().then(() => {
        audioContextActivated = true;
        // console.log('AudioContext 활성화됨');
    }).catch(e => {
        // console.warn('AudioContext 활성화 실패:', e);
    });
}

// 사용자 인터랙션 감지 (일찍 시작)
function setupUserInteractionDetection() {
    const onUserInteraction = () => {
        userInteractionOccurred = true;
        activateAudioContext();
        
        // 무음 오디오 재생으로 오디오 시스템 활성화
        try {
            const silentAudio = new Audio();
            silentAudio.volume = 0.01;
            silentAudio.play().then(() => {
                // console.log('무음 오디오 재생 성공 - 오디오 시스템 활성화됨');
            }).catch(() => {});
        } catch (e) {
            // 오류 무시
        }
    };
    
    // 이벤트 리스너 등록
    ['click', 'touchstart', 'keydown'].forEach(eventType => {
        document.addEventListener(eventType, onUserInteraction, { once: true });
    });
}

// 사용자 인터랙션 감지 시작
setupUserInteractionDetection();

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

// 오디오 초기화 (미리 풀 생성)
export function initAudio() {
    // 효과음 경로 기본 설정
    // 절대 경로로 시작하여 어느 URL에서든 동일하게 접근
    const basePath = '/static/assets/sounds/';
    
    // 풀 생성 - 모바일에서는 매우 작은 풀 사용
    const poolSize = isIOS ? 1 : (isMobile ? 1 : AUDIO_CONFIG.poolSize);
    
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
    
    // 디버그: 사운드 경로 로깅
    // console.log('사운드 경로:', soundPaths);
    
    // 사운드 파일 존재 여부 확인 시도
    fetch(soundPaths.jump)
        .then(response => {
            // console.log(`Jump 사운드 파일 접근 결과: ${response.status} ${response.statusText}`);
        })
        .catch(error => {
            // console.error('Jump 사운드 파일 접근 실패:', error);
        });
    
    // 풀 초기화 (아직 오디오 객체는 생성하지 않음)
    const sounds = {
        _initialized: false,
        _paths: soundPaths,
        _pools: {},
        _lastPlayed: {},
        _audioEnabled: true, // 오디오 활성화 상태 추적
        _lowPowerMode: false, // 저전력 모드 감지 플래그
        _activationPromise: null // 오디오 활성화 약속 추적
    };
    
    // 오디오 시스템 초기화 (실제 오디오 객체 생성)
    initAudioSystem = () => {
        if (sounds._initialized) return Promise.resolve();
        
        // console.log('오디오 시스템 초기화 중...');
        
        // 풀 실제 생성 - 모바일에서는 최소 풀 사용
        for (const soundName in soundPaths) {
            sounds._pools[soundName] = [];
            
            // 풀 크기 계산 (효과음별 다르게)
            // 모바일에서는 각 효과음당 1개의 객체만 사용 (성능 최적화)
            const size = isIOS || isMobile ? 1 : 
                       (soundName === 'gameover' || soundName === 'save') ? 1 : poolSize;
            
            // 오디오 객체 생성하여 풀에 추가
            for (let i = 0; i < size; i++) {
                const audio = new Audio(soundPaths[soundName]);
                
                // 모바일에 최적화된 볼륨 설정
                if (isIOS || isMobile) {
                    // 모바일에서는 약간 낮은 볼륨으로 설정 (크래킹 방지)
                    audio.volume = Math.min(0.5, AUDIO_CONFIG.mobileVolume);
                } else {
                    audio.volume = AUDIO_CONFIG.defaultVolume;
                }
                
                audio.preload = AUDIO_CONFIG.preloadMode;
                
                // iOS/Safari 대응 - 초기 설정
                if (isIOS) {
                    // iOS에서 오디오 최적화
                    audio.setAttribute('playsinline', '');
                    // 음소거 상태를 false로 변경 - 이전에는 true로 설정했음
                    audio.muted = false;
                }
                
                // 모든 오디오 미리 로드
                audio.load();
                sounds._pools[soundName].push(audio);
            }
        }
        
        // 초기화 완료 표시
        sounds._initialized = true;
        // console.log('오디오 초기화 완료');
        
        return Promise.resolve();
    };
    
    // 오디오 사용 준비 (사용자 인터랙션 필요)
    const prepareAudio = () => {
        // 활성화 Promise가 없으면 새로 생성
        if (!sounds._activationPromise) {
            sounds._activationPromise = new Promise(resolve => {
                // 사용자 인터랙션 감지하고 오디오 초기화
                const onInteraction = () => {
                    // console.log('사용자 인터랙션 감지, 오디오 초기화');
                    userInteractionOccurred = true;
                    
                    // 오디오 시스템 강제 초기화 (동기식)
                    if (!sounds._initialized) {
                        // console.log('오디오 시스템 동기식 초기화 시작');
                        initAudioSystem();
                        // console.log(`초기화 상태: ${sounds._initialized}`);
                    }
                    
                    // AudioContext 활성화
                    activateAudioContext().then(() => {
                        // 오디오 객체 생성
                        return initAudioSystem();
                    }).then(() => {
                        // 음소거 해제를 모든 디바이스에서 수행
                        try {
                            const unmuteSounds = () => {
                                // 모든 오디오 음소거 해제
                                // console.log('모든 오디오 음소거 해제 시도');
                                Object.values(sounds._pools).forEach(pool => {
                                    pool.forEach(audio => {
                                        // 음소거 해제
                                        audio.muted = false;
                                        // console.log(`오디오 음소거 해제: ${audio.src}, muted=${audio.muted}`);
                                        
                                        // 짧게 재생 후 정지 (iOS에서 활성화 위함)
                                        audio.play().then(() => {
                                            setTimeout(() => {
                                                audio.pause();
                                                audio.currentTime = 0;
                                            }, 1);
                                        }).catch(() => {});
                                    });
                                });
                            };
                            
                            // 일회성 무음 오디오 재생으로 오디오 시스템 활성화
                            const silentAudio = new Audio();
                            silentAudio.volume = 0.01;
                            silentAudio.muted = false; // 무음 오디오도 음소거 해제
                            silentAudio.play().then(() => {
                                unmuteSounds();
                            }).catch(() => {
                                // 실패해도 다시 시도
                                unmuteSounds();
                            });
                        } catch (e) {
                            // 오류 무시
                            // console.error('오디오 활성화 중 오류:', e);
                        }
                        
                        resolve();
                    });
                    
                    // 이벤트 리스너 제거
                    ['touchstart', 'click', 'keydown'].forEach(event => {
                        document.removeEventListener(event, onInteraction);
                    });
                };
                
                // 이미 사용자 인터랙션이 있었다면 바로 초기화
                if (userInteractionOccurred) {
                    onInteraction();
                } else {
                    // 이벤트 리스너 등록
                    ['touchstart', 'click', 'keydown'].forEach(event => {
                        document.addEventListener(event, onInteraction, { once: false });
                    });
                }
            });
        }
        
        return sounds._activationPromise;
    };
    
    // 게임에서 사용할 함수들
    sounds.getAudio = function(soundName) {
        // 아직 초기화되지 않았다면 빈 객체 반환
        if (!this._initialized) {
            return { 
                play: () => Promise.resolve(),
                pause: () => {},
                volume: 0,
                currentTime: 0,
                paused: true
            };
        }
        
        // 오디오가 비활성화된 경우 더미 객체 반환
        if (!this._audioEnabled) {
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
    
    // 오디오 즉시 활성화 시도
    sounds.activateAudio = function() {
        // console.log('오디오 활성화 시도: 초기화 상태=' + this._initialized);
        
        // 모바일에서는 추가 활성화 적용
        if (isMobile || isIOS) {
            // console.log('모바일 디바이스 감지: 추가 활성화 절차 시작');
        }
        
        // 초기화 Promise 없으면 새로 생성
        if (!this._activationPromise) {
            // console.log('활성화 Promise 생성');
            this._activationPromise = prepareAudio();
        }
        
        // 사용자 인터랙션이 있었으면 활성화 시도
        if (userInteractionOccurred) {
            // console.log('인터랙션 감지됨: 오디오 컨텍스트 활성화 시도');
            // AudioContext 활성화
            activateAudioContext();
            
            // 아직 초기화 안된 경우 초기화
            if (!this._initialized) {
                // console.log('아직 초기화되지 않음: 시스템 초기화 시작');
                initAudioSystem();
                // console.log(`초기화 완료 상태: ${this._initialized}`);
            }
            
            // 이미 초기화된 경우에도 음소거 해제 시도
            if (this._initialized) {
                // console.log('모든 음소거 해제 추가 시도');
                // 모든 오디오 객체 음소거 해제 시도
                Object.values(this._pools).forEach(pool => {
                    pool.forEach(audio => {
                        audio.muted = false;
                        
                        // iOS에서는 짧게 재생 후 정지하여 활성화
                        if (isIOS) {
                            const currentVolume = audio.volume;
                            audio.volume = 0.01; // 거의 들리지 않게 설정
                            audio.play().then(() => {
                                setTimeout(() => {
                                    audio.pause();
                                    audio.currentTime = 0;
                                    audio.volume = currentVolume; // 원래 볼륨 복원
                                }, 1);
                            }).catch(() => {});
                        }
                    });
                });
            }
        } else {
            // console.log('사용자 인터랙션 없음: 오디오 활성화 대기 중');
        }
        
        return this._initialized;
    };
    
    // 절전 모드 감지 및 오디오 조절
    sounds.detectLowPowerMode = function() {
        // 이미 저전력 모드로 감지되었으면 즉시 반환
        if (this._lowPowerMode) {
            return true;
        }
        
        // 배터리 API를 통한 절전 모드 감지 시도
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.2 || battery.charging === false) {
                    this._lowPowerMode = true;
                    // console.log('저전력 감지: 오디오 최적화 적용');
                }
            }).catch(() => {
                // 배터리 API 오류는 무시
            });
        }
        
        // 화면 새로고침 속도 체크를 통한 간접 감지
        let lastTime = 0;
        let slowFrames = 0;
        const checkFrameRate = (timestamp) => {
            if (lastTime !== 0) {
                const delta = timestamp - lastTime;
                // 프레임 간격이 비정상적으로 길면 저전력 모드 가능성
                if (delta > 30) { // 33ms = ~30fps
                    slowFrames++;
                    if (slowFrames > 10) {
                        this._lowPowerMode = true;
                        // console.log('낮은 프레임 감지: 오디오 최적화 적용');
                        return;
                    }
                }
            }
            lastTime = timestamp;
            requestAnimationFrame(checkFrameRate);
        };
        
        requestAnimationFrame(checkFrameRate);
        
        return this._lowPowerMode;
    };
    
    // 첫 사용자 클릭/터치 시 오디오 초기화 시작
    prepareAudio();
    
    // 절전 모드 감지 시작
    setTimeout(() => sounds.detectLowPowerMode(), 1000);
    
    return sounds;
}

// 사운드 재생
export function playSound(sounds, soundName) {
    // console.log(`소리 재생 시도: ${soundName}`);
    
    // 사운드 객체가 없으면 무시
    if (!sounds) {
        // console.log('sounds 객체가 없음');
        return;
    }
    
    // 강제 초기화 - 아직 초기화되지 않았다면 초기화 시도
    if (!sounds._initialized) {
        // console.log('오디오 시스템 즉시 초기화 시도');
        initAudioSystem(); // 동기식 초기화 시도
    }
    
    // 초기화되지 않았거나 오디오 비활성화 상태면 무시
    if (!sounds._initialized || !sounds._audioEnabled) {
        // console.log(`오디오 초기화 필요: ${sounds._initialized} ${sounds._audioEnabled}`);
        return;
    }
    
    // 성능 최적화를 위한 제어
    const now = Date.now();
    
    if (!sounds._lastPlayed) {
        sounds._lastPlayed = {};
    }
    
    // 점프 사운드 특별 처리 - 성능에 가장 큰 영향을 미치므로
    if (soundName === 'jump') {
        // 모바일/저전력 모드에서는 점프 사운드 재생 빈도 제한
        const jumpThrottle = isIOS ? 400 : // iOS에서 가장 보수적
                         isMobile ? AUDIO_CONFIG.mobileJumpSoundThrottle : 
                         sounds._lowPowerMode ? 250 : 
                         AUDIO_CONFIG.jumpSoundThrottle;
        
        // 절전 모드나 모바일에서는 다시 점프해도 빠르게 재생 안됨
        if (sounds._lastPlayed[soundName] && (now - sounds._lastPlayed[soundName] < jumpThrottle)) {
            return; // 사운드 재생 무시
        }
        
        // 프레임 드랍 감지되면 점프 사운드 일시적 비활성화
        if (sounds._lowPowerMode) {
            // 저전력 모드에서는 간헐적으로만 소리 재생 (2번에 1번 정도)
            if (Math.random() > 0.5) {
                return;
            }
        }
    } else {
        // 다른 사운드는 일반적인 쓰로틀 적용
        const minInterval = isIOS ? 150 : (isMobile ? 100 : 50);
        if (sounds._lastPlayed[soundName] && (now - sounds._lastPlayed[soundName] < minInterval)) {
            return;
        }
    }
    
    try {
        // 오디오 객체 가져오기
        const audio = sounds.getAudio(soundName);
        
        // 오디오가 없는 경우 무시
        if (!audio) {
            // console.log(`오디오 객체 없음: ${soundName}`);
            return;
        }
        
        // console.log(`${soundName} 오디오 객체 획득, 볼륨: ${audio.volume}, 음소거: ${audio.muted}`);
        
        // 음소거 상태인 경우 해제
        if (audio.muted) {
            audio.muted = false;
            // console.log(`${soundName} 오디오 음소거 해제`);
        }
        
        // 이미 재생 중이면 중지 후 처음부터 재생 (iOS에서 중요)
        if (!audio.paused) {
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch (e) {
                // pause/currentTime 오류는 무시
            }
        }
        
        // 모바일에서 성능 최적화된 소리 재생
        if (isIOS || isMobile || sounds._lowPowerMode) {
            // 저전력/모바일에서는 볼륨 낮춤
            const baseVolume = isMobile ? AUDIO_CONFIG.mobileVolume : AUDIO_CONFIG.defaultVolume;
            const targetVolume = sounds._lowPowerMode ? baseVolume * 0.7 : baseVolume;
            
            // 점프 사운드는 더 낮은 볼륨으로
            audio.volume = soundName === 'jump' ? targetVolume * 0.5 : targetVolume;
            audio.currentTime = 0;
            
            // 비동기 재생 (메인 스레드 차단 방지)
            setTimeout(() => {
                // console.log(`${soundName} 소리 재생 시도 (모바일)`);
                // AudioContext 활성화 확인
                if (audioContext && audioContext.state !== 'running' && userInteractionOccurred) {
                    audioContext.resume().catch(() => {});
                }
                
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        // console.log(`${soundName} 소리 재생 성공`);
                    }).catch((e) => {
                        // console.error(`${soundName} 소리 재생 실패:`, e);
                    });
                }
            }, 0);
        } else {
            // 데스크톱에서는 일반 재생
            audio.currentTime = 0;
            
            // console.log(`${soundName} 소리 재생 시도 (데스크톱)`);
            // AudioContext 활성화 확인
            if (audioContext && audioContext.state !== 'running' && userInteractionOccurred) {
                audioContext.resume().catch(() => {});
            }
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // console.log(`${soundName} 소리 재생 성공`);
                }).catch((e) => {
                    // console.error(`${soundName} 소리 재생 실패:`, e);
                });
            }
        }
        
        // 마지막 재생 시간 기록
        sounds._lastPlayed[soundName] = now;
    } catch (e) {
        // 오류 발생 시 조용히 무시
        // console.log(`Sound error for ${soundName}:`, e);
    }
} 