/**
 * Boo Game API 클라이언트
 * 프론트엔드 개발자를 위한 API 인터페이스
 */

class BooGameAPI {
    constructor(baseURL = '', useHttps = false) {
        // baseURL이 비어있으면 현재 호스트 기반으로 자동 생성
        if (!baseURL) {
            const protocol = useHttps ? 'https' : 'http';
            baseURL = `${protocol}://${window.location.host}`;
        }
        this.baseURL = baseURL;
        this.apiVersion = 'v1';
    }

    /**
     * HTTPS 사용 여부 설정
     * @param {boolean} useHttps - HTTPS 사용 여부
     */
    setUseHttps(useHttps) {
        // baseURL이 비어있지 않고 http: 또는 https:로 시작하는 경우에만 변경
        if (this.baseURL && (this.baseURL.startsWith('http:') || this.baseURL.startsWith('https:'))) {
            const host = this.baseURL.split('://')[1];
            const protocol = useHttps ? 'https' : 'http';
            this.baseURL = `${protocol}://${host}`;
        }
    }

    /**
     * 플레이어 커스터마이징 저장
     * @param {Object} customization - 커스터마이징 정보
     * @param {string} customization.outfit - 의상 유형
     * @param {string} customization.hat - 모자 유형
     * @param {string} customization.shoes - 신발 유형
     * @returns {Promise<Object>} - 저장 결과
     */
    async savePlayer(customization) {
        const url = `${this.baseURL}/game/api/${this.apiVersion}/save-player/`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customization),
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error saving player customization:', error);
            throw error;
        }
    }

    /**
     * 게임 점수 저장
     * @param {Object} scoreData - 점수 데이터
     * @param {string} scoreData.player_id - 플레이어 ID
     * @param {number} scoreData.score - 점수
     * @param {number} scoreData.play_time - 플레이 시간(초)
     * @param {number} scoreData.max_stage - 최대 스테이지
     * @param {number} scoreData.items_collected - 수집한 아이템 수
     * @param {number} scoreData.obstacles_avoided - 피한 장애물 수
     * @param {number} scoreData.max_combo - 최대 콤보
     * @param {string} scoreData.nickname - 닉네임
     * @returns {Promise<Object>} - 저장 결과
     */
    async saveScore(scoreData) {
        const url = `${this.baseURL}/game/api/${this.apiVersion}/save-score/`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scoreData),
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error saving score:', error);
            throw error;
        }
    }

    /**
     * 리더보드 데이터 가져오기
     * @returns {Promise<Object>} - 리더보드 데이터
     */
    async getLeaderboard() {
        const url = `${this.baseURL}/game/api/${this.apiVersion}/leaderboard/`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }

    /**
     * 닉네임 업데이트
     * @param {Object} data - 닉네임 데이터
     * @param {string} data.player_id - 플레이어 ID
     * @param {string} data.nickname - 새 닉네임
     * @returns {Promise<Object>} - 업데이트 결과
     */
    async updateNickname(data) {
        const url = `${this.baseURL}/game/api/${this.apiVersion}/update-nickname/`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error updating nickname:', error);
            throw error;
        }
    }

    /**
     * 플레이어 커스터마이징 정보 조회
     * @returns {Promise<Object>} - 플레이어 커스터마이징 정보
     */
    async getCustomization() {
        const url = `${this.baseURL}/game/api/${this.apiVersion}/get-customization/`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching customization data:', error);
            throw error;
        }
    }
}

// 글로벌 인스턴스 생성
// 현재 보안 연결(HTTPS)을 통해 접속했는지 확인하고 그에 맞게 API 설정
const isHttps = window.location.protocol === 'https:';
window.booGameAPI = new BooGameAPI('', isHttps);

// BooGameAPI 클래스도 전역으로 노출
window.BooGameAPI = BooGameAPI;

// 모듈 내보내기 (ES 모듈 지원 환경용)
export default BooGameAPI; 