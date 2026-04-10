# Laon Focus App

ADHD 친화적인 TODO 관리 데스크톱 앱입니다. **Notion 데이터베이스**와 연동하여 할 일을 관리하며, 화면에 고양이 캐릭터 "라온"이 항상 떠 있으면서 남은 할 일 개수를 알려줍니다. 투명 배경 + always-on-top으로 다른 작업 중에도 항상 확인 가능합니다.

## 주요 기능

- **라온 마스코트**: 화면에 항상 떠 있는 고양이. 호버 시 `"할 일 N개 남았다냥!"` 말풍선 표시
- **드래그 이동**: 라온을 마우스로 드래그하여 화면 어디든 배치 가능
- **TODO 리스트**: 라온을 클릭하면 패널이 열리며 Notion DB에서 할 일 목록을 불러옴
- **상태 변경**: 클릭으로 `Not started → In progress → Done` 순환
- **필터**: 전체 / 진행 중 / 완료 탭
- **Notion 페이지 열기**: 각 할 일 클릭 시 Notion 페이지로 바로 이동
- **클릭 투과**: 투명 영역은 클릭이 뒤로 통과 (작업 방해 없음)
- **자동 DB 생성**: Notion 연결 시 `Laon Focus TODO` 데이터베이스를 자동으로 생성하고 샘플 데이터 추가

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Electron |
| 프론트엔드 | React 18 |
| 번들러 | Webpack 5 |
| 백엔드 API | Notion API (`@notionhq/client`) |
| 인증 | Notion OAuth (Public Integration) |
| 빌드/배포 | electron-builder, GitHub Actions |

## 프로젝트 구조

```
src/
├── electron.js          # Electron 메인 프로세스 (윈도우 생성, IPC 핸들러)
├── preload.js           # contextBridge로 렌더러에 API 노출
├── index.jsx            # React 엔트리포인트
├── auth/
│   ├── notionOAuth.js   # Notion OAuth 플로우 (로컬 서버 → 인증 → 토큰 교환)
│   └── store.js         # electron-store 기반 자격증명 저장
├── components/
│   ├── App.jsx          # 메인 앱 (인증 상태 관리, TODO CRUD)
│   ├── LaonMascot.jsx   # 마스코트 컴포넌트 (클릭, 드래그, 말풍선)
│   ├── TodoList.jsx     # TODO 리스트 패널
│   ├── TodoItem.jsx     # 개별 TODO 항목
│   └── SetupScreen.jsx  # 초기 Notion 연결 화면
├── utils/
│   └── filter.js        # TODO 필터링 및 정렬 로직
└── styles/              # CSS 파일들
```

## 사용자 설치 방법

[Releases](https://github.com/JoyDaheeCha/laon-focus-app/releases) 페이지에서 최신 버전을 다운로드합니다.

- **Mac**: `.dmg` 파일 다운로드 → 열기 → Applications 폴더로 드래그
- **Windows**: `.exe` 파일 다운로드 → 실행

앱을 처음 실행하면 **"Notion 연결하기"** 버튼이 나타납니다. 클릭하면 브라우저에서 Notion 로그인 후 권한을 허용하면 자동으로 데이터베이스가 생성되고 설정이 완료됩니다.

## 개발 환경 설정

### 1. Notion Public Integration 생성

1. https://www.notion.so/my-integrations 접속
2. **"+ New integration"** 클릭 → 타입을 **Public**으로 선택
3. Redirect URI에 `http://localhost:19847/notion/callback` 입력
4. 생성 후 **OAuth client ID**와 **OAuth client secret** 복사

### 2. 프로젝트 설정

```bash
git clone https://github.com/JoyDaheeCha/laon-focus-app.git
cd laon-focus-app
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

## 빌드 및 배포

GitHub Actions를 통해 태그 푸시 시 자동 빌드 및 릴리스됩니다.

```bash
git tag v1.0.0
git push origin v1.0.0
```

- macOS (`dmg`)와 Windows (`exe`) 빌드가 자동 생성됩니다
- 빌드 결과물은 GitHub Releases에 자동 업로드됩니다

## Notion 연동 구조

앱은 **Notion OAuth**를 사용하여 사용자 인증을 처리합니다. 사용자는 토큰이나 Database ID를 직접 입력할 필요 없이, 앱 내에서 자동으로 연결됩니다.

1. 앱 첫 실행 → "Notion 연결하기" 클릭
2. 브라우저에서 Notion 로그인 및 권한 허용 (공유할 페이지 선택)
3. 앱으로 자동 복귀 → `Laon Focus TODO` 데이터베이스 자동 생성
4. 설정 완료 — 토큰과 DB 설정은 로컬에 암호화 저장됨

자동 생성되는 데이터베이스 속성:

| 속성명 | 타입 | 값 |
|--------|------|----|
| Name | Title | 할 일 제목 |
| Status | Status | `Not started`, `In progress`, `Done` |
| Priority | Select | `High`, `Medium`, `Low` |
| Due Date | Date | 마감일 |
| Tags | Multi-select | `work`, `study`, `health`, `daily` |
