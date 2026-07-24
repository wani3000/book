# 다니엘의 노트 인계 문서

최종 갱신: 2026-07-24 KST

## 가장 먼저 확인할 것

- 저장소: `https://github.com/wani3000/book`
- 운영 도메인: `https://danielsnote.com`
- 새 배포 대상: Vercel `oxaz1234-gmailcoms-projects/danielsnote`
- 현재 작업 브랜치: `main`
- 정확한 커밋은 `git rev-parse HEAD`, 변경 상태는 `git status --short --branch`로 확인한다.
- Vercel 이전 세부 절차: [`VERCEL_MIGRATION.md`](VERCEL_MIGRATION.md)
- 운영 절차: [`OPERATIONS_RUNBOOK.md`](OPERATIONS_RUNBOOK.md)

## 이번 작업의 결정

기존 ChatGPT Sites에서 Vercel로 운영 이전을 완료했다. 앱은 표준 Next.js, 데이터는 Turso/libSQL, PDF는 Private Vercel Blob을 사용한다. `danielsnote.com`과 `www`는 모두 Vercel을 가리킨다.

## 구현 완료 상태

- 전자책 마켓 홈과 상품 상세 4종
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
| 의식의 국경 | `/consciousness` | 299 | `ebooks/consciousness-31aa02d7.pdf` |

2026-07-23 확인 결과 기존 세 파일은 Blob에 최신 파일 크기와 동일하게 업로드됐다. `의식의 국경`도 2026-07-24 비공개 Blob의 `ebooks/consciousness-31aa02d7.pdf`에 업로드하고, 다시 내려받아 원본과 크기 8,707,697바이트 및 SHA-256 `31aa02d78511cf54818123607ea3c1b4eccce87a2024cceaecc3a2999c2a357f`가 일치하는지 확인했다. PDF는 `public/`에 두지 않는다.

## 2026-07-24 SF소설 상품 추가

- 홈에 `SF소설` 카테고리와 네 번째 상품 카드 추가
- `/consciousness`에 기존 교육 상품과 분리된 레트로 미래주의 SF 상세페이지 추가
- 제목 `의식의 국경`, 저자 `제임스 한`, A5 299쪽, PDF, 판매가 19,000원 반영
- 코발트블루·딥네이비·올리브그린·노란색과 최종 표지를 사용
- 상품 카탈로그, 카카오페이·Npay·Paddle 보조 경로, 후기, 관리자, GA4, sitemap, 마이페이지와 테스트 구매자 권한에 `consciousness` 연결
- PDF 사용자 표시 파일명은 `의식의 국경.pdf`
- 데스크톱·모바일 화면, 스크롤 고정 구매 카드, 홈 4열, 기존 상품 3종을 로컬 검수
- `next build`, ESLint, 48개 구조·기능 테스트 통과
- 상세 검수 기록: [`audit/sf-novel-launch-2026-07-24/REPORT.md`](audit/sf-novel-launch-2026-07-24/REPORT.md)
- 결제사 운영 E2E는 카카오페이·Npay 승인 전까지 진행하지 않는다.

## Vercel 이전 현황

완료:

