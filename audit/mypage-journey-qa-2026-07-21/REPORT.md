# 마이페이지 여정 QA

## 판정

**BLOCK**

현재 구현은 승인된 라우트 계약(`/mypage`, `/mypage/orders`, `/mypage/profile`)을 충족하지 않는다. `/mypage/orders`와 `/mypage/profile`은 실제 브라우저와 HTTP 요청에서 모두 404였고, 메뉴는 `/mypage` 한 문서 안에서 URL hash와 React 상태만 변경한다. 로그인 사용자 세션이 없어 구매자·환불·관리자 상태의 실제 브라우저 검증도 완료하지 못했으므로 출시 통과 판정을 내릴 수 없다.

## 실행 환경과 제한

- 감사 기준일: 2026-07-21
- 대상 저장소: `website`
- 기준 URL: `http://localhost:3000`
- 실행 결과:
  - `npm test`: 27개 테스트 통과
  - `npm run build`: 통과
  - Playwright 비로그인 브라우저 검증: 데스크톱 1200px, 모바일 390×844 수행
  - `/mypage`: HTTP 200
  - `/mypage/orders`: HTTP 404
  - `/mypage/profile`: HTTP 404
- 제한:
  - 로컬 Google·카카오 로그인 설정과 인증된 브라우저 세션이 없어 로그인 이후 상태는 실행하지 못했다.
  - 실제 결제, 환불 승인, PDF 최초 열람, 회원 탈퇴처럼 외부 상태를 바꾸는 작업은 수행하지 않았다.
  - 인증 비밀, 계정 이메일, 개인정보는 보고서에 기록하지 않았다.

## 기대 라우트 계약

| 메뉴 | 기대 URL | 실제 URL | 판정 |
|---|---|---|---|
| 내 서재 | `/mypage` | `/mypage#overview` 또는 `/mypage`의 로컬 상태 | FAIL |
| 주문 내역 | `/mypage/orders` | `/mypage#orders`; 직접 URL은 404 | FAIL |
| 프로필 관리 | `/mypage/profile` | `/mypage#profile`; 직접 URL은 404 | FAIL |

## 핵심 발견

### [P1] 마이페이지 하위 페이지가 없고 메뉴가 hash와 로컬 상태만 변경한다

- 재현 경로:
  1. `/mypage/orders` 또는 `/mypage/profile`을 직접 연다.
  2. 서버가 404를 반환하는지 확인한다.
  3. `AccountDashboard`의 메뉴 링크가 `#overview`, `#orders`, `#profile`인지 확인한다.
- 기대 결과: 각 메뉴가 독립 pathname으로 이동하고, 직접 접근·새로고침으로 같은 목적 화면을 복원해야 한다.
- 실제 결과: App Router에는 `app/mypage/page.tsx`만 존재한다. 메뉴 클릭은 `activeSection` 상태와 hash만 바꾸며 pathname은 계속 `/mypage`다.
- 증거:
  - `app/mypage/page.tsx:8`
  - `app/components/AccountDashboard.tsx:26`
  - `app/components/AccountDashboard.tsx:34`
  - `app/components/AccountDashboard.tsx:66`
  - `app/components/AccountDashboard.tsx:136`
  - `app/components/AccountDashboard.tsx:144`
  - `app/components/AccountDashboard.tsx:148`
  - `app/components/AccountDashboard.tsx:149`
  - `app/components/AccountDashboard.tsx:150`
  - 로컬 브라우저: `/mypage/orders` 404, `/mypage/profile` 404
- 영향: 공유 가능한 URL, 직접 접근, 새로고침, 페이지 단위 제목·포커스·오류 경계, 정상적인 브라우저 이동 계약이 모두 성립하지 않는다. 사용자가 요구한 “항목별 페이지 이동”이 불가능하다.
- 수정 방향: 공통 마이페이지 레이아웃과 메뉴를 분리하고 `app/mypage/page.tsx`, `app/mypage/orders/page.tsx`, `app/mypage/profile/page.tsx`를 실제 라우트로 만든다. 메뉴는 `Link`로 pathname을 이동하고 활성 상태는 현재 pathname에서 계산한다. `내 서재`와 `주문 내역`의 주 콘텐츠도 분리한다.

### [P1] 모바일·태블릿에서 메뉴와 결과 콘텐츠가 한 열로 아래에 쌓이도록 설계돼 있다

- 재현 경로:
  1. 폭 900px 이하에서 로그인한 마이페이지 레이아웃을 적용한다.
  2. DOM상 먼저 있는 사이드바 전체 다음에 `.mypage-content`가 배치되는 구조를 확인한다.
