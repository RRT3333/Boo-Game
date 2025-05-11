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