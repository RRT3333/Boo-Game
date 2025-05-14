from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse, Http404
from .models import Score, Player, Achievement, PlayerAchievement
from django.db.models import Max, Count
from django.views.decorators.csrf import csrf_exempt
import json
import uuid
from django.conf import settings

def index_view(request):
    """메인 시작 페이지"""
    # 리더보드 상위 3명 데이터
    top_players = Score.objects.values('player').annotate(
        best_score=Max('score')
    ).order_by('-best_score')[:3]
    
    top_players_data = []
    for entry in top_players:
        player = Player.objects.get(id=entry['player'])
        top_players_data.append({
            'nickname': player.nickname,
            'score': entry['best_score'],
            'outfit': player.outfit,
            'hat': player.hat,
            'shoes': player.shoes
        })
    
    return render(request, 'game/index.html', {'top_players': top_players_data})

def customize_view(request):
    """캐릭터 커스터마이징 페이지"""
    # 사용 가능한 커스터마이징 옵션들
    customization_options = {
        'outfits': ['default', 'casual', 'formal', 'sporty', 'hoodie'],
        'hats': ['none', 'cap', 'beanie', 'graduation', 'sunglasses'],
        'shoes': ['default', 'sneakers', 'boots', 'sandals', 'dress']
    }
    
    return render(request, 'game/customize.html', {'options': customization_options})

def game_view(request):
    """게임 플레이 페이지"""
    # 플레이어 ID를 세션에서 받아오거나 새로 생성
    player_id = request.session.get('player_id')
    
    # 커스터마이징 정보도 함께 전달
    customization = {
        'outfit': request.session.get('outfit', 'default'),
        'hat': request.session.get('hat', 'none'),
        'shoes': request.session.get('shoes', 'default')
    }
    
    return render(request, 'game/game.html', {'player_id': player_id, 'customization': customization})

def leaderboard_view(request):
    """일반 리더보드 페이지"""
    top_scores = Score.objects.values('player').annotate(
        best_score=Max('score'),
        games_played=Count('id')
    ).order_by('-best_score')[:10]
    
    leaderboard_data = []
    for entry in top_scores:
        player = Player.objects.get(id=entry['player'])
        best_game = Score.objects.filter(player=player, score=entry['best_score']).first()
        
        leaderboard_data.append({
            'nickname': player.nickname,
            'score': entry['best_score'],
            'time': best_game.play_time if best_game else 0,
            'stage': best_game.max_stage if best_game else 1,
            'games_played': entry['games_played'],
            'outfit': player.outfit,
            'hat': player.hat,
            'shoes': player.shoes
        })
    
    return render(request, 'game/leaderboard.html', {'scores': leaderboard_data})

def presentation_view(request):
    """와이드스크린 발표용 리더보드"""
    top_scores = Score.objects.values('player').annotate(
        best_score=Max('score')
    ).order_by('-best_score')[:20]
    
    leaderboard_data = []
    for entry in top_scores:
        player = Player.objects.get(id=entry['player'])
        best_game = Score.objects.filter(player=player, score=entry['best_score']).first()
        
        leaderboard_data.append({
            'nickname': player.nickname,
            'score': entry['best_score'],
            'time': best_game.play_time if best_game else 0,
            'outfit': player.outfit,
            'hat': player.hat,
            'shoes': player.shoes
        })
    
    return render(request, 'game/presentation.html', {'scores': leaderboard_data})

