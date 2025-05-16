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

#5월 16일 공부 내용
클래스 선언
class 키워드를 사용하여 객체의 설계도를 정의
객체 지향 방식으로 코드를 구조화하는 데 유용함

생성자 (constructor)
객체가 생성될 때 자동으로 호출되는 메서드
초기값 설정 및 프로퍼티 정의에 사용됨

메서드 정의
클래스 내부에서 메서드를 정의하면 해당 클래스의 모든 인스턴스에서 공유됨
일반 함수와는 달리 function 키워드를 사용하지 않음
this 키워드
클래스 내부에서 현재 인스턴스를 가리키며, 속성이나 메서드에 접근할 때 사용됨

상속 (extends)
다른 클래스로부터 기능을 물려받을 수 있음
코드 재사용성을 높이고, 공통 기능을 부모 클래스에 정의할 수 있음