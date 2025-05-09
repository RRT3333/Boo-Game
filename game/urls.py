from django.urls import path
from . import views

app_name = 'game'

urlpatterns = [
    path('', views.index_view, name='index'),
    path('customize/', views.customize_view, name='customize'),
    path('play/', views.game_view, name='play'),
    path('leaderboard/', views.leaderboard_view, name='leaderboard'),
    path('presentation/', views.presentation_view, name='presentation'),
    path('api/save-score/', views.save_score, name='save_score'),
    path('api/save-player/', views.save_player, name='save_player'),
    path('api/get-leaderboard/', views.get_leaderboard_data, name='get_leaderboard_data'),
    path('api/update-nickname/', views.update_nickname, name='update_nickname'),
] 