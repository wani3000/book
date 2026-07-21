# PHILIP BOOKS 작업 인계서

최종 갱신: 2026-07-21 (KST)

이 문서는 다른 Codex 에이전트가 현재 상태를 다시 조사하지 않고 곧바로 작업을 이어갈 수 있도록 작성한 단일 인계 문서다.

## 0. 2026-07-21 최신 작업 요약

현재 작업 저장소는 `/Users/hanwha/Documents/전자책/book`이며 GitHub `wani3000/book`의 `main` 브랜치를 사용한다. 다른 PC나 에이전트에서 이어갈 때는 먼저 `git pull --ff-only origin main`을 실행하고 이 문서와 `design-qa.md`를 읽는다.

이번 릴리스에 포함된 핵심 변경은 다음과 같다.

- 메인·상세·로그인·마이페이지가 `StorefrontHeader`와 `BusinessFooter`를 공통 사용한다.
- 데스크톱 콘텐츠 최대 너비는 전 페이지 1200px로 통일했다.
- 모바일 헤더 왼쪽에 햄버거 메뉴를 추가하고 전자책 3권을 바로 선택할 수 있게 했다.
- 메인 추천 배너는 한 번에 한 권만 보여주며 5초마다 다음 전자책으로 전환한다.
- 메인 `전체 전자책`은 흰 배경·무박스 구조이며 `전체 / 커리어 / 개발 · 생산성` 필터를 사용한다.
- 랜딩 목록에서는 가격을 노출하지 않는다. 실제 가격은 상세 구매 단계와 구매 완료 주문 내역에서만 표시한다.
- 웹 UI 글꼴은 Pretendard Regular 400과 Bold 700만 사용한다.
- Wanted Design Library 기반 색상·타이포 토큰을 `app/design-system.css`에 정의했다.
- 모바일은 푸터를 제외한 자체 본문 글자 크기를 최소 15px로 정리했다.
- Google 로그인 상태를 공통 헤더와 마이페이지가 공유하며 로그인 후 헤더에 표시 이름이 노출된다.
- 테스트 계정 `oxaz1234@gmail.com`은 표시 이름 `박철완`, 전자책 3권 구매 완료 권한을 가진다.
- 마이페이지는 좌측 계정 허브를 유지하고 우측 콘텐츠를 해시별 단일 화면으로 분리했다.
  - `/mypage#overview`: 내 서재 안내
  - `/mypage#orders`: 구매 전자책·주문 내역·PDF 읽기
  - `/mypage#profile`: 프로필 수정·회원 탈퇴
- 해시 변경은 브라우저 기록과 동기화되므로 뒤로가기와 앞으로가기가 동작한다.
- 최신 검증 결과: ESLint 통과, 프로덕션 빌드 성공, 자동 테스트 18개 통과, 마이페이지 브라우저 콘솔 오류 0건.

### 현재 중요한 운영 메모

- 공개 사이트: <https://codex-solo-builder-book.wani3000.chatgpt.site>
- Google OAuth 운영 클라이언트에는 공개 주소와 로컬 개발 주소 `http://localhost:3001`이 승인된 자바스크립트 출처로 등록돼 있어야 한다.
- 결제 버튼과 API는 최종 문구로 정리됐지만 카카오페이·네이버페이 실제 결제 활성화에는 가맹 승인과 운영 환경변수가 여전히 필요하다.
- 배포 후에는 공개 사이트에서 Google 로그인, `/mypage#overview`, `#orders`, `#profile`, PDF 읽기 권한을 실제 계정으로 다시 확인한다.
- 인계 문서에 비밀키·OAuth 토큰·결제 인증값을 기록하지 않는다.

## 1. 프로젝트 목표

실제 경험을 기반으로 만든 전자책 3권을 제작하고, 클래스101과 유사한 탐색·상세·구매 흐름을 가진 판매 사이트 `PHILIP BOOKS`에서 판매한다.

현재 상품은 다음과 같다.

