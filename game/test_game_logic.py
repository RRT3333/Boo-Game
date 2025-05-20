from django.test import TestCase, Client
from django.urls import reverse
from .models import Player, Score, Achievement, PlayerAchievement
from .views import check_achievements
import json
import uuid

class GameLogicTest(TestCase):
    """게임 로직 테스트"""
    
    def setUp(self):
        self.player = Player.objects.create(nickname="게임 로직 테스트 유저")
    
    def test_achievement_logic(self):
        """업적 부여 로직 테스트"""
        # 점수가 1000점 이상인 경우의 스코어 생성
        high_score = Score.objects.create(
            player=self.player,
            score=1200,
            play_time=50,
            max_stage=5,
            items_collected=25,
            obstacles_avoided=30,
            max_combo=15
        )
        
        # 업적 확인 로직 실행
        check_achievements(self.player, high_score)
        
        # 1000점 달성 업적이 생성되었는지 확인
        achievement = Achievement.objects.get(name="1000점 달성")
        self.assertIsNotNone(achievement)
        
        # 플레이어가 해당 업적을 받았는지 확인
        player_achievement = PlayerAchievement.objects.filter(
            player=self.player,
            achievement=achievement
        ).first()
        self.assertIsNotNone(player_achievement)
    
    def test_graduation_achievement(self):
        """졸업 업적 부여 테스트"""
        # 최종 스테이지(6단계) 도달 스코어 생성
        final_stage_score = Score.objects.create(
            player=self.player,
            score=800,
            play_time=60,
            max_stage=6,  # 정문 도달 (최종 스테이지)
            items_collected=20,
            obstacles_avoided=25,
            max_combo=10
        )
        
        # 업적 확인 로직 실행
        check_achievements(self.player, final_stage_score)
        
        # 졸업생 업적이 생성되었는지 확인
        try:
            achievement = Achievement.objects.get(name="졸업생")
            self.assertIsNotNone(achievement)
            
            # 플레이어가 해당 업적을 받았는지 확인
            player_achievement = PlayerAchievement.objects.filter(
                player=self.player,
                achievement=achievement
            ).first()
            self.assertIsNotNone(player_achievement)
        except Achievement.DoesNotExist:
            self.fail("졸업생 업적이 생성되지 않았습니다.")
    
class GameAPIIntegrationTest(TestCase):
    """게임 API 통합 테스트"""
    
    def setUp(self):
        self.client = Client()
        self.player = Player.objects.create(
            nickname="API 통합 테스트 유저",
            outfit="formal",
            hat="graduation",
            shoes="dress"
        )
    
    def test_player_save_and_update(self):
        """플레이어 저장 및 업데이트 통합 테스트"""
        # 새 플레이어 정보 저장
        player_data = {
            'outfit': 'sporty',
            'hat': 'cap',
            'shoes': 'sneakers'
        }
        
        # 세션 초기화
        session = self.client.session
        session['player_id'] = str(self.player.id)
        session.save()
        
        response = self.client.post(
            reverse('game:save_player'),
            data=json.dumps(player_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        result = json.loads(response.content)
        self.assertEqual(result['status'], 'success')
        
        # 플레이어 정보가 업데이트되었는지 확인
        updated_player = Player.objects.get(id=self.player.id)
        self.assertEqual(updated_player.outfit, 'sporty')
        self.assertEqual(updated_player.hat, 'cap')
        self.assertEqual(updated_player.shoes, 'sneakers')
    
    def test_score_and_achievement_flow(self):
        """점수 저장 및 업적 부여 통합 흐름 테스트"""
        # 높은 점수와 최종 스테이지 도달 정보로 점수 저장
        score_data = {
            'player_id': str(self.player.id),
            'score': 1500,
            'play_time': 60,
            'max_stage': 6,
            'items_collected': 30,
            'obstacles_avoided': 40,
            'max_combo': 20,
            'nickname': '업적 달성자'
        }
        
        response = self.client.post(
            reverse('game:save_score'),
            data=json.dumps(score_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        result = json.loads(response.content)
        self.assertEqual(result['status'], 'success')
        
        # 닉네임이 업데이트되었는지 확인
        updated_player = Player.objects.get(id=self.player.id)
        self.assertEqual(updated_player.nickname, '업적 달성자')
        
        # 업적이 부여되었는지 확인 - 1000점 달성 및 졸업생 업적
        achievements = PlayerAchievement.objects.filter(player=self.player)
        self.assertGreaterEqual(achievements.count(), 2)  # 최소 2개 이상의 업적
        
        achievement_names = [pa.achievement.name for pa in achievements]
        self.assertIn('1000점 달성', achievement_names)
        self.assertIn('졸업생', achievement_names) 