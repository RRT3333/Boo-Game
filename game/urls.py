from django.urls import path
from . import views

app_name = 'game'

urlpatterns = [
    path('', views.game_view, name='index'),
    path('leaderboard/', views.leaderboard_view, name='leaderboard'),
    path('save-score/', views.save_score, name='save_score'),
] 