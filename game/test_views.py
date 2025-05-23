from django.test import TestCase, Client, RequestFactory
from django.urls import reverse
from game.models import Player, Score, Achievement, PlayerAchievement
from game.views import (
    check_achievements, 
    get_customization, 
    save_player, 
    save_score,
    update_nickname,
    presentation_view
)
import json
import uuid
from django.contrib.sessions.middleware import SessionMiddleware

def add_middleware_to_request(request, middleware_class):
    """Helper function to add session to request"""
    middleware = middleware_class(get_response=lambda r: None)
    middleware.process_request(request)
    return request

class CheckAchievementsTest(TestCase):
    """Achievement checking function tests"""
    
    def setUp(self):
        self.player = Player.objects.create(nickname="업적 테스트")
    
    def test_high_score_achievement(self):
        """1000점 달성 업적 테스트"""
        score = Score.objects.create(
            player=self.player,
            score=1200,
            play_time=60,
            max_stage=3
        )
        
        check_achievements(self.player, score)
        
        # 업적이 생성되었는지 확인
        achievement = Achievement.objects.filter(name="1000점 달성").first()
        self.assertIsNotNone(achievement)
        
        # 플레이어가 해당 업적을 획득했는지 확인
        player_achievement = PlayerAchievement.objects.filter(
            player=self.player, 
            achievement=achievement
        ).first()
        self.assertIsNotNone(player_achievement)
    
    def test_graduate_achievement(self):
        """졸업생 업적 테스트 (스테이지 6 이상)"""
        score = Score.objects.create(
            player=self.player,
            score=500,
            play_time=60,
            max_stage=6
        )
        
        check_achievements(self.player, score)
        
        # 업적이 생성되었는지 확인
        achievement = Achievement.objects.filter(name="졸업생").first()
        self.assertIsNotNone(achievement)
        
        # 플레이어가 해당 업적을 획득했는지 확인
        player_achievement = PlayerAchievement.objects.filter(
            player=self.player, 
            achievement=achievement
        ).first()
        self.assertIsNotNone(player_achievement)
    
    def test_combo_achievement(self):
        """콤보 마스터 업적 테스트 (10콤보 이상)"""
        score = Score.objects.create(
            player=self.player,
            score=500,
            play_time=60,
            max_stage=3,
            max_combo=12
        )
        
        check_achievements(self.player, score)
        
        # 업적이 생성되었는지 확인
        achievement = Achievement.objects.filter(name="콤보 마스터").first()
        self.assertIsNotNone(achievement)
        
        # 플레이어가 해당 업적을 획득했는지 확인
        player_achievement = PlayerAchievement.objects.filter(
            player=self.player, 
            achievement=achievement
        ).first()
        self.assertIsNotNone(player_achievement)

class GetCustomizationTest(TestCase):
    """커스터마이징 정보 조회 API 테스트"""
    
    def setUp(self):
        self.factory = RequestFactory()
        self.player = Player.objects.create(
            nickname="커스텀 테스트",
            outfit="formal",
            hat="graduation",
            shoes="dress"
        )
    
    def test_get_customization_with_player_id(self):
        """세션에 player_id가 있는 경우 테스트"""
        request = self.factory.get(reverse('game:get_customization'))
        request = add_middleware_to_request(request, SessionMiddleware)
        request.session['player_id'] = str(self.player.id)
        request.session.save()
        
        response = get_customization(request)
        data = json.loads(response.content)
        
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['customization']['outfit'], 'formal')
        self.assertEqual(data['customization']['hat'], 'graduation')
        self.assertEqual(data['customization']['shoes'], 'dress')
    
    def test_get_customization_without_player_id(self):
        """세션에 player_id가 없는 경우 테스트"""
        request = self.factory.get(reverse('game:get_customization'))
        request = add_middleware_to_request(request, SessionMiddleware)
        request.session.save()
        
        response = get_customization(request)
        data = json.loads(response.content)
        
        self.assertEqual(data['status'], 'error')
        self.assertEqual(data['message'], '플레이어 ID가 없습니다')
        # 기본 커스터마이징 값을 반환하는지 확인
        self.assertEqual(data['customization']['outfit'], 'default')
        self.assertEqual(data['customization']['hat'], 'none')
        self.assertEqual(data['customization']['shoes'], 'default')
    
    def test_get_customization_player_not_found(self):
        """존재하지 않는, 잘못된 player_id 테스트"""
        request = self.factory.get(reverse('game:get_customization'))
        request = add_middleware_to_request(request, SessionMiddleware)
        request.session['player_id'] = str(uuid.uuid4())  # 존재하지 않는 ID
        request.session.save()
        
        response = get_customization(request)
        data = json.loads(response.content)
        
        self.assertEqual(data['status'], 'error')
        self.assertEqual(data['message'], '플레이어를 찾을 수 없습니다')

