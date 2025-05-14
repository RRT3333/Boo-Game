from django.test import TestCase, Client
from django.urls import reverse
from .models import Player, Score, Achievement, PlayerAchievement
import uuid
import json

class PlayerModelTest(TestCase):
    """Player 모델 테스트"""
    
    def setUp(self):
        self.player = Player.objects.create(
            nickname="테스트 유저",
            outfit="casual",
            hat="cap",
            shoes="sneakers"
        )
    
    def test_player_creation(self):
        """Player 생성 테스트"""
        self.assertTrue(isinstance(self.player, Player))
        self.assertEqual(self.player.nickname, "테스트 유저")
        self.assertEqual(self.player.outfit, "casual")
        self.assertEqual(self.player.hat, "cap")
        self.assertEqual(self.player.shoes, "sneakers")
    
    def test_player_str(self):
        """Player __str__ 메서드 테스트"""
        self.assertEqual(str(self.player), f"테스트 유저 ({self.player.id})")

class ScoreModelTest(TestCase):
    """Score 모델 테스트"""
    
    def setUp(self):
        self.player = Player.objects.create(nickname="점수 테스트 유저")
        self.score = Score.objects.create(
            player=self.player,
            score=500,
            play_time=30,
            max_stage=3,
            items_collected=10,
            obstacles_avoided=20,
            max_combo=5
        )
    
    def test_score_creation(self):
        """Score 생성 테스트"""
        self.assertTrue(isinstance(self.score, Score))
        self.assertEqual(self.score.score, 500)
        self.assertEqual(self.score.play_time, 30)
        self.assertEqual(self.score.max_stage, 3)
        self.assertEqual(self.score.items_collected, 10)
        self.assertEqual(self.score.obstacles_avoided, 20)
        self.assertEqual(self.score.max_combo, 5)
    
    def test_score_str(self):
        """Score __str__ 메서드 테스트"""
        self.assertEqual(str(self.score), f"점수 테스트 유저 - 500 점 (30초)")

class AchievementModelTest(TestCase):
    """Achievement 모델 테스트"""
    
    def setUp(self):
        self.achievement = Achievement.objects.create(
            name="테스트 업적",
            description="테스트용 업적입니다.",
            icon="test_icon"
        )
    
    def test_achievement_creation(self):
        """Achievement 생성 테스트"""
        self.assertTrue(isinstance(self.achievement, Achievement))
        self.assertEqual(self.achievement.name, "테스트 업적")
        self.assertEqual(self.achievement.description, "테스트용 업적입니다.")
        self.assertEqual(self.achievement.icon, "test_icon")
    
    def test_achievement_str(self):
        """Achievement __str__ 메서드 테스트"""
        self.assertEqual(str(self.achievement), "테스트 업적")

class PlayerAchievementModelTest(TestCase):
    """PlayerAchievement 모델 테스트"""
    
    def setUp(self):
        self.player = Player.objects.create(nickname="업적 테스트 유저")
        self.achievement = Achievement.objects.create(
            name="테스트 업적",
            description="테스트용 업적입니다.",
            icon="test_icon"
        )
        self.player_achievement = PlayerAchievement.objects.create(
            player=self.player,
            achievement=self.achievement
        )
    
    def test_player_achievement_creation(self):
        """PlayerAchievement 생성 테스트"""
        self.assertTrue(isinstance(self.player_achievement, PlayerAchievement))
        self.assertEqual(self.player_achievement.player, self.player)
        self.assertEqual(self.player_achievement.achievement, self.achievement)
    
    def test_player_achievement_str(self):
        """PlayerAchievement __str__ 메서드 테스트"""
        self.assertEqual(str(self.player_achievement), "업적 테스트 유저 - 테스트 업적")

class ViewsTest(TestCase):
    """뷰 테스트"""
    
    def setUp(self):
        self.client = Client()
        self.player = Player.objects.create(
            nickname="테스트 유저",
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
    
    def test_index_view(self):
        """인덱스 뷰 테스트"""
        response = self.client.get(reverse('game:index'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'game/index.html')
    
    def test_leaderboard_view(self):
        """리더보드 뷰 테스트"""
        response = self.client.get(reverse('game:leaderboard'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'game/leaderboard.html')
    
    def test_game_view(self):
        """게임 뷰 테스트"""
        response = self.client.get(reverse('game:play'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'game/game.html')
    
    def test_customize_view(self):
        """커스터마이징 뷰 테스트"""
        response = self.client.get(reverse('game:customize'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'game/customize.html')

class APITest(TestCase):
    """API 테스트"""
    
    def setUp(self):
        self.client = Client()
        self.player = Player.objects.create(
            nickname="API 테스트 유저",
            outfit="casual",
            hat="cap",
            shoes="sneakers"
        )
    
    def test_save_score_api(self):
        """점수 저장 API 테스트"""
        score_data = {
            'player_id': str(self.player.id),
            'score': 800,
            'play_time': 45,
            'max_stage': 4,
            'items_collected': 15,
            'obstacles_avoided': 25,
            'max_combo': 8,
            'nickname': 'API 테스트 유저'
        }
        
        response = self.client.post(
            reverse('game:save_score'),
            data=json.dumps(score_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content)['status'], 'success')
        
        # 저장된 점수 확인
        self.assertEqual(Score.objects.count(), 1)
        saved_score = Score.objects.first()
        self.assertEqual(saved_score.score, 800)
        self.assertEqual(saved_score.player, self.player)
    
    def test_get_leaderboard_data_api(self):
        """리더보드 데이터 API 테스트"""
        # 점수 생성
        Score.objects.create(
            player=self.player,
            score=500,
            play_time=30,
            max_stage=3
        )
        
        response = self.client.get(reverse('game:get_leaderboard_data'))
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.content)
        self.assertIn('leaderboard', data)
        self.assertEqual(len(data['leaderboard']), 1)
        self.assertEqual(data['leaderboard'][0]['nickname'], 'API 테스트 유저')
        self.assertEqual(data['leaderboard'][0]['score'], 500)
