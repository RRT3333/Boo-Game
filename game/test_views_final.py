from django.test import TestCase, Client
from django.urls import reverse
from .models import Player, Score, Achievement, PlayerAchievement
import json
import uuid

class UpdateNicknameTest(TestCase):
    """플레이어 닉네임 업데이트 API 테스트"""
    
    def setUp(self):
        self.client = Client()
        self.player = Player.objects.create(
            nickname="닉네임 테스트",
            outfit="casual",
            hat="cap",
            shoes="sneakers"
        )
    
    def test_update_nickname_exception(self):
        """잘못된 플레이어 ID로 닉네임 업데이트 시도"""
        # 존재하지 않는 플레이어 ID 사용
        nickname_data = {
            'player_id': str(uuid.uuid4()),  # 랜덤 UUID (존재하지 않음)
            'nickname': '새 닉네임'
        }
        
        response = self.client.post(
            reverse('game:update_nickname'),
            data=json.dumps(nickname_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'error')
        
    def test_update_nickname_success(self):
        """정상적인 닉네임 업데이트"""
        nickname_data = {
            'player_id': str(self.player.id),
            'nickname': '업데이트된 닉네임'
        }
        
        response = self.client.post(
            reverse('game:update_nickname'),
            data=json.dumps(nickname_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'success')
        
        # 닉네임이 실제로 업데이트되었는지 확인
        updated_player = Player.objects.get(id=self.player.id)
        self.assertEqual(updated_player.nickname, '업데이트된 닉네임')

class SavePlayerTest(TestCase):
    """플레이어 저장 API 추가 테스트"""
    
    def setUp(self):
        self.client = Client()
    
    def test_save_player_new_player(self):
        """새 플레이어 생성 테스트"""
        # 세션에 player_id가 없는 상태에서 요청
        player_data = {
            'outfit': 'sporty',
            'hat': 'beanie',
            'shoes': 'boots'
        }
        
        response = self.client.post(
            reverse('game:save_player'),
            data=json.dumps(player_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'success')
        
        # 새 플레이어가 생성되었는지 확인
        self.assertTrue('player_id' in data)
        player_id = data['player_id']
        player = Player.objects.get(id=player_id)
        self.assertEqual(player.outfit, 'sporty')
        self.assertEqual(player.hat, 'beanie')
        self.assertEqual(player.shoes, 'boots')
        self.assertEqual(player.nickname, '익명의 학생')  # 기본 닉네임 확인

class GetCustomizationTest(TestCase):
    """커스터마이징 정보 조회 API 에러 케이스 테스트"""
    
    def setUp(self):
        self.client = Client()
        self.player = Player.objects.create(
            nickname="커스텀 API 테스트",
            outfit="formal",
            hat="graduation",
            shoes="dress"
        )
    
    def test_get_customization_exception(self):
        """예외 상황 테스트"""
        # 세션에 잘못된 형식의 player_id 설정
        session = self.client.session
        session['player_id'] = "not-a-valid-uuid"  # 유효하지 않은 UUID 형식
        session.save()
        
        response = self.client.get(reverse('game:get_customization'))
        data = json.loads(response.content)
        
        self.assertEqual(data['status'], 'error')
        # 오류 메시지가 있는지 확인
        self.assertTrue('message' in data)
        # 기본 커스터마이징 값이 제공되는지 확인
        self.assertEqual(data['customization']['outfit'], 'default')
        self.assertEqual(data['customization']['hat'], 'none')
        self.assertEqual(data['customization']['shoes'], 'default') 