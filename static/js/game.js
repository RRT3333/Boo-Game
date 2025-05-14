/**
 * 게임 메인 진입점
 * ES6 모듈 시스템을 사용하여 전체 게임 초기화 담당
 */

import { Game } from './modules/game-core.js';

// DOM이 로드된 후 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 게임 초기화
    new Game();
});