| 상품 키 | 제목 | 저자 표기 | PDF | 판매가 | 상세페이지 |
| --- | --- | --- | ---: | ---: | --- |
| `codex` | 아이디어를 서비스로 바꾸는 Codex 사용법 | 필립 | 258쪽 | 19,000원 | `/codex` |
| `career` | 커리어도 디자인할 수 있습니다 | 필립 | 64쪽 | 19,000원 | `/career` |
| `jane` | 승무원 다음은 IT였습니다 | 제인 | 56쪽 | 19,000원 | `/jane` |

박철완은 공개 콘텐츠에서 가명 `필립`으로 표기한다. 3권 저자는 공개 콘텐츠에서 닉네임 `제인`으로만 표기한다.
다만 이용약관과 사업자 푸터의 `대표자 박철완`은 전자상거래 판매자 법정 고지이므로 가명으로 바꾸지 않는다.

### 인계 시점 핵심 상태

- 최종 배포 기능 커밋: `main`의 최신 Git 로그를 확인
- 인계 문서 커밋: 기능 변경과 같은 최신 커밋에 포함
- GitHub: `wani3000/book`, `main` 브랜치
- Sites 공개 버전과 배포 ID: Sites의 최신 성공 배포를 확인
- 배포 상태: 최신 배포가 `succeeded`인지 확인
- 공개 URL: <https://codex-solo-builder-book.wani3000.chatgpt.site>
- 결제 상태: 코드 준비 완료, 카카오페이·네이버페이 가맹 승인과 운영 키가 없어 실제 결제는 비활성

## 2. 현재 완료 상태

- 전자책 3권 PDF 생성 완료
- 2권과 3권 본문 글꼴을 나눔명조로 변경 완료
- 세 권을 연결하는 클래스101형 전자책 마켓 메인 구현 완료
- 세 권 각각에 클래스101 상품 상세형 판매페이지 구현 완료
- 데스크톱 우측 구매 카드와 모바일 하단 고정 구매 버튼 구현 완료
- 상품별 소개, 추천 독자, 핵심 효과, 포함 자료, 전체 노출 목차, 저자, 후기, FAQ 구현 완료
- SEO 메타데이터, 사이트맵, robots.txt, Open Graph 이미지 구현 완료
- 후기 접수 API와 D1 스키마 구현 완료
- Google 로그인 시 D1 회원 자동 등록 및 7일 보안 세션 구현 완료
- 마이페이지(`/mypage`)의 프로필 수정, 구매 내역, 후기 수, 로그아웃, 회원 탈퇴 구현 완료
- 관리자 회원관리(`/admin/members`)의 회원 검색, 이용 정지, 관리자 권한 관리 구현 완료
- 관리자 후기관리(`/admin/reviews`)의 구매 번호 확인, 승인 공개, 비공개 처리 구현 완료
- 구매와 후기 작성 전에 로그인 계정을 확인하도록 연결 완료
- `oxaz1234@gmail.com`을 테스트 구매자로 지정해 3권 모두 구매 완료 상태와 PDF 읽기 권한 제공
- 실제 유료 주문도 구매한 상품의 PDF를 마이페이지에서 다시 열 수 있는 서버 권한 경로 구현
- Google Cloud `PHILIP BOOKS` 프로젝트와 프로덕션 OAuth 웹 클라이언트 생성 및 공개 사이트 연결 완료
- 실제 Chrome에서 Google 로그인, 관리자 회원목록, 테스트 구매내역 3권, PDF 3권 열람 검증 완료
- Paddle 구매권한 토큰, 서명 웹훅 주문 적재, 전액 환불·차지백 권한 회수 코드 구현 완료
- 국내 결제는 카카오페이와 네이버페이 결제형을 각각 직접 계약·연동하는 것으로 결정
- 카카오페이 결제 준비·승인·취소·실패 API와 결제 시도 DB 스키마 구현 완료
- 결제 승인 금액 검증, 주문 저장, 마이페이지 PDF 권한 연결 완료
- 사업자·통신판매업 정보 공통 푸터와 이용약관·개인정보처리방침·교환환불정책 구현 완료
- 디지털 콘텐츠 즉시 제공 및 청약철회 제한 확인 절차 구현 완료
- 네이버페이 결제형 SDK 호출·승인·실패 처리와 카카오/네이버 결제수단 선택 UI 구현 완료
- 카카오페이·네이버페이 관리자 전액 환불 API와 환불 즉시 PDF 권한 회수 구현 완료
- 최신 빌드와 자동검사 통과
- 허위로 보일 수 있는 가상 후기와 고정 별점·후기 수 제거, 실제 구매 인증 후기만 공개하도록 정리 완료
- 상세 검색을 메인 검색 결과와 연결하고, 메인 카테고리 필터의 `개발 · 생산성` 매핑 수정 완료
- 3권 공개 PDF 본문·메타데이터의 실명 `서나라`를 가명 `제인`으로 전환 완료
- 2026-07-20 데스크톱·모바일 랜딩, 상세 3종, PDF 대표 페이지 최종 시각 QA 완료
- 최종 출시 QA 변경을 Sites 버전 29로 공개 배포 완료
- 공개 랜딩·상세·마이페이지·관리자 후기관리·정책 페이지와 robots.txt·sitemap.xml HTTP 200 확인
- 공개 사이트 canonical과 Open Graph URL이 실제 Sites 주소를 가리키는 것 확인
- 배포용 중복·미사용 PDF 3개 제거 완료. 필요하면 Git 기록에서 복구 가능

