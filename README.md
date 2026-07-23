# 다니엘의 노트

경험 기반 전자책 3권을 판매하는 공개 웹사이트다. 클래스101의 마켓과 상품 상세 정보 구조를 참고했으며, 공통 서비스명은 `다니엘의 노트`를 사용한다.

공개 사이트: <https://danielsnote.com>

전체 프로젝트 상태, 배포 이력, 미완료 작업과 콘텐츠 주의사항은 [`HANDOFF.md`](HANDOFF.md)를 먼저 읽는다.

## 상품 경로

- `/codex` — 아이디어를 서비스로 바꾸는 Codex 사용법
- `/career` — 커리어도 디자인할 수 있습니다
- `/jane` — 승무원 다음은 IT였습니다
- `/mypage` — 로그인, 프로필, 구매 내역과 회원 탈퇴
- `/admin/members` — 관리자용 회원 검색과 상태 관리

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
- `app/components/PurchaseButton.tsx`: 카카오페이·네이버페이 결제 시작과 비활성 상태 안내
- `app/components/ReviewSection.tsx`: 후기 목록과 접수 폼
- `app/api/reviews/route.ts`: 검증 후기 조회와 후기 접수
- `db/schema.ts`: D1 후기 테이블
- `app/auth/`: Google·카카오 로그인, 보안 세션과 회원 권한 확인
- `app/mypage/`, `app/components/AccountDashboard.tsx`: 마이페이지
- `app/admin/members/`, `app/components/MemberAdmin.tsx`: 회원 관리
- `.openai/hosting.json`: Sites 프로젝트와 D1 바인딩

## 결제 상태

국내 판매용 카카오페이·네이버페이 승인·취소·환불 연동이 구현돼 있다. 가맹 승인과 운영 인증값 연결 전에는 공개 사이트의 구매 버튼이 안전하게 비활성화된다. 보조 Paddle 코드는 남아 있지만 국내 운영 결제로 활성화하지 않는다. 실제 인증값은 Sites 런타임 환경변수에만 저장한다.

## 회원 기능 상태

Google·카카오 Authorization Code + PKCE 로그인, 서버 토큰 검증, D1 회원 등록, 보안 세션, 계정 연결·해제, 마이페이지와 관리자 회원관리가 구현돼 있다. 운영 로그인과 테스트 구매자 3권 열람을 검증했다. 국내 결제 승인 후 운영 인증값을 연결하면 결제 결과가 주문과 PDF 권한에 자동 반영된다.

## 배포 주의사항

이 프로젝트는 기존 Sites 프로젝트를 사용한다. 새 프로젝트를 만들지 말고 `.openai/hosting.json`의 `project_id`를 재사용한다. 사이트는 공개 상태이므로 새 버전 공개 배포 전에 사용자 승인을 받는다.
