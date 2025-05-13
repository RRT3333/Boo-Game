from django.db import models
import uuid

# Create your models here.

class Player(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nickname = models.CharField(max_length=20, default="익명의 학생")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # 커스터마이징 정보
    outfit = models.CharField(max_length=50, default="default")
    hat = models.CharField(max_length=50, default="none")
    shoes = models.CharField(max_length=50, default="default")
    
    def __str__(self):
        return f"{self.nickname} ({self.id})"

class Score(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    score = models.IntegerField(default=0)
    play_time = models.IntegerField(default=0, help_text="플레이 시간(초)")
    max_stage = models.IntegerField(default=1, help_text="도달한 최대 스테이지")
    created_at = models.DateTimeField(auto_now_add=True)
    
    # 게임 통계
    items_collected = models.IntegerField(default=0)
    obstacles_avoided = models.IntegerField(default=0)
    max_combo = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.player.nickname} - {self.score} 점 ({self.play_time}초)"

class Achievement(models.Model):
    """게임 업적 시스템"""
    name = models.CharField(max_length=50)
    description = models.TextField()
    icon = models.CharField(max_length=100, default="default")
    
    def __str__(self):
        return self.name

class PlayerAchievement(models.Model):
    """플레이어별 달성 업적"""
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    achieved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('player', 'achievement')
    
    def __str__(self):
        return f"{self.player.nickname} - {self.achievement.name}"
