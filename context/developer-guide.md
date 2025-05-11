# Boo Game Developer 앱 가이드

이 문서는 Boo Game 프로젝트의 Developer 앱에 대한 설명과 사용 방법을 안내합니다.

## 1. Developer 앱 소개

Developer 앱은 Boo Game 프로젝트의 개발 과정을 돕기 위한 도구 모음입니다. 주요 기능은 다음과 같습니다:

- **대시보드**: 프로젝트 상태 및 개발 환경 정보 제공
- **문서 허브**: 프로젝트 내 마크다운 문서를 자동으로 감지하고 표시
- **API 클라이언트 문서**: API 사용 방법 안내
- **마크다운 렌더링**: 마크다운 파일을 HTML로 변환하여 브라우저에서 보기 좋게 표시

## 2. 접근 방법

개발자 앱은 다음 URL을 통해 접근할 수 있습니다:

- **대시보드**: http://127.0.0.1:8000/developer/
- **문서 허브**: http://127.0.0.1:8000/developer/docs-hub/
- **API 클라이언트 문서**: http://127.0.0.1:8000/developer/api-client-docs/
- **마크다운 렌더링**: http://127.0.0.1:8000/developer/docs/[파일경로]

## 3. 마크다운 문서 관리

### 3.1 마크다운 문서 위치

모든 프로젝트 문서는 `context/` 폴더에 저장됩니다. 이 폴더 내에는 다음과 같은 구조로 문서가 정리되어 있습니다:

```
context/
  ├── reports/       # 주차별 보고서
  ├── study/         # 학습 자료
  ├── prd.md         # 제품 요구사항 문서
  ├── erd.md         # ERD 및 데이터베이스 설계
  ├── ...
```

### 3.2 문서 스캔 명령어

개발자 앱은 마크다운 파일을 자동으로 스캔하고 메타데이터를 생성하는 커스텀 관리 명령어를 제공합니다:

```bash
# 문서 스캔 및 메타데이터 생성
python manage.py scan_markdown_files_new

# 기존 메타데이터 초기화 후 다시 스캔
python manage.py scan_markdown_files_new --reset

# 메타데이터 파일만 삭제
python manage.py scan_markdown_files_new --delete
```

이 명령어는 `context/` 폴더 내의 마크다운 파일과 프로젝트 루트의 README.md를 스캔하여 메타데이터를 생성합니다. 생성된 메타데이터는 `static/markdown_metadata.json` 파일에 저장됩니다.

## 4. 마크다운 렌더링 원리

Developer 앱은 마크다운 파일을 HTML로 렌더링하여 브라우저에서 볼 수 있게 합니다. 이 과정은 다음과 같이 작동합니다:

1. **URL 요청 처리**: `/developer/docs/[파일경로]` 형식의 URL이 `render_markdown` 뷰 함수로 전달됩니다.

2. **파일 로드**: 요청된 경로에서 마크다운 파일을 찾고 콘텐츠를 읽어옵니다.

3. **마크다운 변환**: Python의 `markdown` 라이브러리를 사용하여 마크다운 텍스트를 HTML로 변환합니다.
   ```python
   html_content = markdown.markdown(
       md_content,
       extensions=['extra', 'codehilite', 'toc', 'tables', 'fenced_code']
   )
   ```

4. **템플릿 렌더링**: 변환된 HTML을 `markdown-viewer.html` 템플릿에 전달하여 최종 페이지를 렌더링합니다.

5. **스타일 적용**: `developer/static/css/markdown.css` 파일의 스타일이 적용되어 마크다운 내용이 보기 좋게 표시됩니다.

## 5. 문서 허브 원리

문서 허브는 프로젝트 내 모든 마크다운 문서를 체계적으로 표시하는 페이지입니다. 작동 원리는 다음과 같습니다:

1. **메타데이터 로드**: `get_markdown_metadata()` 함수를 통해 `static/markdown_metadata.json` 파일에서 메타데이터를 로드합니다.

2. **카테고리 정렬**: 마크다운 파일은 내용과 경로에 따라 다음 카테고리로 분류됩니다:
   - 프로젝트 문서
   - 가이드 문서
   - 기술 문서
   - 보고서
   - 기타 문서

3. **문서 정보 표시**: 각 문서의 제목, 설명, 수정 일자, 크기 등을 카드 형태로 표시합니다.

4. **빈 카테고리 처리**: 문서가 없는 카테고리는 자동으로 숨겨집니다.

## 6. 개발자 앱 확장하기

개발자 앱을 확장하거나 커스터마이징하는 방법은 다음과 같습니다:

### 6.1 새 뷰 추가

새로운 개발 도구를 추가하려면:

1. `developer/views.py`에 뷰 함수 추가
2. `developer/urls.py`에 URL 패턴 추가
3. 필요한 템플릿 파일 생성 (templates/developer/ 폴더 내)

### 6.2 마크다운 렌더링 확장

마크다운 렌더링 기능을 확장하려면:

```python
# views.py에서 확장 기능 추가
html_content = markdown.markdown(
    md_content,
    extensions=[
        'extra', 'codehilite', 'toc', 'tables', 'fenced_code',
        'nl2br', 'sane_lists'  # 추가 확장 기능
    ]
)
```

### 6.3 스타일 커스터마이징

마크다운 렌더링 스타일을 변경하려면 `developer/static/css/markdown.css` 파일을 수정하세요.

## 7. 문제 해결

### 7.1 마크다운 렌더링 문제

문서가 제대로 표시되지 않는 경우:

1. `static/markdown_metadata.json` 파일이 존재하는지 확인
2. `python manage.py scan_markdown_files_new --reset` 명령 실행
3. `python manage.py collectstatic` 명령 실행

### 7.2 CSS 로딩 문제

스타일이 적용되지 않는 경우:

1. 개발자 도구에서 CSS 파일 로드 여부 확인 (404 오류 확인)
2. `collectstatic` 명령이 성공적으로 실행되었는지 확인
3. `settings.py`의 `STATIC_URL`과 `STATICFILES_DIRS` 설정 확인

## 8. 예제: 마크다운 문서 추가 및 표시

새 마크다운 문서를 만들고 문서 허브에 표시하는 과정:

1. `context/` 폴더에 새 마크다운 파일 생성 (예: `context/new-guide.md`)
2. 마크다운 형식으로 내용 작성
3. 문서 스캔 명령 실행: `python manage.py scan_markdown_files_new`
4. 웹 브라우저에서 http://localhost:8000/developer/docs-hub/ 접속
5. 새 문서가 표시되는지 확인

## 9. 참고 자료

- [Django 공식 문서](https://docs.djangoproject.com/)
- [Python Markdown 라이브러리](https://python-markdown.github.io/)
- [Django 정적 파일 관리](https://docs.djangoproject.com/en/3.2/howto/static-files/) 