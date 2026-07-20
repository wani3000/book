# PHILIP BOOKS 작업 인계서

최종 갱신: 2026-07-20 (KST)

이 문서는 다른 Codex 에이전트가 현재 상태를 다시 조사하지 않고 곧바로 작업을 이어갈 수 있도록 작성한 단일 인계 문서다.

## 1. 프로젝트 목표

실제 경험을 기반으로 만든 전자책 3권을 제작하고, 클래스101과 유사한 탐색·상세·구매 흐름을 가진 판매 사이트 `PHILIP BOOKS`에서 판매한다.

현재 상품은 다음과 같다.

| 상품 키 | 제목 | 저자 표기 | PDF | 판매가 | 상세페이지 |
| --- | --- | --- | ---: | ---: | --- |
| `codex` | 아이디어를 서비스로 바꾸는 Codex 사용법 | 필립 | 258쪽 | 19,000원 | `/codex` |
| `career` | 커리어도 디자인할 수 있습니다 | 필립 | 64쪽 | 19,000원 | `/career` |
| `jane` | 승무원 다음은 IT였습니다 | 제인 | 56쪽 | 19,000원 | `/jane` |

박철완은 공개 콘텐츠에서 가명 `필립`으로 표기한다. 3권 저자는 공개 콘텐츠에서 닉네임 `제인`으로만 표기한다.

## 2. 현재 완료 상태

- 전자책 3권 PDF 생성 완료
- 2권과 3권 본문 글꼴을 나눔명조로 변경 완료
- 세 권을 연결하는 클래스101형 전자책 마켓 메인 구현 완료
- 세 권 각각에 클래스101 상품 상세형 판매페이지 구현 완료
- 데스크톱 우측 구매 카드와 모바일 하단 고정 구매 버튼 구현 완료
- 상품별 소개, 추천 독자, 핵심 효과, 포함 자료, 접이식 목차, 저자, 후기, FAQ 구현 완료
- SEO 메타데이터, 사이트맵, robots.txt, Open Graph 이미지 구현 완료
- 후기 접수 API와 D1 스키마 구현 완료
- Google 로그인 시 D1 회원 자동 등록 및 7일 보안 세션 구현 완료
- 마이페이지(`/mypage`)의 프로필 수정, 구매 내역, 후기 수, 로그아웃, 회원 탈퇴 구현 완료
- 관리자 회원관리(`/admin/members`)의 회원 검색, 이용 정지, 관리자 권한 관리 구현 완료
- 구매와 후기 작성 전에 로그인 계정을 확인하도록 연결 완료
- `oxaz1234@gmail.com`을 테스트 구매자로 지정해 3권 모두 구매 완료 상태와 PDF 읽기 권한 제공
- 실제 유료 주문도 구매한 상품의 PDF를 마이페이지에서 다시 열 수 있는 서버 권한 경로 구현
- Google Cloud `PHILIP BOOKS` 프로젝트와 프로덕션 OAuth 웹 클라이언트 생성 및 공개 사이트 연결 완료
- 실제 Chrome에서 Google 로그인, 관리자 회원목록, 테스트 구매내역 3권, PDF 3권 열람 검증 완료
- Paddle 구매권한 토큰, 서명 웹훅 주문 적재, 전액 환불·차지백 권한 회수 코드 구현 완료
- 최신 빌드와 자동검사 통과
- 최신 사이트 버전 9 공개 배포 완료

공개 사이트:

- 메인: <https://codex-solo-builder-book.wani3000.chatgpt.site>
- 1권: <https://codex-solo-builder-book.wani3000.chatgpt.site/codex>
- 2권: <https://codex-solo-builder-book.wani3000.chatgpt.site/career>
- 3권: <https://codex-solo-builder-book.wani3000.chatgpt.site/jane>

최신 배포 기준 커밋은 `fc940bc7ff3f894e18a6bf84a2115844b4d7b8fe`이며 메시지는 `feat: redesign ebook detail pages`다.

## 3. 반드시 먼저 알아야 할 미완료 사항

### P0 — 실제 결제가 아직 열리지 않음

Google 로그인 환경변수는 연결됐다. Paddle 토큰·가격 ID는 아직 설정되지 않았다. 따라서 공개 사이트의 구매 버튼은 `결제 오픈 준비 중`으로 비활성화된다.

결제 오픈 방법은 둘 중 하나를 선택한다.

