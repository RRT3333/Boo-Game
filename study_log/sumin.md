20250508
CSS-flexbox: 웹페이지를 1차원 정렬함 가로 or 세로

주축 정렬
jsutify-content: space-between 양 끝에 딱 붙인 채로 정렬
                 space-around 끝에 공간 두고 정렬
교차축 정렬
align-items: 
방향 나열
flex-direction: row 가로
                row-reverse 가로 반대로
                colum 세로
순서 지정
order: (숫자, 현재 위치 1 기준 뒤는 -1)
개별요소의 교차축 정렬
align-self: (align-items와 동일)
줄바꿈
flex-wrap: nowrap 한줄에 정렬
           wrap 여러줄에 정렬
           wrap-reverse 여러줄에 걸쳐 반대로
flex-direction과 flex-wrap을 합침
flex-flow: row wrap 이런식으로 사용