- Vercel 프로젝트 `danielsnote` 생성 및 `.vercel/project.json` 연결
- GitHub `wani3000/book` 연결 및 `main` 자동 배포 설정
- Private Blob `danielsnote-books` 생성, 리전 `hnd1`, PDF 3권 업로드
- Turso Starter($0) `danielsnote-db` 생성, 리전 `hnd1`, Production·Preview·Development 연결
- migration `0000`~`0009` 적용 및 D1 최종 백업 가져오기
- Vercel Authentication 해제 및 공개 운영 배포 확인
- `db/index.ts`를 `drizzle-orm/libsql`로 이전
- PDF API를 `@vercel/blob` private `get()` 방식으로 이전
- `npm run db:migrate`, `npm run db:import` 작성
- 표준 `next build` 성공
- Vercel Framework Preset을 `Next.js`로 수정
- `/api/health` HTTP 200, `database=ok`, `schema=0009` 확인
- Namecheap의 루트·`www` A 레코드를 `76.76.21.21`로 전환하고 SSL 확인
- Google 운영 전용 OAuth 클라이언트와 운영 콜백 등록
- 카카오 로그인 콜백·클라이언트 시크릿·탈퇴 연결 해제용 어드민 키 등록
- Resend `danielsnote.com` 도메인 인증과 도메인 제한 발송 키 등록
- GA4 측정 ID, 고객센터, 관리자·테스트 구매자 권한 환경변수 등록
- 운영 도메인에서 `/api/auth/config` Google·카카오 모두 활성, 이메일 `configured` 확인
- 테스트 구매자 Google 실제 로그인 성공
- 운영 배포본에서 테스트 구매자 주문 내역 3건·내 서재 PDF 3권 권한 확인(새 SF소설은 로컬 카탈로그에 추가됐지만 아직 미배포)
- Resend 운영 키로 `noreply@danielsnote.com` 실제 테스트 메일 발송 성공
- Google Search Console 사이트맵 `성공`, 발견된 페이지 9개 확인
- GA4 `다니엘의 노트` 속성과 `G-L5MG51YXBJ` 태그 로드 확인
- 운영 카카오 계정 2단계 인증과 대한민국 외 로그인 제한 활성 확인
- 공개 GitHub `main` 이력은 개인정보가 없는 새 기준점부터 다시 시작하도록 재작성하고 과거 공개 작업 브랜치를 삭제

대기:

- GA4 실시간 보고서의 첫 데이터 반영 확인(태그는 정상 로드되며 현재 0명)
- Vercel 무료 플랜의 일일 배포 100회 제한이 해제된 뒤 문서 전용 최신 커밋을 다시 배포한다. 현재 운영 배포와 앱 소스는 정상이며 이번 변경에는 화면·기능 코드가 없다.

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

대표자 실명, 상세 동·호수와 개인 거주 정보는 코드, 공개 문서, 화면, 로그 어디에도 공개하면 안 된다. 가맹 심사에 필요한 대표자 정보는 각 결제사 보안 신청 화면과 제출 서류에서만 다룬다.

## 외부 대기 작업

- 카카오페이·Npay 가맹 신청은 사용자가 마무리한다.
- 승인 전 두 결제 활성화 플래그는 `false`다.
- 승인 후 개발 키로 성공·취소·실패·시간초과·중복 콜백·환불 E2E를 통과한 수단만 운영으로 연다.
- Google Search Console 사이트맵은 도메인 이전 후에도 `성공`이며 9개 페이지가 발견됐다. 네이버 서치어드바이저 사이트맵도 제출 완료 상태다.
- 관리자 Google·카카오 계정의 2단계 인증은 모두 확인됐다. 카카오 계정은 대한민국 외 로그인 제한도 활성화돼 있다.
- GitHub `main`과 공개 작업 브랜치는 정리됐지만 병합된 PR 1~4의 내부 `refs/pull/*`는 과거 커밋을 가리킨다. 완전 제거는 GitHub Support의 민감정보 캐시·참조 정리 요청 또는 저장소 삭제·재생성이 필요하다.

## 검증 명령

```bash
npm run lint
npm test
NEXT_PUBLIC_BUSINESS_PHONE=070-4715-6450 npm run check:merchant
node scripts/check-merchant-readiness.mjs
```

배포 후에는 `/api/health`, 홈·상세 4종, 로그인 2종, 마이페이지 하위 URL, 테스트 구매자 PDF 4권, 비로그인 401, 미구매 403, 직접 PDF URL 404를 확인한다.

## 절대 금지

- 비밀키·인증번호·계좌·신분증 정보를 Git이나 문서에 저장하지 않는다.
- 임의 구매 후기나 후기처럼 보이는 예시를 추가하지 않는다.
- 판매 PDF를 공개 정적 경로에 두지 않는다.
- 대표자 실명이나 상세 동·호수를 공개 코드·문서·화면에 기록하지 않는다.
- 가맹 승인 전에 결제 활성화 플래그를 켜지 않는다.
