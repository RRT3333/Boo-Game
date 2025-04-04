from django.contrib import admin
from .models import Score

@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ('player_ip', 'score', 'created_at')
    list_filter = ('created_at',)
    ordering = ('-score',)
