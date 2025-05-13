# 5월 9일 공부내용
- 인프런 1강 완료
# 5월 10일 공부내용
- 인프런 2강 완료
# 5월 11일 공부내용
- 브랜치 사용 흐름 예시
main에서 새로운 기능을 개발하기 위해 브랜치 생성
→ git checkout -b feature/login

해당 브랜치에서 작업 후 커밋

main 브랜치로 돌아가서 병합
→ git checkout main
→ git merge feature/login

작업이 끝난 브랜치는 삭제
→ git branch -d feature/login
# 5월 13일 공부내용
- branch 사용 시 주의할 점
1. 브랜치 이름은 명확하고 일관성 있게
의미 있는 이름 사용: 예) feature/login, bugfix/signup-error
팀 규칙이 있다면 반드시 따르기

2. 브랜치를 만들기 전에 반드시 최신 상태로 업데이트
새 브랜치 생성 전:
git checkout main
git pull origin main
git checkout -b new-branch
최신 상태가 아닌 브랜치에서 작업하면 충돌이나 병합 오류 발생 가능

3. 작업 완료 후 병합 전, 충돌 가능성 확인
병합 전 꼭 최신 브랜치와 비교:
git fetch
git merge origin/main
충돌이 나면 직접 해결하고 다시 커밋해야 함