공개 사이트:

- 메인: <https://codex-solo-builder-book.wani3000.chatgpt.site>
- 1권: <https://codex-solo-builder-book.wani3000.chatgpt.site/codex>
- 2권: <https://codex-solo-builder-book.wani3000.chatgpt.site/career>
- 3권: <https://codex-solo-builder-book.wani3000.chatgpt.site/jane>

최종 출시 기준 커밋은 `main`의 최신 커밋이다. 이후 작업은 반드시 `git pull --ff-only origin main`으로 최신 커밋을 받은 뒤 시작한다.

## 3. 반드시 먼저 알아야 할 미완료 사항

### P0 — 카카오페이 가맹 신청 제출과 운영 키 발급이 필요함

카카오페이 비즈니스 독립몰 신청 페이지에서 온라인 결제 신청을 눌러 로그인 화면까지 진입했다. 현재 브라우저에 카카오 계정이 로그인되어 있지 않아 신청서 제출은 아직 하지 못했다. 사용자가 카카오 계정 로그인과 휴대전화 본인 인증을 완료해야 이어서 진행할 수 있다.

또한 카카오페이 심사를 위해 사이트와 신청서에 공개할 현재 고객센터 전화번호가 필요하다. 기존 자료의 다른 담당자 전화번호는 사용하지 않았다. 정산 계좌와 KYC 서류도 외부 신청 과정에서 사용자가 직접 확인해야 한다.

상세 체크리스트는 `KAKAOPAY_APPLICATION.md`에 정리했다.

승인 후 Sites 런타임에 연결할 환경변수:

- `NEXT_PUBLIC_KAKAOPAY_ENABLED=true`
- `KAKAOPAY_CID`
- `KAKAOPAY_SECRET_KEY`
- `NEXT_PUBLIC_BUSINESS_PHONE`

### P0 — 네이버페이 결제형 가맹 신청 제출과 인증값 발급이 필요함

네이버페이센터의 가맹점 가입하기에서 회원가입 10% 단계까지 진입했다. 현재 네이버 아이디 로그인 화면에서 대기 중이다. 사용자가 네이버 로그인과 본인 인증을 완료하면 결제형·자체 개발 독립몰·단건결제 유형으로 신청서를 이어서 작성한다.

상세 체크리스트는 `NAVERPAY_APPLICATION.md`에 정리했다. 승인 후 Sites 런타임에 `NEXT_PUBLIC_NAVERPAY_ENABLED`, `NAVERPAY_MODE`, `NAVERPAY_PARTNER_ID`, `NAVERPAY_CLIENT_ID`, `NAVERPAY_CLIENT_SECRET`과 필요한 경우 `NAVERPAY_CHAIN_ID`를 연결한다.