class AdditionalViewsTest(TestCase):
    """기존에 테스트되지 않은 뷰 테스트"""
    
    def setUp(self):
        self.client = Client()
        self.player = Player.objects.create(
            nickname="추가 뷰 테스트",
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
    
    def test_presentation_view(self):
        """발표용 리더보드 뷰 테스트"""
        response = self.client.get(reverse('game:presentation'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'game/presentation.html')
        
        # 컨텍스트에 데이터가 있는지 확인
        self.assertIn('scores', response.context)
        self.assertEqual(len(response.context['scores']), 1)

class SavePlayerEdgeCasesTest(TestCase):
    """save_player 엣지 케이스 테스트"""
    
    def setUp(self):
        self.client = Client()
        self.factory = RequestFactory()
        
    def test_save_player_invalid_json(self):
        """잘못된 JSON 포맷으로 요청 시 테스트"""
        response = self.client.post(
            reverse('game:save_player'),
            data="not a valid json",
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'error')
    
    def test_save_player_update_existing(self):
        """기존 플레이어 업데이트 테스트"""
        # 먼저 플레이어 생성
        player = Player.objects.create(
            nickname="기존 유저",
            outfit="default",
            hat="none",
            shoes="default"
        )
        
        # 세션에 player_id 설정
        session = self.client.session
        session['player_id'] = str(player.id)
        session.save()
        
        # 커스터마이징 업데이트
        player_data = {
            'outfit': 'formal',
            'hat': 'graduation',
            'shoes': 'dress'
        }
        
        response = self.client.post(
            reverse('game:save_player'),
            data=json.dumps(player_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # 플레이어 정보가 업데이트되었는지 확인
        updated_player = Player.objects.get(id=player.id)
        self.assertEqual(updated_player.outfit, 'formal')
        self.assertEqual(updated_player.hat, 'graduation')
        self.assertEqual(updated_player.shoes, 'dress')

class SaveScoreEdgeCasesTest(TestCase):
    """save_score 엣지 케이스 테스트"""
    
    def setUp(self):
        self.client = Client()
        
    def test_save_score_invalid_json(self):
        """잘못된 JSON 포맷으로 요청 시 테스트"""
        response = self.client.post(
            reverse('game:save_score'),
            data="not a valid json",
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'error')
    
    def test_save_score_with_nickname_change(self):
        """닉네임 변경을 포함한 점수 저장 테스트"""
        # 플레이어 생성
        player = Player.objects.create(
            nickname="원래 닉네임",
            outfit="default",
            hat="none",
            shoes="default"
        )
        
        # 점수 및 닉네임 변경 저장
        score_data = {
            'player_id': str(player.id),
            'score': 800,
            'play_time': 45,
            'max_stage': 4,
            'items_collected': 15,
            'obstacles_avoided': 25,
            'max_combo': 8,
            'nickname': '변경된 닉네임'
        }
        
        response = self.client.post(
            reverse('game:save_score'),
            data=json.dumps(score_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        
        # 닉네임이 변경되었는지 확인
        updated_player = Player.objects.get(id=player.id)
        self.assertEqual(updated_player.nickname, '변경된 닉네임')
        
        # 점수가 저장되었는지 확인
        self.assertEqual(Score.objects.count(), 1)
        saved_score = Score.objects.first()
        self.assertEqual(saved_score.score, 800) 