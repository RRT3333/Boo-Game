from django.test import TestCase, Client
from django.urls import reverse
from .models import Player, Score, Achievement, PlayerAchievement
import json
import uuid

class CustomizeViewTest(TestCase):
    """Customize view edge cases test"""
    
    def setUp(self):
        self.client = Client()
        self.player = Player.objects.create(
            nickname="커스텀 추가 테스트",
            outfit="hoodie",
            hat="sunglasses",
            shoes="boots"
        )
    
    def test_customize_view_with_previous_data(self):
        """세션에 player_id가 있고 플레이어가 존재하는 경우"""
        session = self.client.session
        session['player_id'] = str(self.player.id)
        session.save()
        
        response = self.client.get(reverse('game:customize'))
        
        # 렌더링된 컨텍스트 검사
        self.assertEqual(response.status_code, 200)
        self.assertIn('previous', response.context)
        self.assertEqual(response.context['previous']['outfit'], 'hoodie')
        self.assertEqual(response.context['previous']['hat'], 'sunglasses')
        self.assertEqual(response.context['previous']['shoes'], 'boots')
    
    def test_customize_view_with_nonexistent_player(self):
        """세션에 player_id가 있지만 플레이어가 존재하지 않는 경우"""
        session = self.client.session
        session['player_id'] = str(uuid.uuid4())  # 존재하지 않는 ID
        session.save()
        
        response = self.client.get(reverse('game:customize'))
        
        # 기본값이 사용되는지 확인
        self.assertEqual(response.status_code, 200)
        self.assertIn('previous', response.context)
        self.assertEqual(response.context['previous']['outfit'], 'default')
        self.assertEqual(response.context['previous']['hat'], 'none')
        self.assertEqual(response.context['previous']['shoes'], 'default')

class GameViewTest(TestCase):
    """Game view edge cases test"""
    
    def setUp(self):
        self.client = Client()
        self.player = Player.objects.create(
            nickname="게임 뷰 테스트",
            outfit="sporty",
            hat="cap",
            shoes="sneakers"
        )
    
    def test_game_view_with_player_id(self):
        """세션에 player_id가 있고 플레이어가 존재하는 경우"""
        session = self.client.session
        session['player_id'] = str(self.player.id)
        session.save()
        
        response = self.client.get(reverse('game:play'))
        
        # 렌더링된 컨텍스트 검사
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['previous_nickname'], '게임 뷰 테스트')
    
    def test_game_view_with_nonexistent_player(self):
        """세션에 player_id가 있지만 플레이어가 존재하지 않는 경우"""
        session = self.client.session
        session['player_id'] = str(uuid.uuid4())  # 존재하지 않는 ID
        session.save()
        
        response = self.client.get(reverse('game:play'))
        
        # 기본 닉네임이 사용되는지 확인
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['previous_nickname'], '익명의 학생')
    
    def test_game_view_with_customization(self):
        """세션에 커스터마이징 정보가 있는 경우"""
        session = self.client.session
        
        # 세션에 커스터마이징 정보 추가
        session['outfit'] = 'formal'
        session['hat'] = 'graduation'
        session['shoes'] = 'dress'
        session.save()
        
        response = self.client.get(reverse('game:play'))
        
        # 커스터마이징 정보가 컨텍스트에 제대로 전달되는지 확인
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context['customization']['outfit'], 'formal')
        self.assertEqual(response.context['customization']['hat'], 'graduation')
        self.assertEqual(response.context['customization']['shoes'], 'dress') 