# 다니엘의 노트

경험 기반 PDF 전자책 3권을 판매하는 Next.js 웹사이트다. 운영 도메인은 `https://danielsnote.com`, 배포 대상은 Vercel 프로젝트 `danielsnote`다.

최신 상태와 남은 외부 작업은 [`HANDOFF.md`](HANDOFF.md), 운영 절차는 [`OPERATIONS_RUNBOOK.md`](OPERATIONS_RUNBOOK.md), Vercel 이전 절차는 [`VERCEL_MIGRATION.md`](VERCEL_MIGRATION.md)를 먼저 확인한다.

## 상품

| 경로 | 상품 | 분량 | 가격 |
| --- | --- | ---: | ---: |
| `/codex` | 아이디어를 서비스로 바꾸는 Codex 사용법 | 230쪽 | 19,000원 |
| `/career` | 커리어도 디자인할 수 있습니다 | 90쪽 | 19,000원 |
| `/jane` | 승무원 다음은 IT였습니다 | 78쪽 | 19,000원 |

## 기술 구성

- Next.js 16, React 19, TypeScript
- Vercel 배포와 보안 응답 헤더
- Turso/libSQL 데이터베이스와 Drizzle ORM
- Private Vercel Blob PDF 저장소
- Google·카카오 OAuth, 보안 세션, 계정 연결·탈퇴
- 카카오페이·Npay 단건결제, 환불, 주문·PDF 권한 연동
- Resend 거래·회원 이메일, 동의 기반 GA4

## 로컬 실행과 검증

Node.js 22.13 이상이 필요하다.

```bash
npm install
npm run dev
npm run lint
npm test
NEXT_PUBLIC_BUSINESS_PHONE=070-4715-6450 npm run check:merchant
```

환경변수 이름은 [`.env.example`](.env.example)을 따른다. 비밀값은 `.env.local`과 Vercel 환경변수에만 저장하며 Git과 문서에 기록하지 않는다.

## 데이터와 PDF

- `db/schema.ts`: 회원, 로그인 수단, 주문, 결제, 환불, 후기, 감사 로그, 알림 큐
- `npm run db:migrate`: Turso에 `drizzle/0000`~`0009` 순차 적용
- `npm run db:import -- /absolute/backup.json`: `ALLOW_DB_IMPORT=true`일 때 빈 Turso DB로 D1 백업 가져오기
- `app/library/catalog.ts`: 비공개 Blob 경로와 판매 파일명
- `app/api/library/[product]/route.ts`: 로그인·구매 권한 확인 후 PDF 스트리밍

PDF는 `public/`에 두지 않는다. 현재 Vercel Blob에는 세 권이 `ebooks/` 아래 비공개 객체로 업로드되어 있다.

## 결제 상태

카카오페이·Npay 코드는 준비되어 있지만 가맹 승인과 운영 키가 들어오기 전까지 각 활성화 플래그를 `false`로 유지한다. Paddle은 국내 판매 운영 경로로 사용하지 않는다.