1. Paddle Checkout 사용
   - `NEXT_PUBLIC_PADDLE_ENV=production`
   - `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
   - `NEXT_PUBLIC_CODEX_PRICE_ID`
   - `NEXT_PUBLIC_CAREER_PRICE_ID`
   - `NEXT_PUBLIC_JANE_PRICE_ID`
2. 외부 판매 페이지 사용
   - `NEXT_PUBLIC_CODEX_PURCHASE_URL`
   - `NEXT_PUBLIC_CAREER_PURCHASE_URL`
   - `NEXT_PUBLIC_JANE_PURCHASE_URL`

환경변수의 실제 값은 저장소나 인계 문서에 쓰지 말고 Sites 런타임 설정에만 저장한다. 결제 설정 뒤에는 새 빌드·버전 저장·공개 배포가 필요하다.

### P1 — Paddle 외부 계정 설정이 필요함

로그인 회원의 구매 여부를 서버에서 확인한 뒤 PDF를 열어주는 `/api/library/[product]` 경로와 마이페이지 재열람 버튼이 구현됐다. `/api/paddle/webhook`은 Paddle 서명을 확인해 결제 완료 주문을 `orders`에 저장하고 전액 환불·차지백 시 권한을 회수한다.

현재 Paddle 라이브와 샌드박스 대시보드 모두 로그인 화면이므로 상품·가격·클라이언트 토큰·API 키·웹훅 목적지를 아직 만들지 못했다. Paddle 계정 로그인 후 다음 환경변수를 Sites에 연결해야 실제 결제가 열린다.

- `NEXT_PUBLIC_PADDLE_ENV`
- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
- `NEXT_PUBLIC_CODEX_PRICE_ID`
- `NEXT_PUBLIC_CAREER_PRICE_ID`
- `NEXT_PUBLIC_JANE_PRICE_ID`
- `PADDLE_API_KEY`
- `PADDLE_NOTIFICATION_WEBHOOK_SECRET`

`TEST_PURCHASER_EMAILS`에 등록된 계정은 데이터베이스 주문 없이 세 권 모두 구매 완료로 간주한다. 기본 테스트 계정은 `oxaz1234@gmail.com`이다.

### P1 — 후기 운영자 승인 화면이 없음

`POST /api/reviews`는 후기를 `pending`, `purchase_verified=0`으로 저장한다. 공개 API는 `approved`이면서 `purchase_verified=1`인 후기만 반환한다. 현재 이를 승인하는 관리자 UI는 없으므로 D1을 직접 관리하거나 관리자 기능을 추가해야 한다.

후기 컴포넌트에는 각 책별 샘플 독자 반응이 포함되어 있으며, 화면에서 실제 구매 후기가 아니라는 안내와 배지가 붙는다. 판매 오픈 전에는 샘플을 제거하거나 실제 검증 후기만 표시하는 편이 바람직하다. 샘플을 실제 후기처럼 위장해서는 안 된다.

### P2 — 상세페이지 시각 QA 추가 필요

메인 페이지는 데스크톱·모바일 스크린샷 비교와 상호작용 검증을 완료했다. 최신 세 상세페이지는 빌드와 구조 테스트는 통과했지만 별도의 브라우저 스크린샷 기반 시각 QA 기록은 아직 없다. 결제 오픈 전에 1440px와 390px에서 다음을 확인한다.

- 표지 이미지 비율과 선명도
- 우측 고정 구매 카드
- 탭 메뉴의 sticky 동작
- 모바일 하단 구매 바
- 목차와 FAQ 열기·닫기
- 긴 한국어 제목 줄바꿈
- 결제 버튼 활성·실제 체크아웃 진입

## 4. 디렉터리와 핵심 파일

워크스페이스 루트:

`/Users/chulwan/Documents/Codex/2026-07-18/pc`

웹사이트 Git 저장소:

`/Users/chulwan/Documents/Codex/2026-07-18/pc/website`

워크스페이스 루트 자체는 Git 저장소가 아니며 `website/`만 별도 Git 저장소다.

### 전자책 원문과 산출물

- 1권 원문: `codex-practical-manuscript.md`
- 1권 워크북: `codex-practical-workbook.md`
- 2권 원문: `career-book/manuscript.md`
- 3권 원문: `jane-book/manuscript.md`
- 전체 Mac 자료 보강 기록: `research/full-mac-augmentation-2026-07-19.md`
- PDF 생성 스크립트: `scripts/build_*.py`
- 최종 PDF: `output/pdf/`

최종 판매용 PDF:

- `output/pdf/codex-solo-service-playbook.pdf`
- `output/pdf/career-design-philip.pdf`
- `output/pdf/flight-attendant-to-it-jane.pdf`

### 웹사이트

- 메인 마켓: `website/app/page.tsx`
- 공통 상세페이지 UI: `website/app/components/ClassDetailPage.tsx`
- 상품별 데이터: `website/app/codex/page.tsx`, `website/app/career/page.tsx`, `website/app/jane/page.tsx`
- 전역 스타일: `website/app/globals.css`
- 구매 처리: `website/app/components/PurchaseButton.tsx`
- 후기 UI: `website/app/components/ReviewSection.tsx`
- 후기 API: `website/app/api/reviews/route.ts`
- 후기 DB 스키마: `website/db/schema.ts`
- 회원·세션 공통 로직: `website/app/auth/member.ts`, `website/app/auth/session.ts`
- 전자책 권한 카탈로그: `website/app/library/catalog.ts`
- 로그인·구매 검증 PDF 응답: `website/app/api/library/[product]/route.ts`
- 배포용 PDF: `website/public/library-assets/`
- 결제 구매권한: `website/app/api/checkout/context/route.ts`, `website/app/paddle/entitlement.ts`
- Paddle 웹훅: `website/app/api/paddle/webhook/route.ts`, `website/app/paddle/server.ts`
- 결제 완료 페이지: `website/app/checkout/success/page.tsx`
- 마이페이지: `website/app/mypage/page.tsx`, `website/app/components/AccountDashboard.tsx`
- 회원 API: `website/app/api/account/profile/route.ts`, `website/app/api/account/orders/route.ts`
- 관리자 회원관리: `website/app/admin/members/page.tsx`, `website/app/api/admin/members/route.ts`
- SEO 공통 메타데이터: `website/app/layout.tsx`
- 테스트: `website/tests/rendered-html.test.mjs`
- 호스팅 설정: `website/.openai/hosting.json`
- 환경변수 예시: `website/.env.example`
- 메인 화면 QA: `website/design-qa.md`

상세페이지는 하나의 공통 컴포넌트를 사용한다. 구조를 바꾸려면 `ClassDetailPage.tsx`와 상세페이지용 CSS를 수정하고, 책별 문구만 바꿀 때는 각 상품의 `page.tsx` 안 `book` 객체를 수정한다.

## 5. 개발과 검증

필수 환경은 Node.js 22.13 이상이다.

```bash
cd /Users/chulwan/Documents/Codex/2026-07-18/pc/website
npm install
npm run dev
```

검증:

```bash
npm run build
node --test tests/rendered-html.test.mjs
git status --short
```

2026-07-20 인계 시점 상태:

- 빌드 성공
- 자동검사 12개 통과
- ESLint 오류 0개(메인 페이지의 기존 `<img>` 성능 경고 2개)
- `dist/server/index.js` 존재

## 6. 배포 상태와 절차

Sites 프로젝트 ID는 `website/.openai/hosting.json`에 저장돼 있다. 현재 사이트 접근 모드는 `public`이다.

사이트 변경 후 표준 순서:

1. `npm run build`
2. 테스트 실행
3. 의도한 파일만 커밋
4. Sites 소스 저장소로 push
5. 배포 아카이브 생성
6. 새 사이트 버전 저장
7. 공개 사이트이므로 사용자에게 공개 배포 승인을 받은 뒤 배포
8. 배포 상태가 `succeeded`인지 확인

기존 프로젝트에 새 사이트를 만들지 말고 `.openai/hosting.json`의 `project_id`를 재사용한다. 배포 토큰과 쓰기 자격 증명은 파일, Git remote 또는 문서에 저장하지 않는다.

## 7. 디자인 기준

- 클래스101의 정보 구조와 구매 동선을 참고한다.
- 클래스101 로고·문구·고유 브랜드 자산을 복제하지 않는다.
- 메인은 흰색 기반의 조밀한 마켓 UI다.
- 상세페이지 공통 구조는 이미지 갤러리, 상품 요약, 가격 카드, 탭, 소개, 추천 독자, 학습 효과, 포함 자료, 목차, 저자, 후기, FAQ 순서다.
- 1권은 표지의 네이비·라임, 2권은 블루·화이트, 3권은 아이보리·버건디·블루그레이를 사용한다.
- 모든 화면은 모바일을 함께 검증한다.
- 표지 이미지는 `website/public/`의 실제 최종 표지를 재사용한다.
- 상세페이지의 목차, FAQ, 후기 작성 폼은 접지 않고 처음부터 전체 내용을 노출한다.
- 2026-07-20 상세페이지 감사 스크린샷은 `/Users/chulwan/Documents/Codex/2026-07-18/pc/audit/detail-pages-2026-07-20/`에 있다.

참고 이미지:

- `reference/class101-ref-1.png`
- `reference/class101-ref-2.png`
- `reference/class101-ref-3.png`

## 8. 콘텐츠 원칙

- 박철완 실명은 공개 원문과 판매페이지에서 `필립`으로 바꾼다.
- 확인하지 못한 경력, 수치, 회사 기여를 새로 만들어 쓰지 않는다.
- 제인의 위시켓 시스템 화면은 본인이 만든 시스템이 아니다. 기존 시스템을 활용한 운영 경험과 Codex로 직접 만든 HTML 대시보드를 명확히 구분한다.
- 취업, 합격, 수익을 보장하는 표현을 사용하지 않는다.
- 실제 구매자가 아닌 후기나 추천사를 실제 후기처럼 표시하지 않는다.
- 2권과 3권 PDF 본문은 나눔명조를 유지한다. 표지와 큰 제목은 기존 고딕체를 유지한다.

## 9. 다음 에이전트 권장 작업 순서

1. 사용자가 Paddle 라이브 또는 샌드박스 대시보드에 로그인한다.
2. 전자책 3개를 `ebooks`, 1회 결제, KRW 19,000원으로 생성하고 가격 ID를 확보한다.
3. 클라이언트 토큰·API 키와 `https://codex-solo-builder-book.wani3000.chatgpt.site/api/paddle/webhook` 알림 목적지를 만든다.
4. Paddle 환경변수를 Sites에 연결하고 새 버전을 배포한다.
5. 샌드박스 결제 완료·결제 실패·전액 환불을 실행해 주문 적재와 권한 회수를 검증한다.
6. 라이브 판매 전 사이트 도메인 승인과 기본 결제 링크를 완료한다.
7. 마이페이지의 데스크톱·모바일 시각 QA를 수행한다. 상세페이지 3종은 2026-07-20에 1차 시각 QA와 전체 노출 수정을 완료했다.
8. 샘플 후기 처리 방식을 확정하고 실제 후기 승인 운영 방식을 만든다.
9. 프로덕션 설정 후 새 버전을 배포한다.
10. Google Search Console과 네이버 서치어드바이저 등록 및 전환 추적을 연결한다.

