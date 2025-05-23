Session ID와 Player ID의 생성 과정은 다음과 같습니다:

1. **Session ID 생성**:
   - Django가 자동으로 생성합니다
   - 사용자가 처음 웹사이트에 접속할 때 자동으로 생성되며, `request.session.session_key`에 저장됩니다
   - 이는 Django의 내장 세션 관리 시스템에 의해 처리됩니다

2. **Player ID 생성**:
   - `game/views.py`의 `save_player` 함수에서 생성됩니다
   - 생성 과정:
     1. 먼저 세션에서 기존 player_id를 확인합니다
     2. 없으면 새로운 Player 객체를 생성합니다:
     ```python
     player = Player.objects.create(
         nickname='익명의 학생',
         ip_address=request.META.get('REMOTE_ADDR', '0.0.0.0'),
         outfit=outfit,
         hat=hat,
         shoes=shoes
     )
     ```
     3. 생성된 Player의 ID를 세션에 저장합니다:
     ```python
     request.session['player_id'] = str(player.id)
     ```

3. **Player ID 생성 시점**:
   - 게임 시작 시 캐릭터 커스터마이징 후 `/game/api/save-player/` API를 호출할 때
   - 게임 오버 시 점수 저장 시 (`/game/api/save-score/`)
   - 이때 기존 Player ID가 없으면 새로 생성됩니다

4. **Player ID 형식**:
   - UUID 형식입니다 (models.py에서 확인):
   ```python
   id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
   ```

즉, Session ID는 Django가 자동으로 관리하고, Player ID는 게임 플레이어가 처음 게임을 시작하거나 점수를 저장할 때 생성되는 구조입니다.