- 기대 결과: 메뉴 항목을 누르면 목적 페이지로 이동하고 새 페이지의 주 콘텐츠가 명확한 시작점에 보여야 한다.
- 실제 결과: 반응형 CSS가 `.mypage-grid`를 한 열로 바꾸고 sticky 사이드바도 일반 흐름으로 되돌린다. 따라서 프로필·요약·빠른 링크·전체 메뉴 다음에 선택 콘텐츠가 배치된다. 코드상 세 주 콘텐츠를 동시에 렌더링하지는 않지만, 사용자가 인지한 “항목을 누르면 내용이 아래에 붙는” 현상은 이 구조에서 발생한다.
- 증거:
  - `app/components/AccountDashboard.tsx:131`
  - `app/components/AccountDashboard.tsx:132`
  - `app/components/AccountDashboard.tsx:157`
  - `app/globals.css:841`
  - `app/globals.css:842`
  - `app/globals.css:843`
  - `app/globals.css:847`
  - `app/globals.css:848`
- 영향: 모바일에서 메뉴 클릭 후 사용자가 아래로 스크롤해야 결과를 찾게 되고, 페이지가 바뀌었다는 피드백도 없다. 핵심 마이페이지 탐색이 사실상 긴 단일 문서 탐색처럼 동작한다.
- 수정 방향: 하위 pathname으로 전환한 뒤 모바일에서는 현재 페이지 제목과 주 콘텐츠를 상단에 둔다. 공통 탐색은 접을 수 있는 메뉴, 탭 또는 별도 상단 탐색으로 제공하되 주 콘텐츠 앞에 전체 프로필 허브를 반복 배치하지 않는다.

### [P2] 결제·중복 구매·카카오 계정 연결도 폐기 대상 hash URL에 결합돼 있다

- 재현 경로: 결제 완료 CTA, 카카오 연결 복귀, 카카오·네이버페이 중복 구매 응답의 목적 URL을 확인한다.
- 기대 결과: 주문 관련 진입은 `/mypage/orders`, 계정 연결 결과는 `/mypage/profile`로 일관되게 이동해야 한다.
- 실제 결과: 여러 통합 지점이 `/mypage#orders` 또는 `/mypage#profile`을 생성한다.
- 증거:
  - `app/checkout/success/page.tsx:6`
  - `app/components/KakaoAccount.tsx:90`
  - `app/api/auth/kakao/callback/route.ts:20`
  - `app/api/auth/kakao/callback/route.ts:88`
  - `app/api/auth/kakao/start/route.ts:24`
  - `app/api/kakaopay/ready/route.ts:23`
  - `app/api/naverpay/ready/route.ts:23`
- 영향: 화면 라우트만 추가하고 이 링크들을 바꾸지 않으면 결제 직후와 계정 연결 직후 사용자는 계속 구형 단일 화면으로 이동하거나 잘못된 상태를 보게 된다.
- 수정 방향: 마이페이지 라우트 상수를 한곳에 정의하고 모든 생산자·소비자를 `/mypage/orders`와 `/mypage/profile`로 교체한다. 로그인 `next`와 OAuth `returnTo`도 query와 hash를 섞지 말고 pathname 계약으로 통일한다.

### [P2] 현재 자동 테스트는 기능 문구 존재만 검사해 잘못된 라우팅을 통과시킨다

- 재현 경로: `npm test`를 실행한 뒤 마이페이지 테스트 내용을 확인한다.
- 기대 결과: 테스트가 하위 라우트 존재, 직접 접근 200, 메뉴 href, pathname 변경, 새로고침과 히스토리 복원을 검증해야 한다.
- 실제 결과: 27개 테스트는 모두 통과하지만 마이페이지 테스트는 컴포넌트 파일에 “구매 내역”, “회원 탈퇴”, “주문번호” 등의 문자열이 있는지만 확인한다. `/mypage/orders`와 `/mypage/profile` 404를 잡는 테스트가 없다.
- 증거:
  - `tests/rendered-html.test.mjs:135`
  - `tests/rendered-html.test.mjs:139`
  - `tests/rendered-html.test.mjs:156`
  - 빌드 라우트 목록에는 `/mypage`만 있고 두 하위 라우트가 없다.
- 영향: CI가 통과해도 사용자 핵심 이동은 실패하는 거짓 안전 신호가 생긴다.
- 수정 방향: 최소한 라우트 파일과 메뉴 href를 정적으로 검사하고, 브라우저 E2E에서 로그인 상태를 주입해 클릭→pathname→새로고침→뒤로가기·앞으로가기를 검증한다. 390px에서 주 콘텐츠의 위치도 함께 검사한다.

### [P2] 비로그인 고정 로그인 화면 뒤의 스토어 UI가 키보드 포커스를 받는다

- 재현 경로:
  1. 비로그인 상태로 모바일 `/mypage`를 연다.
  2. Tab 키를 누른다.
