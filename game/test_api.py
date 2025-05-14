from django.test import TestCase, Client
from django.urls import reverse
from .models import Player, Score
import json
import uuid

class APIEndpointsTest(TestCase):
    """API 엔드포인트 테스트"""
    
    def setUp(self):
        self.client = Client()
        self.player = Player.objects.create(
            nickname="API 엔드포인트 테스트 유저",
            outfit="casual",
            hat="cap",
            shoes="sneakers"
        )
        self.score = Score.objects.create(
            player=self.player,
            score=500,
            play_time=30,
            max_stage=3
        )
        
    def test_update_nickname_api(self):
        """닉네임 업데이트 API 테스트"""
        nickname_data = {
            'player_id': str(self.player.id),
            'nickname': '새로운 닉네임'
        }
        
        response = self.client.post(
            reverse('game:update_nickname'),
            data=json.dumps(nickname_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        result = json.loads(response.content)
        self.assertEqual(result['status'], 'success')
        
        # 닉네임이 실제로 업데이트되었는지 확인
        updated_player = Player.objects.get(id=self.player.id)
        self.assertEqual(updated_player.nickname, '새로운 닉네임')
    
    def test_api_version1_endpoints(self):
        """API v1 엔드포인트 테스트"""
        # save_player_api 테스트
        player_data = {
            'outfit': 'sporty',
            'hat': 'cap',
            'shoes': 'sneakers'
        }
        
        response = self.client.post(
            reverse('game:api_save_player'),
            data=json.dumps(player_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # save_score_api 테스트
        score_data = {
            'player_id': str(self.player.id),
            'score': 800,
            'play_time': 45,
            'max_stage': 4
        }
        
        response = self.client.post(
            reverse('game:api_save_score'),
            data=json.dumps(score_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # get_leaderboard_api 테스트
        response = self.client.get(reverse('game:api_leaderboard'))
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertIn('leaderboard', data)
        
        # update_nickname_api 테스트
        nickname_data = {
            'player_id': str(self.player.id),
            'nickname': 'API v1 테스트 유저'
        }
        
        response = self.client.post(
            reverse('game:api_update_nickname'),
            data=json.dumps(nickname_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # 닉네임이 실제로 업데이트되었는지 확인
        updated_player = Player.objects.get(id=self.player.id)
        self.assertEqual(updated_player.nickname, 'API v1 테스트 유저')
        
class ErrorHandlingTest(TestCase):
    """API 오류 처리 테스트"""
    
    def setUp(self):
        self.client = Client()
        
    def test_invalid_player_id(self):
        """잘못된 플레이어 ID 처리 테스트"""
        # 존재하지 않는 플레이어 ID로 점수 저장 시도
        score_data = {
            'player_id': str(uuid.uuid4()),  # 랜덤 UUID
            'score': 800,
            'play_time': 45,
            'max_stage': 4,
            'nickname': '새로운 유저'  # 이 경우 새 플레이어가 생성되어야 함
        }
        
        response = self.client.post(
            reverse('game:save_score'),
            data=json.dumps(score_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)  # 오류가 아닌 성공을 반환해야 함
        
        # 새 플레이어가 생성되었는지 확인
        new_player = Player.objects.filter(nickname='새로운 유저').first()
        self.assertIsNotNone(new_player)
        
    def test_invalid_request_method(self):
        """잘못된 요청 메서드 처리 테스트"""
        # GET 메서드로 POST API 호출 시도
        response = self.client.get(reverse('game:save_score'))
        self.assertEqual(response.status_code, 405)  # Method Not Allowed
        
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'error')
        self.assertEqual(data['message'], 'Invalid request method') 