@csrf_exempt
def save_player(request):
    """플레이어 정보 저장 API"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body) if request.content_type == 'application/json' else request.POST

            outfit = data.get('outfit', 'default')
            hat = data.get('hat', 'none')
            shoes = data.get('shoes', 'default')

            # 세션에 player_id가 있으면 기존 Player 사용
            player_id = request.session.get('player_id')
            player = None
            if player_id:
                try:
                    player = Player.objects.get(id=player_id)
                except Player.DoesNotExist:
                    player = None

            # 없으면 새로 생성, 닉네임은 항상 '익명의 학생'으로 설정
            if not player:
                player = Player.objects.create(
                    nickname='익명의 학생',  # 닉네임은 기본값으로 설정
                    ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0'),
                    outfit=outfit,
                    hat=hat,
                    shoes=shoes
                )
                request.session['player_id'] = str(player.id)

            # 커스터마이징 정보 업데이트
            player.outfit = outfit
            player.hat = hat
            player.shoes = shoes
            player.save()

            request.session['outfit'] = outfit
            request.session['hat'] = hat
            request.session['shoes'] = shoes

            return JsonResponse({
                'status': 'success',
                'player_id': str(player.id)
            })

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def save_score(request):
    """게임 점수 저장 API"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
            
            player_id = data.get('player_id')
            score_value = int(data.get('score', 0))
            play_time = int(data.get('play_time', 0))
            max_stage = int(data.get('max_stage', 1))
            items_collected = int(data.get('items_collected', 0))
            obstacles_avoided = int(data.get('obstacles_avoided', 0))
            max_combo = int(data.get('max_combo', 0))
            nickname = data.get('nickname', '익명의 학생')
            
            # 플레이어 가져오기
            try:
                player = Player.objects.get(id=player_id)
                # 닉네임이 변경되었다면 업데이트
                if nickname != player.nickname:
                    player.nickname = nickname
                    player.save()
            except (Player.DoesNotExist, ValueError):
                # 플레이어 ID가 유효하지 않으면 새 플레이어 생성
                player = Player.objects.create(
                    nickname=nickname,
                    ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0')
                )
                request.session['player_id'] = str(player.id)
            
            # 점수 저장
            score = Score.objects.create(
                player=player,
                score=score_value,
                play_time=play_time,
                max_stage=max_stage,
                items_collected=items_collected,
                obstacles_avoided=obstacles_avoided,
                max_combo=max_combo
            )
            
            # 업적 확인 및 부여
            check_achievements(player, score)
            
            return JsonResponse({'status': 'success', 'score_id': score.id})
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)

def get_leaderboard_data(request):
    """리더보드 데이터 API"""
    top_scores = Score.objects.values('player').annotate(
        best_score=Max('score')
    ).order_by('-best_score')[:10]
    
    leaderboard_data = []
    for entry in top_scores:
        player = Player.objects.get(id=entry['player'])
        best_game = Score.objects.filter(player=player, score=entry['best_score']).first()
        
        leaderboard_data.append({
            'nickname': player.nickname,
            'score': entry['best_score'],
            'time': best_game.play_time if best_game else 0,
            'stage': best_game.max_stage if best_game else 1,
            'customization': {
                'outfit': player.outfit,
                'hat': player.hat,
                'shoes': player.shoes
            }
        })
    
    return JsonResponse({'leaderboard': leaderboard_data})

def check_achievements(player, score):
    """플레이어의 업적 확인 및 부여"""
    # 점수 기반 업적
    if score.score >= 1000:
        achievement, created = Achievement.objects.get_or_create(
            name="1000점 달성",
            defaults={"description": "1000점을 달성하셨습니다!", "icon": "medal_gold"}
        )
        PlayerAchievement.objects.get_or_create(player=player, achievement=achievement)
    
    # 스테이지 기반 업적
    if score.max_stage >= 6:  # 정문 도달
        achievement, created = Achievement.objects.get_or_create(
            name="졸업생",
            defaults={"description": "외대를 졸업하셨습니다!", "icon": "graduation"}
        )
        PlayerAchievement.objects.get_or_create(player=player, achievement=achievement)
    
    # 콤보 기반 업적
    if score.max_combo >= 10:
        achievement, created = Achievement.objects.get_or_create(
            name="콤보 마스터",
            defaults={"description": "10 콤보를 달성하셨습니다!", "icon": "combo"}
        )
        PlayerAchievement.objects.get_or_create(player=player, achievement=achievement)

@csrf_exempt
def update_nickname(request):
    """플레이어 닉네임만 업데이트하는 API"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
            player_id = data.get('player_id')
            nickname = data.get('nickname', '익명의 학생')
            player = Player.objects.get(id=player_id)
            player.nickname = nickname
            player.save()
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)
