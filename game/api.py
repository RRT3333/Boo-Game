from rest_framework import serializers, viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .models import Player, Score, Achievement, PlayerAchievement


# 시리얼라이저 정의
class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'nickname', 'outfit', 'hat', 'shoes', 'created_at']


class ScoreSerializer(serializers.ModelSerializer):
    player_nickname = serializers.CharField(source='player.nickname', read_only=True)
    
    class Meta:
        model = Score
        fields = ['id', 'player', 'player_nickname', 'score', 'play_time', 
                  'max_stage', 'items_collected', 'obstacles_avoided', 
                  'max_combo', 'created_at']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'icon']


class PlayerAchievementSerializer(serializers.ModelSerializer):
    achievement_name = serializers.CharField(source='achievement.name', read_only=True)
    achievement_description = serializers.CharField(source='achievement.description', read_only=True)
    
    class Meta:
        model = PlayerAchievement
        fields = ['id', 'player', 'achievement', 'achievement_name', 
                  'achievement_description', 'earned_at']


# API 뷰 정의
@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['outfit', 'hat', 'shoes'],
        properties={
            'outfit': openapi.Schema(type=openapi.TYPE_STRING, description='캐릭터 의상'),
            'hat': openapi.Schema(type=openapi.TYPE_STRING, description='캐릭터 모자'),
            'shoes': openapi.Schema(type=openapi.TYPE_STRING, description='캐릭터 신발'),
        },
    ),
    responses={
        status.HTTP_200_OK: openapi.Response(
            description="플레이어 저장 성공",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                    'player_id': openapi.Schema(type=openapi.TYPE_STRING),
                },
            )
        ),
    },
    operation_description="플레이어 커스터마이징 정보를 저장합니다."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def save_player_api(request):
    """플레이어 정보 저장 API"""
    from .views import save_player
    return save_player(request)


@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['player_id', 'score', 'play_time', 'max_stage'],
        properties={
            'player_id': openapi.Schema(type=openapi.TYPE_STRING, description='플레이어 ID'),
            'score': openapi.Schema(type=openapi.TYPE_INTEGER, description='게임 점수'),
            'play_time': openapi.Schema(type=openapi.TYPE_INTEGER, description='플레이 시간(초)'),
            'max_stage': openapi.Schema(type=openapi.TYPE_INTEGER, description='최대 스테이지'),
            'items_collected': openapi.Schema(type=openapi.TYPE_INTEGER, description='수집한 아이템 수'),
            'obstacles_avoided': openapi.Schema(type=openapi.TYPE_INTEGER, description='피한 장애물 수'),
            'max_combo': openapi.Schema(type=openapi.TYPE_INTEGER, description='최대 콤보'),
            'nickname': openapi.Schema(type=openapi.TYPE_STRING, description='플레이어 닉네임'),
        },
    ),
    responses={
        status.HTTP_200_OK: openapi.Response(
            description="점수 저장 성공",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                    'score_id': openapi.Schema(type=openapi.TYPE_INTEGER),
                },
            )
        ),
    },
    operation_description="게임 점수를 저장합니다."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def save_score_api(request):
    """게임 점수 저장 API"""
    from .views import save_score
    return save_score(request)


@swagger_auto_schema(
    method='get',
    responses={
        status.HTTP_200_OK: openapi.Response(
            description="리더보드 데이터",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'leaderboard': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'nickname': openapi.Schema(type=openapi.TYPE_STRING),
                                'score': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'time': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'customization': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'outfit': openapi.Schema(type=openapi.TYPE_STRING),
                                        'hat': openapi.Schema(type=openapi.TYPE_STRING),
                                        'shoes': openapi.Schema(type=openapi.TYPE_STRING),
                                    }
                                ),
                            }
                        )
                    ),
                },
            )
        ),
    },
    operation_description="리더보드 데이터를 가져옵니다."
)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_leaderboard_api(request):
    """리더보드 데이터 API"""
    from .views import get_leaderboard_data
    return get_leaderboard_data(request)


@swagger_auto_schema(
    method='post',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=['player_id', 'nickname'],
        properties={
            'player_id': openapi.Schema(type=openapi.TYPE_STRING, description='플레이어 ID'),
            'nickname': openapi.Schema(type=openapi.TYPE_STRING, description='새 닉네임'),
        },
    ),
    responses={
        status.HTTP_200_OK: openapi.Response(
            description="닉네임 업데이트 성공",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING),
                    'player_id': openapi.Schema(type=openapi.TYPE_STRING),
                    'nickname': openapi.Schema(type=openapi.TYPE_STRING),
                },
            )
        ),
    },
    operation_description="플레이어 닉네임을 업데이트합니다."
)
@api_view(['POST'])
@permission_classes([AllowAny])
def update_nickname_api(request):
    """닉네임 업데이트 API"""
    from .views import update_nickname
    return update_nickname(request) 