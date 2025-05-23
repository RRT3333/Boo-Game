from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from game.models import Player, Score, Achievement, PlayerAchievement
import json
import uuid

class APIViewsTest(TestCase):
    """API 뷰 테스트"""
    
    def setUp(self):
        self.client = Client()
        self.player = Player.objects.create(
            nickname="API 뷰 테스트 유저",
            outfit="sporty",
            hat="beanie",
            shoes="boots"
        )
        self.score = Score.objects.create(
            player=self.player,
            score=500,
            play_time=30,
            max_stage=3
        )
        self.achievement = Achievement.objects.create(
            name="테스트 업적",
            description="테스트용 업적",
            icon="test_icon"
        )
        self.player_achievement = PlayerAchievement.objects.create(
            player=self.player,
            achievement=self.achievement
        )
    
    def test_get_customization_api(self):
        """커스터마이징 정보 조회 API 테스트"""
        # 세션에 player_id 설정
        session = self.client.session
        session['player_id'] = str(self.player.id)
        session.save()
        
        response = self.client.get(reverse('game:api_get_customization'))
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['customization']['outfit'], 'sporty')
        self.assertEqual(data['customization']['hat'], 'beanie')
        self.assertEqual(data['customization']['shoes'], 'boots')
    
    def test_get_customization_api_no_player(self):
        """플레이어 없는 경우 커스터마이징 API 테스트"""
        response = self.client.get(reverse('game:api_get_customization'))
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'error')
        self.assertEqual(data['message'], '플레이어 ID가 없습니다')
    
    def test_swagger_documentation_endpoints(self):
        """Swagger 문서화 엔드포인트 테스트"""
        # 각 API 엔드포인트가 Swagger 문서화 데코레이터로 잘 래핑되었는지 확인
        # save_player_api
        response = self.client.options(reverse('game:api_save_player'))
        self.assertEqual(response.status_code, 200)
        
        # save_score_api
        response = self.client.options(reverse('game:api_save_score'))
        self.assertEqual(response.status_code, 200)
        
        # get_leaderboard_api
        response = self.client.options(reverse('game:api_leaderboard'))
        self.assertEqual(response.status_code, 200)
        
        # update_nickname_api
        response = self.client.options(reverse('game:api_update_nickname'))
        self.assertEqual(response.status_code, 200)
        
        # get_customization_api
        response = self.client.options(reverse('game:api_get_customization'))
        self.assertEqual(response.status_code, 200)

class APIEdgeCasesTest(TestCase):
    """API 엣지 케이스 테스트"""
    
    def setUp(self):
        self.client = Client()
    
    def test_invalid_methods(self):
        """잘못된 HTTP 메소드 테스트"""
        # GET 메소드로 POST API 호출 시도
        urls = [
            'game:api_save_player',
            'game:api_save_score',
            'game:api_update_nickname'
        ]
        
        for url in urls:
            response = self.client.get(reverse(url))
            self.assertEqual(response.status_code, 405)  # Method Not Allowed
    
    def test_post_to_get_api(self):
        """GET API에 POST 메소드 테스트"""
        urls = [
            'game:api_leaderboard',
            'game:api_get_customization'
        ]
        
        for url in urls:
            response = self.client.post(reverse(url), data={})
            self.assertEqual(response.status_code, 405)  # Method Not Allowed 