### P1 — 기존 Paddle 설정은 보조 코드로만 남아 있음

Paddle 결제 코드는 보조·롤백 경로로 저장소에 남아 있지만 국내 판매용 운영 결제로 활성화하지 않는다. 현재 공개 사이트의 구매 버튼은 카카오페이·네이버페이 운영 키가 연결되기 전까지 `간편결제 심사 준비 중`으로 비활성화된다. 비밀값은 저장소나 인계 문서에 쓰지 말고 Sites 런타임 설정에만 저장한다.

### P2 — Paddle 외부 계정 설정은 현재 필요하지 않음

로그인 회원의 구매 여부를 서버에서 확인한 뒤 PDF를 열어주는 `/api/library/[product]` 경로와 마이페이지 재열람 버튼이 구현됐다. `/api/paddle/webhook`은 Paddle 서명을 확인해 결제 완료 주문을 `orders`에 저장하고 전액 환불·차지백 시 권한을 회수한다.

카카오페이 직연동을 선택했으므로 Paddle 상품·가격·웹훅 설정은 진행하지 않는다. 향후 해외 판매로 전환할 때만 아래 설정을 재검토한다.

- `NEXT_PUBLIC_PADDLE_ENV`
- `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
- `NEXT_PUBLIC_CODEX_PRICE_ID`
- `NEXT_PUBLIC_CAREER_PRICE_ID`
- `NEXT_PUBLIC_JANE_PRICE_ID`
- `PADDLE_API_KEY`
- `PADDLE_NOTIFICATION_WEBHOOK_SECRET`

`TEST_PURCHASER_EMAILS`에 등록된 계정은 데이터베이스 주문 없이 세 권 모두 구매 완료로 간주한다. 기본 테스트 계정은 `oxaz1234@gmail.com`이다.

### P1 — 후기 운영 절차

`POST /api/reviews`는 후기를 `pending`, `purchase_verified=0`으로 저장한다. 관리자는 `/admin/reviews`에서 입력된 구매 번호를 실제 주문 내역과 대조한 뒤에만 승인한다. 승인 시에만 `approved`, `purchase_verified=1`로 바뀌며 공개 API에 노출된다. 현재 자동 주문 대조는 하지 않으므로 구매 번호 확인을 생략하면 안 된다.

### P2 — 시각 QA 기록

2026-07-20에 1440px 데스크톱 랜딩·상세 3종과 390px 모바일 랜딩·상세 화면을 검수했다. 기록과 최종 보고서는 `/Users/chulwan/Documents/Codex/2026-07-18/pc/audit/final-launch-2026-07-20/`에 있다. PDF 3권은 페이지 수, 빈 본문, 깨진 글자와 앞·중간·마지막 대표 페이지 렌더링을 확인했다.

## 4. 디렉터리와 핵심 파일

현재 Mac의 웹사이트 Git 저장소:

`/Users/hanwha/Documents/전자책/book`

다른 PC에서는 절대경로가 다를 수 있으므로 `git rev-parse --show-toplevel`로 저장소 루트를 확인한다. 아래 웹사이트 경로는 모두 이 저장소 루트 기준이다.

### 전자책 원문과 산출물

- 1권 원문: `codex-practical-manuscript.md`
- 1권 워크북: `codex-practical-workbook.md`
- 2권 원문: `career-book/manuscript.md`
- 3권 원문: `seonara-book/manuscript.md` (공개 본문 저자명은 `제인`)
- 전체 Mac 자료 보강 기록: `research/full-mac-augmentation-2026-07-19.md`
- PDF 생성 스크립트: `scripts/build_*.py`
- 최종 PDF: `output/pdf/`

최종 판매용 PDF:

- `output/pdf/codex-solo-service-playbook.pdf`
- `output/pdf/career-design-philip.pdf`
- `output/pdf/flight-attendant-to-it-seonara.pdf`

웹용 새 표지를 PDF 첫 페이지에 적용하고 배포용 파일까지 동기화할 때는
`website/scripts/apply-pdf-covers.py`를 실행한다. 이 스크립트는 기존 페이지 수,
메타데이터와 1권의 PDF 북마크를 유지하면서 첫 페이지만 교체한다.
1권과 3권은 이전 파일 캐시를 피하기 위해 각각 `codex-7461d974.pdf`,
`jane-fc5efcfd.pdf` 경로를 사용한다. 3권의 공개 PDF 메타데이터 저자명은 가명
`제인`으로 고정한다.

### 웹사이트

- 메인 마켓: `app/page.tsx`
- 공통 헤더: `app/components/StorefrontHeader.tsx`
- 모바일 전자책 메뉴: `app/components/MobileBookMenu.tsx`
- 디자인 시스템: `app/design-system.css`
- 공통 상세페이지 UI: `app/components/ClassDetailPage.tsx`
- 상품별 데이터: `app/codex/page.tsx`, `app/career/page.tsx`, `app/jane/page.tsx`
- 전역 스타일: `app/globals.css`
- 구매 처리: `app/components/PurchaseButton.tsx`
- 후기 UI: `website/app/components/ReviewSection.tsx`
- 후기 API: `website/app/api/reviews/route.ts`
- 후기 DB 스키마: `website/db/schema.ts`
- 회원·세션 공통 로직: `website/app/auth/member.ts`, `website/app/auth/session.ts`
- 전자책 권한 카탈로그: `website/app/library/catalog.ts`
- 로그인·구매 검증 PDF 응답: `website/app/api/library/[product]/route.ts`
- 배포용 PDF: `website/public/library-assets/`
- 결제 구매권한: `website/app/api/checkout/context/route.ts`, `website/app/paddle/entitlement.ts`
- Paddle 웹훅: `website/app/api/paddle/webhook/route.ts`, `website/app/paddle/server.ts`
- 카카오페이 API: `website/app/api/kakaopay/`, `website/app/kakaopay/server.ts`
- 카카오페이 신청 체크리스트: `website/KAKAOPAY_APPLICATION.md`
- 네이버페이 API: `website/app/api/naverpay/`, `website/app/naverpay/server.ts`
- 네이버페이 신청 체크리스트: `website/NAVERPAY_APPLICATION.md`
- 직접결제 관리자 환불: `website/app/api/admin/orders/refund/route.ts`
- 사업자 공통 푸터: `website/app/components/BusinessFooter.tsx`
- 판매 정책: `website/app/terms/page.tsx`, `website/app/privacy/page.tsx`, `website/app/refund/page.tsx`
- 결제 완료 페이지: `website/app/checkout/success/page.tsx`
- 마이페이지: `app/mypage/page.tsx`, `app/components/AccountDashboard.tsx`
- 회원 API: `website/app/api/account/profile/route.ts`, `website/app/api/account/orders/route.ts`
- 관리자 회원관리: `website/app/admin/members/page.tsx`, `website/app/api/admin/members/route.ts`
- 관리자 후기관리: `website/app/admin/reviews/page.tsx`, `website/app/api/admin/reviews/route.ts`
- SEO 공통 메타데이터: `website/app/layout.tsx`
- 테스트: `website/tests/rendered-html.test.mjs`
- 호스팅 설정: `.openai/hosting.json`
- 환경변수 예시: `.env.example`
- 화면·상호작용 QA: `design-qa.md`

상세페이지는 하나의 공통 컴포넌트를 사용한다. 구조를 바꾸려면 `ClassDetailPage.tsx`와 상세페이지용 CSS를 수정하고, 책별 문구만 바꿀 때는 각 상품의 `page.tsx` 안 `book` 객체를 수정한다.

## 5. 개발과 검증

필수 환경은 Node.js 22.13 이상이다.

```bash
cd /Users/hanwha/Documents/전자책/book
npm install
npm run dev -- --port 3001
```

검증:

```bash
npm run build
node --test tests/rendered-html.test.mjs
git status --short
```

2026-07-21 인계 시점 상태:

- 빌드 성공
- 자동검사 18개 통과
- ESLint 오류·경고 0개
- `dist/server/index.js` 존재
- `git status` clean

## 6. 배포 상태와 절차

Sites 프로젝트 ID는 `website/.openai/hosting.json`에 저장돼 있다. 현재 사이트 접근 모드는 `public`이다.

현재 프로젝트 ID는 `appgprj_6a5c35c6dcf881919ab2bf0ecbb09e52`다. 최신 공개 버전은 29이며 환경변수 revision은 2다. 현재 Sites 환경에는 Google 로그인·관리자·테스트 구매자·실제 사이트 URL만 설정돼 있고, 결제 운영 키와 `NEXT_PUBLIC_BUSINESS_PHONE`은 아직 없다.

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
- 2026-07-20 최종 출시 QA 스크린샷은 `/Users/chulwan/Documents/Codex/2026-07-18/pc/audit/final-launch-2026-07-20/`에 있다.

참고 이미지:

- `reference/class101-ref-1.png`
- `reference/class101-ref-2.png`
- `reference/class101-ref-3.png`

## 8. 콘텐츠 원칙

- 박철완 실명은 전자책 원문과 저자 소개에서 `필립`으로 바꾼다. 사업자 법정 고지는 예외다.
- 확인하지 못한 경력, 수치, 회사 기여를 새로 만들어 쓰지 않는다.
- 제인의 위시켓 시스템 화면은 본인이 만든 시스템이 아니다. 기존 시스템을 활용한 운영 경험과 Codex로 직접 만든 HTML 대시보드를 명확히 구분한다.
- 취업, 합격, 수익을 보장하는 표현을 사용하지 않는다.
- 실제 구매자가 아닌 후기나 추천사를 실제 후기처럼 표시하지 않는다.
- 2권과 3권 PDF 본문은 나눔명조를 유지한다. 표지와 큰 제목은 기존 고딕체를 유지한다.

## 9. 다음 에이전트 권장 작업 순서

1. 사용자가 카카오 계정 로그인과 휴대전화 본인 인증을 완료한다.
2. 현재 공개용 고객센터 전화번호와 정산 계좌를 확정한다.
3. `KAKAOPAY_APPLICATION.md`의 사업자 정보로 카카오페이 독립몰 가맹 신청서를 제출한다.
4. 개발자센터 애플리케이션에 서비스 도메인과 승인·취소·실패 URL을 등록하고 개발용 키로 테스트한다.
5. 가맹 승인 후 운영 CID·Secret key와 고객센터 전화번호를 Sites 환경변수에 연결한다.
6. 테스트 결제 완료·사용자 취소·결제 실패·환불을 실행해 주문 적재와 권한 회수를 검증한다.
7. 가맹 승인 후 모바일·데스크톱에서 실제 결제수단 버튼과 외부 결제창을 다시 시각 QA한다. 랜딩·상세·마이페이지는 2026-07-20 최종 QA 완료 상태다.
8. 실제 구매 후기 접수 후 `/admin/reviews`에서 구매 번호를 대조하고 승인한다.
9. Google Search Console과 네이버 서치어드바이저 등록 및 전환 추적을 연결한다.

## 10. 현재 사이트의 알려진 제약

- 검색과 카테고리 필터가 동작하며, 상세 헤더 검색은 메인 검색 결과로 이동한다.
- Google 로그인, 회원 저장, 마이페이지와 관리자 회원관리는 실제 계정으로 검증됐다.
- 국내 직접결제 주문 적재·환불 권한 회수 코드는 준비됐지만 카카오페이·네이버페이 실결제 검증은 가맹 승인 전이라 남아 있다.
- 환불 정책 전문과 판매자 법적 고지는 별도 정책 페이지와 공통 푸터에 공개돼 있다.
- 후기 작성자는 구매 번호를 입력하며 관리자가 수동 대조한다. 자동 결제 검증은 아직 하지 않는다.
- 사이트 분석·광고 전환 태그는 아직 연결되지 않았다.

## 11. 최종 QA 증거와 운영 메모

- 최종 보고서: `/Users/chulwan/Documents/Codex/2026-07-18/pc/audit/final-launch-2026-07-20/REPORT.md`
- 데스크톱 랜딩: `01-home-desktop.png`
- 1·2·3권 데스크톱 상세: `02-codex-detail-desktop.png`, `03-career-detail-desktop.png`, `04-jane-detail-desktop.png`
- 모바일 랜딩·상세: `05-home-mobile.png`, `06-codex-detail-mobile.png`
- 마이페이지: `07-mypage-desktop.png`
- 테스트 구매자 `oxaz1234@gmail.com`에서 세 권 모두 `PDF 읽기` 링크가 노출되는 것을 공개 사이트에서 확인했다.
- 관리자 `/admin/reviews`가 빈 상태에서도 정상 렌더링되고 관리자 세션 없이는 API가 거부되는 구조다.
- 브라우저 콘솔에서 사이트 자체 오류는 없었다. 확인된 경고는 사용자 Chrome 확장 프로그램에서 발생한 것으로 사이트 코드와 무관했다.

### 다음 에이전트가 하지 말아야 할 것

- 결제 운영 키, 세션 비밀값, 임시 Sites 저장소 토큰을 Git·문서·채팅에 기록하지 않는다.
- 가상 후기를 다시 만들거나 고정 별점·후기 수를 표시하지 않는다.
- 카카오페이·네이버페이 승인 전 `NEXT_PUBLIC_*PAY_ENABLED=true`로 바꾸지 않는다.
- 테스트 구매자 권한을 실제 주문으로 오인하지 않는다.
- 기존 Sites 프로젝트가 있는데 새 프로젝트를 만들지 않는다.
- 3권 공개 PDF 파일명·메타데이터·본문에 `서나라`를 다시 노출하지 않는다.

## 12. Google 로그인 구현 및 인계 상태

- 구현 파일: `app/components/GoogleAccount.tsx`, `app/auth/session.ts`, `app/api/auth/config/route.ts`, `app/api/auth/google/route.ts`, `app/api/auth/session/route.ts`, `app/api/auth/logout/route.ts`
- Google Identity Services 공식 버튼을 사용하고, Google ID 토큰을 서버에서 공개키·발급자·대상 클라이언트 기준으로 검증한다.
- 검증 후 `HttpOnly`, `Secure`, `SameSite=Lax` 쿠키에 7일 세션을 저장하며 헤더에 이름·이메일·로그아웃을 표시한다.
- 필요한 Sites 런타임 환경 변수는 `GOOGLE_CLIENT_ID`와 `GOOGLE_SESSION_SECRET`이다. `GOOGLE_SESSION_SECRET`은 충분히 긴 무작위 값으로 생성해 비밀 환경 변수로 저장한다.
- 최초 관리자로 사용할 이메일을 `ADMIN_EMAILS`에 쉼표로 구분해 설정한다. 관리자 API는 세션과 서버 환경변수를 함께 확인한다.
- 테스트 구매 계정은 `TEST_PURCHASER_EMAILS`에 쉼표로 구분해 설정한다. 현재 기본값은 `oxaz1234@gmail.com`이며 이 계정에는 세 권 전체가 표시된다.
- 사용자가 제공해야 하는 값은 `.apps.googleusercontent.com`으로 끝나는 Google OAuth 웹 클라이언트 ID뿐이다. 클라이언트 보안 비밀번호는 필요하지 않다.
- Google Cloud OAuth 클라이언트의 승인된 JavaScript 원본에 `https://codex-solo-builder-book.wani3000.chatgpt.site`를 등록해야 한다.
- 클라이언트 ID를 받은 뒤 두 환경 변수를 Sites에 설정하고 새 버전을 배포한 다음 로그인, 새로고침 후 세션 유지, 로그아웃, 모바일 헤더를 검증한다.
