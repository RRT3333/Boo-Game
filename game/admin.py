from django.contrib import admin
from .models import Player, Score, Achievement, PlayerAchievement

class PlayerAdmin(admin.ModelAdmin):
    list_display = ('nickname', 'ip_address', 'created_at', 'outfit', 'hat', 'shoes')
    search_fields = ('nickname', 'ip_address')

class ScoreAdmin(admin.ModelAdmin):
    list_display = ('player', 'score', 'play_time', 'max_stage', 'created_at')
    list_filter = ('max_stage', 'created_at')
    search_fields = ('player__nickname',)

class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'icon')
    search_fields = ('name', 'description')

class PlayerAchievementAdmin(admin.ModelAdmin):
    list_display = ('player', 'achievement', 'achieved_at')
    list_filter = ('achievement', 'achieved_at')
    search_fields = ('player__nickname', 'achievement__name')

admin.site.register(Player, PlayerAdmin)
admin.site.register(Score, ScoreAdmin)
admin.site.register(Achievement, AchievementAdmin)
admin.site.register(PlayerAchievement, PlayerAchievementAdmin)
