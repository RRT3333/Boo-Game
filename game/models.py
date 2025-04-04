from django.db import models

# Create your models here.

class Score(models.Model):
    player_ip = models.GenericIPAddressField()
    score = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.player_ip} - {self.score} points"
