# Laon Focus App

ADHD 친화적인 TODO 관리 데스크톱 앱입니다. **Notion 데이터베이스**와 연동하여 할 일을 관리하며, 화면 왼쪽 하단에 고양이 캐릭터 "라온"이 항상 떠 있으면서 남은 할 일 개수를 알려줍니다. 투명 배경 + always-on-top으로 다른 작업 중에도 항상 확인 가능합니다.

## 주요 기능

- **라온 마스코트**: 화면에 항상 떠 있는 고양이. 호버 시 `"할 일 N개 남았다냥!"` 말풍선 표시
- **TODO 리스트**: 라온을 클릭하면 패널이 열리며 Notion DB에서 할 일 목록을 불러옴
- **상태 변경**: 클릭으로 `Not started → In progress → Done` 순환
- **필터**: 전체 / 진행 중 / 완료 탭
- **Notion 페이지 열기**: 각 할 일 클릭 시 Notion 페이지로 바로 이동
- **클릭 투과**: 투명 영역은 클릭이 뒤로 통과 (작업 방해 없음)

## 사용자 설치 방법

[Releases](https://github.com/JoyDaheeCha/laon-assistant-app/releases) 페이지에서 최신 버전을 다운로드합니다.

- **Mac**: `.dmg` 파일 다운로드 → 열기 → Applications 폴더로 드래그
- **Windows**: `.exe` 파일 다운로드 → 실행

앱을 처음 실행하면 **"Notion 연결하기"** 버튼이 나타납니다. 클릭하면 브라우저에서 Notion 로그인 후 권한을 허용하고, 사용할 데이터베이스를 선택하면 설정이 완료됩니다.

## 개발 환경 설정

### 1. Notion Public Integration 생성

1. https://www.notion.so/my-integrations 접속
2. **"+ New integration"** 클릭 → 타입을 **Public**으로 선택
3. Redirect URI에 `http://localhost:19847/notion/callback` 입력
4. 생성 후 **OAuth client ID**와 **OAuth client secret** 복사

### 2. 프로젝트 설정

```bash
git clone https://github.com/JoyDaheeCha/laon-assistant-app.git
cd laon-assistant-app
npm install

cp .env.example .env
# .env 파일에 OAuth client ID와 secret 입력
```

### 3. 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
```

## Notion 연동 구조

앱은 **Notion OAuth**를 사용하여 사용자 인증을 처리합니다. 사용자는 토큰이나 Database ID를 직접 입력할 필요 없이, 앱 내에서 자동으로 연결됩니다.

1. 앱 첫 실행 → "Notion 연결하기" 클릭
2. 브라우저에서 Notion 로그인 및 권한 허용 (공유할 페이지/DB 선택)
3. 앱으로 자동 복귀 → 공유된 데이터베이스 목록에서 선택
4. 설정 완료 — 토큰과 DB 설정은 로컬에 안전하게 저장됨

데이터베이스에는 다음 속성(property)이 필요합니다:

| 속성명 | 타입 | 값 |
|--------|------|----|
| Name | Title | 할 일 제목 |
| Status | Status | `Not started`, `In progress`, `Done` |
| Priority | Select | `High`, `Medium`, `Low` |
| Due Date | Date | 마감일 |
| Tags | Multi-select | `work`, `study`, `health`, `daily` 등 |
