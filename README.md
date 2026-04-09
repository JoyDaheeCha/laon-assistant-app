# Laon Focus App

ADHD 친화적인 TODO 관리 데스크톱 앱입니다. **Notion 데이터베이스**와 연동하여 할 일을 관리하며, 화면 왼쪽 하단에 고양이 캐릭터 "라온"이 항상 떠 있으면서 남은 할 일 개수를 알려줍니다. 투명 배경 + always-on-top으로 다른 작업 중에도 항상 확인 가능합니다.

## 주요 기능

- **라온 마스코트**: 화면에 항상 떠 있는 고양이. 호버 시 `"할 일 N개 남았다냥!"` 말풍선 표시
- **TODO 리스트**: 라온을 클릭하면 패널이 열리며 Notion DB에서 할 일 목록을 불러옴
- **상태 변경**: 클릭으로 `Not started → In progress → Done` 순환
- **필터**: 전체 / 진행 중 / 완료 탭
- **Notion 페이지 열기**: 각 할 일 클릭 시 Notion 페이지로 바로 이동
- **클릭 투과**: 투명 영역은 클릭이 뒤로 통과 (작업 방해 없음)

## 설치 방법

```bash
# 1. 저장소 클론
git clone https://github.com/JoyDaheeCha/laon-assistant-app.git
cd laon-assistant-app

# 2. 의존성 설치
npm install

# 3. 환경변수 설정 (.env 파일 생성)
cp .env.example .env
# .env 파일을 열어 NOTION_TOKEN과 NOTION_DATABASE_ID를 입력

# 4. 개발 모드 실행
npm run dev

# 5. (선택) 프로덕션 빌드
npm run build
```

## Notion Integration Token 설정 방법

1. https://www.notion.so/my-integrations 접속
2. **"+ New integration"** 클릭
3. 이름 입력 (예: `Laon Focus App`), 워크스페이스 선택
4. 생성 후 **Internal Integration Secret** (= `secret_xxx...`) 복사
5. `.env` 파일의 `NOTION_TOKEN`에 붙여넣기:
   ```
   NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxxxxxx
   ```

## Database ID 설정 방법

### 방법 A: 기존 Notion 데이터베이스 사용

1. Notion에서 사용할 데이터베이스 페이지를 열기
2. URL에서 Database ID 추출:
   ```
   https://www.notion.so/{DATABASE_ID}?v=...
                          ^^^^^^^^^^^^^^^^
                          이 부분이 Database ID (32자리 hex)
   ```
3. `.env` 파일에 입력:
   ```
   NOTION_DATABASE_ID=abcdef1234567890abcdef1234567890
   ```
4. **중요**: 해당 데이터베이스에 Integration을 연결해야 합니다
   - 데이터베이스 페이지 우측 상단 `···` → `Connections` → 생성한 Integration 추가

   데이터베이스에는 다음 속성(property)이 필요합니다:

   | 속성명 | 타입 | 값 |
   |--------|------|----|
   | Name | Title | 할 일 제목 |
   | Status | Status | `Not started`, `In progress`, `Done` |
   | Priority | Select | `High`, `Medium`, `Low` |
   | Due Date | Date | 마감일 |
   | Tags | Multi-select | `work`, `study`, `health`, `daily` 등 |

### 방법 B: 스크립트로 자동 생성

1. Notion에서 빈 페이지를 하나 만들고, 해당 페이지에 Integration 연결
2. 그 페이지의 ID를 `.env`의 `NOTION_DATABASE_ID`에 임시로 입력
3. 스크립트 실행:
   ```bash
   node scripts/setup-database.js
   ```
4. 출력되는 새 Database ID로 `.env`를 업데이트:
   ```
   NOTION_DATABASE_ID=새로_생성된_database_id
   ```
   이 스크립트는 올바른 속성 구조와 샘플 데이터 5개를 자동으로 생성해줍니다.