- 기대 결과: 고정 로그인 화면이 열린 동안 로그인 화면 내부 요소만 탐색돼야 한다.
- 실제 결과: 첫 번째부터 네 번째 Tab 포커스가 로그인 화면 뒤의 “전자책 메뉴 열기”, 글로벌 로고, 검색 입력, 검색 버튼으로 이동한 뒤에야 로그인 화면의 “스토어로 돌아가기”로 이동했다. 접근성 트리에도 글로벌 헤더·푸터와 로그인 화면이 동시에 남는다.
- 증거:
  - `app/mypage/page.tsx:9`
  - `app/components/AccountDashboard.tsx:109`
  - `app/globals.css:736`
  - Playwright 390×844 키보드 탐색: 1~4번째 Tab이 배경 글로벌 헤더에 위치
- 영향: 화면상 가려진 컨트롤이 키보드와 보조기술 사용자에게 노출되어 현재 위치를 잃게 한다.
- 수정 방향: 비로그인 상태에서는 마이페이지 전용 로그인 레이아웃만 렌더링하거나, 배경 형제를 `inert`/`aria-hidden` 처리하고 포커스를 로그인 화면 안에 제한한다. 가능하면 인증 상태를 서버 레이아웃 단계에서 분기해 중복 DOM을 만들지 않는다.

## 상태별 검증표

| 사용자 상태 | 시나리오 | 결과 | 근거 |
|---|---|---|---|
| 비로그인 | `/mypage` 직접 접근 | PARTIAL | HTTP 200 및 로그인 화면 확인. 로컬 소셜 로그인 설정이 없어 실제 로그인은 불가 |
| 비로그인 | `/mypage/orders` 직접 접근 | FAIL | 실제 브라우저·HTTP 모두 404 |
| 비로그인 | `/mypage/profile` 직접 접근 | FAIL | 실제 브라우저·HTTP 모두 404 |
| 비로그인 모바일 | 키보드 탐색 | FAIL | 고정 로그인 화면 뒤 글로벌 헤더가 먼저 포커스를 받음 |
| 일반 회원 | 내 서재→주문→프로필 클릭 | BLOCKED | 인증된 브라우저 세션 없음. 정적 분석상 hash만 변경 |
| 일반 회원 | 직접 URL·새로고침 | FAIL | 두 하위 URL 자체가 404 |
| 일반 회원 | 뒤로가기·앞으로가기 | BLOCKED | 로그인 세션 없음. 현재 구조는 pathname이 아닌 hash 기록에만 의존 |
| 구매 없음 | 빈 주문 상태 | BLOCKED | 인증된 일반 회원 세션·테스트 데이터 없음 |
| 테스트 구매자 | 전자책 3권·PDF 링크 | BLOCKED | 인증된 테스트 구매자 세션 없음 |
| 실제 구매자 | 최초 열람 전·후 | BLOCKED | 안전한 테스트 주문과 인증 세션 없음 |
| 실제 구매자 | 환불 신청·검토·완료·불가 | BLOCKED | 상태별 테스트 데이터와 인증 세션 없음 |
| 환불 완료 회원 | PDF 권한 회수 | BLOCKED | 실제 상태 변경은 수행하지 않음 |
| 관리자 | 관리자 메뉴와 환불 처리 | BLOCKED | 관리자 세션 없음 |
| 코드·빌드 | 정적 테스트 및 빌드 | PASS | 27개 테스트 통과, 빌드 성공. 단, 라우팅 회귀를 검출하지 못함 |

## 미검증 항목과 차단 사유

- Google·카카오 실제 로그인, 로그인 완료 후 복귀 URL: 로컬 공급자 설정 및 인증 세션 부재
- 로그인 후 메뉴 클릭의 시각적 결과, 스크롤 위치, 데스크톱·390px 비교: 로그인 세션 부재
- 브라우저 뒤로가기·앞으로가기의 실제 콘텐츠 복원: 로그인 세션 부재
- 프로필 저장, 계정 연결·해제, 로그아웃, 탈퇴 다이얼로그: 로그인 세션 부재 및 외부 상태 변경 금지
- 구매 없음·구매 완료·테스트 권한·최초 열람 전후: 상태별 안전한 테스트 데이터 부재
- 환불 신청·검토·승인·거절과 PDF 권한 회수: 상태별 테스트 데이터 부재 및 실제 결제 취소 금지
- 관리자 승인·거절 화면: 관리자 세션 부재

미검증 항목은 PASS로 계산하지 않았다.

## 출시 판정

**출시 차단.** 먼저 실제 하위 페이지 세 개를 만들고 모든 hash 기반 진입점을 새 pathname으로 교체해야 한다. 이후 로그인 가능한 안전한 QA 환경에서 일반 회원·테스트 구매자·실제 주문 상태·환불 상태·관리자를 각각 준비해 클릭, 직접 URL, 새로고침, 뒤로가기·앞으로가기, 390px 모바일을 다시 검증해야 한다. P1 두 건과 P2 회귀·접근성 항목이 해소되고 핵심 로그인 시나리오가 실행되기 전에는 출시 승인할 수 없다.
