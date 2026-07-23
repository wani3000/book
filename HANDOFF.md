# 다니엘의 노트 인계 문서

최종 갱신: 2026-07-23 KST

## 가장 먼저 확인할 것

- 저장소: `https://github.com/wani3000/book`
- 운영 도메인: `https://danielsnote.com`
- 새 배포 대상: Vercel `oxaz1234-gmailcoms-projects/danielsnote`
- 현재 작업 브랜치: `agent/publish-final-ebooks`
- 정확한 커밋은 `git rev-parse HEAD`, 변경 상태는 `git status --short --branch`로 확인한다.
- Vercel 이전 세부 절차: [`VERCEL_MIGRATION.md`](VERCEL_MIGRATION.md)
- 운영 절차: [`OPERATIONS_RUNBOOK.md`](OPERATIONS_RUNBOOK.md)

## 이번 작업의 결정

기존 ChatGPT Sites 환경은 금융 거래 기능을 운영하기에 적합하지 않아 Vercel로 이전한다. 앱은 표준 Next.js, 데이터는 Turso/libSQL, PDF는 Private Vercel Blob을 사용한다. `danielsnote.com` 전환은 Preview에서 회원·주문·PDF 기능이 검증된 뒤에만 한다.

## 구현 완료 상태

- 전자책 마켓 홈과 상품 상세 3종
- Google·카카오 로그인, 가입 동의, 계정 연결·해제, 로그아웃·탈퇴
- `/mypage`, `/mypage/library`, `/mypage/orders`, `/mypage/profile`의 독립 URL 이동
- 구매 내역, PDF 권한, 최초 열람 시각, 환불 신청·상태
- 관리자 회원·후기·결제·환불·운영 화면과 재인증·감사 로그
- 카카오페이·Npay 준비·승인·취소·실패·대사·전액 환불 코드
- 거래·회원·마케팅 이메일과 실패 큐
- 동의 기반 GA4, sitemap, robots, canonical, 구조화 데이터
- 사업자·약관·개인정보·환불 정책과 고객지원 정보
- 임의·예시 후기는 모두 제거했으며 승인된 실구매 후기만 공개
- 데스크톱 상세페이지 sticky 구매 카드 잘림 수정
- Vercel용 보안 헤더와 Next.js 빌드 전환

## 전자책 기준

| 상품 | 상세 경로 | PDF 쪽수 | 비공개 Blob 경로 |
| --- | --- | ---: | --- |
| 아이디어를 서비스로 바꾸는 Codex 사용법 | `/codex` | 230 | `ebooks/codex-7461d974.pdf` |
| 커리어도 디자인할 수 있습니다 | `/career` | 90 | `ebooks/career-4e8b1d67.pdf` |
| 승무원 다음은 IT였습니다 | `/jane` | 78 | `ebooks/jane-fc5efcfd.pdf` |

2026-07-23 확인 결과 Blob에는 세 파일이 최신 파일 크기와 동일하게 업로드됐다. 제인 상세페이지 분량도 실제 최신 PDF에 맞춰 `78쪽`으로 수정했다. PDF는 `public/`에 두지 않는다.

## Vercel 이전 현황

완료:

- Vercel 프로젝트 `danielsnote` 생성 및 `.vercel/project.json` 연결
- Private Blob `danielsnote-books` 생성, 리전 `hnd1`, PDF 3권 업로드
- `db/index.ts`를 `drizzle-orm/libsql`로 이전
- PDF API를 `@vercel/blob` private `get()` 방식으로 이전
- `npm run db:migrate`, `npm run db:import` 작성
- 표준 `next build` 성공

대기:

- Vercel Marketplace 약관 동의
- Turso Starter 리소스 생성·연결
- migration `0000`~`0009` 적용 및 D1 백업 가져오기
- 기존 Sites의 Google·카카오·Resend·GA4 비밀 환경변수 이전
- Vercel Preview 전체 QA
- `main` 병합, 운영 배포, `danielsnote.com` DNS 전환

Marketplace 약관은 법적 동의이므로 계정 소유자가 직접 수락해야 한다. 그 전에는 DB 리소스를 자동 생성할 수 없다.

## 운영 데이터

- 최종 D1 JSON 백업: Git 제외 경로 `tmp/d1-backup/production-20260723.json`
- 복원 검증 SQLite: `tmp/d1-backup/production-restore-test.sqlite`
- 검증 당시 회원 1, 로그인 수단 1, 주문·환불·후기 0
- 가져오기 전 대상 Turso DB가 비어 있어야 하며 `ALLOW_DB_IMPORT=true`를 명시해야 한다.

## 사업자와 공개 정보

- 상호: 플로렌스랩
- 사업자등록번호: 217-26-12405
- 통신판매업신고번호: 제2026-서울구로-1222호
- 공개 주소: 서울특별시 구로구 고척로 49
- 고객센터: 070-4715-6450
- 이메일: florencelab@naver.com

상세 동·호수와 개인 거주 정보는 코드, 문서, 화면, 로그 어디에도 공개하면 안 된다.

## 외부 대기 작업

- 카카오페이·Npay 가맹 신청은 사용자가 마무리한다.
- 승인 전 두 결제 활성화 플래그는 `false`다.
- 승인 후 개발 키로 성공·취소·실패·시간초과·중복 콜백·환불 E2E를 통과한 수단만 운영으로 연다.
- Google Search Console과 네이버 서치어드바이저 사이트맵은 제출된 상태지만 도메인 이전 후 재수집 상태를 확인한다.
- 관리자 Google 2단계 인증은 확인됨. 카카오 계정 2단계 인증은 계정 화면에서 최종 확인한다.

## 검증 명령

```bash
npm run lint
npm test
NEXT_PUBLIC_BUSINESS_PHONE=070-4715-6450 npm run check:merchant
node scripts/check-merchant-readiness.mjs
```

배포 후에는 `/api/health`, 홈·상세 3종, 로그인 2종, 마이페이지 하위 URL, 테스트 구매자 PDF 3권, 비로그인 401, 미구매 403, 직접 PDF URL 404를 확인한다.

## 절대 금지

- 비밀키·인증번호·계좌·신분증 정보를 Git이나 문서에 저장하지 않는다.
- 임의 구매 후기나 후기처럼 보이는 예시를 추가하지 않는다.
- 판매 PDF를 공개 정적 경로에 두지 않는다.
- Vercel 검증 전에 `danielsnote.com` DNS를 바꾸지 않는다.
- 가맹 승인 전에 결제 활성화 플래그를 켜지 않는다.
