# PHILIP BOOKS

경험 기반 전자책 3권을 판매하는 공개 웹사이트다. 클래스101의 마켓과 상품 상세 정보 구조를 참고했으며, PHILIP BOOKS의 콘텐츠와 표지를 사용한다.

공개 사이트: <https://codex-solo-builder-book.wani3000.chatgpt.site>

전체 프로젝트 상태, 배포 이력, 미완료 작업과 콘텐츠 주의사항은 [`HANDOFF.md`](HANDOFF.md)를 먼저 읽는다.

## 상품 경로

- `/codex` — 아이디어를 서비스로 바꾸는 Codex 사용법
- `/career` — 커리어도 디자인할 수 있습니다
- `/jane` — 승무원 다음은 IT였습니다

## 로컬 실행

Node.js 22.13 이상이 필요하다.

```bash
npm install
npm run dev
```

## 검증

```bash
npm run build
node --test tests/rendered-html.test.mjs
```

## 주요 파일

- `app/page.tsx`: 전자책 마켓 메인
- `app/components/ClassDetailPage.tsx`: 세 권이 공유하는 상품 상세 UI
- `app/{codex,career,jane}/page.tsx`: 상품별 콘텐츠와 메타데이터
- `app/components/PurchaseButton.tsx`: Paddle 또는 외부 판매 링크 연결
- `app/components/ReviewSection.tsx`: 후기 목록과 접수 폼
- `app/api/reviews/route.ts`: 검증 후기 조회와 후기 접수
- `db/schema.ts`: D1 후기 테이블
- `.openai/hosting.json`: Sites 프로젝트와 D1 바인딩

## 결제 상태

코드는 Paddle Checkout과 외부 판매 URL을 모두 지원하지만 프로덕션 결제 값은 아직 설정되지 않았다. 현재 공개 사이트의 구매 버튼은 비활성 상태다. 필요한 키 이름은 `.env.example`을 참고하고 실제 값은 Sites 런타임 환경변수에만 저장한다.

## 배포 주의사항

이 프로젝트는 기존 Sites 프로젝트를 사용한다. 새 프로젝트를 만들지 말고 `.openai/hosting.json`의 `project_id`를 재사용한다. 사이트는 공개 상태이므로 새 버전 공개 배포 전에 사용자 승인을 받는다.
