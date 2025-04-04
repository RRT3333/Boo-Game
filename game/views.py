from django.shortcuts import render
from django.http import JsonResponse
from .models import Score
from django.db.models import Max
from django.views.decorators.csrf import csrf_exempt
import json

def game_view(request):
    return render(request, 'game/game.html')

def leaderboard_view(request):
    top_scores = Score.objects.values('player_ip').annotate(
        best_score=Max('score')
    ).order_by('-best_score')[:10]
    return render(request, 'game/leaderboard.html', {'scores': top_scores})

@csrf_exempt
def save_score(request):
    if request.method == 'POST':
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                score = data.get('score')
            else:
                score = request.POST.get('score')
            
            if score:
                Score.objects.create(
                    player_ip=request.META.get('REMOTE_ADDR'),
                    score=int(score)
                )
                return JsonResponse({'status': 'success'})
        except (ValueError, json.JSONDecodeError):
            pass
    return JsonResponse({'status': 'error'}, status=400)
