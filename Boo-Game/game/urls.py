from django.urls import path
from . import views
from . import api

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
    
    # API 문서화를 위한 명시적 API URL
    path('api/v1/save-player/', api.save_player_api, name='api_save_player'),
    path('api/v1/save-score/', api.save_score_api, name='api_save_score'),
    path('api/v1/leaderboard/', api.get_leaderboard_api, name='api_leaderboard'),
    path('api/v1/update-nickname/', api.update_nickname_api, name='api_update_nickname'),
] 