## 10. 현재 사이트의 알려진 제약

- 검색과 카테고리 필터는 메인 화면 안에서만 동작한다.
- Google 로그인, 회원 저장, 마이페이지와 관리자 회원관리는 실제 계정으로 검증됐다.
- 주문 적재·환불 권한 회수 웹훅 코드는 준비됐지만 Paddle 외부 계정 설정과 실결제 검증이 남아 있다.
- 환불 정책 전문과 판매자 법적 고지는 체크아웃 또는 별도 정책 페이지로 아직 분리돼 있지 않다.
- 후기 작성자는 구매 번호를 입력하지만 자동 결제 검증은 하지 않는다.
- 사이트 분석·광고 전환 태그는 아직 연결되지 않았다.

## 11. Google 로그인 구현 및 인계 상태

- 구현 파일: `app/components/GoogleAccount.tsx`, `app/auth/session.ts`, `app/api/auth/config/route.ts`, `app/api/auth/google/route.ts`, `app/api/auth/session/route.ts`, `app/api/auth/logout/route.ts`
- Google Identity Services 공식 버튼을 사용하고, Google ID 토큰을 서버에서 공개키·발급자·대상 클라이언트 기준으로 검증한다.
- 검증 후 `HttpOnly`, `Secure`, `SameSite=Lax` 쿠키에 7일 세션을 저장하며 헤더에 이름·이메일·로그아웃을 표시한다.
- 필요한 Sites 런타임 환경 변수는 `GOOGLE_CLIENT_ID`와 `GOOGLE_SESSION_SECRET`이다. `GOOGLE_SESSION_SECRET`은 충분히 긴 무작위 값으로 생성해 비밀 환경 변수로 저장한다.
- 최초 관리자로 사용할 이메일을 `ADMIN_EMAILS`에 쉼표로 구분해 설정한다. 관리자 API는 세션과 서버 환경변수를 함께 확인한다.
- 테스트 구매 계정은 `TEST_PURCHASER_EMAILS`에 쉼표로 구분해 설정한다. 현재 기본값은 `oxaz1234@gmail.com`이며 이 계정에는 세 권 전체가 표시된다.
- 사용자가 제공해야 하는 값은 `.apps.googleusercontent.com`으로 끝나는 Google OAuth 웹 클라이언트 ID뿐이다. 클라이언트 보안 비밀번호는 필요하지 않다.
- Google Cloud OAuth 클라이언트의 승인된 JavaScript 원본에 `https://codex-solo-builder-book.wani3000.chatgpt.site`를 등록해야 한다.
- 클라이언트 ID를 받은 뒤 두 환경 변수를 Sites에 설정하고 새 버전을 배포한 다음 로그인, 새로고침 후 세션 유지, 로그아웃, 모바일 헤더를 검증한다.
