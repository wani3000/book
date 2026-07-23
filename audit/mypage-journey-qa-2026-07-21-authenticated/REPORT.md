# 마이페이지 여정 QA — 인증된 QA 관리자

## 판정

**BLOCK**

QA 관리자 로그인과 전자책 3권 권한은 정상으로 확인됐지만, 마이페이지 메뉴가 독립 페이지로 이동하지 않고 `/mypage` 안에서 해시와 React 상태만 바꾸는 구조다. 필수 계약인 `/mypage/orders`, `/mypage/profile` 라우트 파일도 존재하지 않는다. 모바일과 실제 PDF 최종 렌더링 등 일부 항목은 실행 중단 요청에 따라 미검증으로 남겼다.

## 실행 환경과 제한

- 저장소: `website`
- 기준 URL: `http://localhost:3011`
- 실행일: 2026-07-21
- 사용자 상태: `.env.local`에만 보관된 마스킹된 QA 관리자 계정
- QA 계정 비밀번호·토큰·쿠키는 기록하지 않았다.
- 실제 결제, 환불 신청·승인·거절, 회원 상태 변경, 회원 탈퇴는 실행하지 않았다.
- 브라우저 검사는 중단 지시에 따라 핵심 경로까지만 수행했다.
- 종료 시 브라우저의 QA 관리자 세션을 로그아웃했고, 별도 API 검사용 세션도 로그아웃했다.

## 인증 및 API 확인

| 항목 | 결과 | 근거 |
|---|---|---|
| `/qa-login` 화면 | PASS | 이메일·비밀번호 필드와 `QA 관리자로 로그인` 버튼 표시 |
| QA 관리자 로그인 | PASS | 로그인 후 `/mypage` 도착, 관리자 전용 메뉴 표시 |
| `/api/auth/session` | PASS | HTTP 200, 인증 사용자이며 역할 `admin` 확인 |
| `/api/account/profile` | PASS | HTTP 200, 관리자 프로필과 구매 전자책 3권 통계 확인 |
| `/api/account/orders` | PASS | HTTP 200, `codex`, `career`, `jane` 3개 주문과 열람 링크 확인 |
| 브라우저 로그아웃 | PASS | 로그아웃 후 `/mypage`가 일반 로그인 화면으로 전환되고 로그아웃 버튼이 사라짐 |

QA 관리자는 로그인할 때 관리자 역할로 생성·갱신된다. 코드 근거는 `app/api/auth/qa-login/route.ts:41-80`이다. QA 관리자 이메일은 테스트 구매자로 포함되어 세 권의 테스트 열람 권한을 받는다. 코드 근거는 `app/library/catalog.ts:31-53`이다.

## 기대 라우트 계약

| 메뉴 | 기대 URL | 실제 URL/구현 | 판정 |
|---|---|---|---|
| 내 서재 | `/mypage` | `/mypage#overview` 또는 `/mypage` | FAIL |
| 주문 내역 | `/mypage/orders` | `/mypage#orders` | FAIL |
| 프로필 관리 | `/mypage/profile` | `/mypage#profile` | FAIL |

`app/mypage/page.tsx` 한 개만 있고 `app/mypage/orders/page.tsx`, `app/mypage/profile/page.tsx`는 존재하지 않는다. 메뉴 구현도 `app/components/AccountDashboard.tsx:66-74`, `136-150`에서 `window.location.hash`, `hashchange`, `href="#..."`에 의존한다.

## 핵심 발견

### [P1] 마이페이지 메뉴가 실제 하위 페이지로 이동하지 않는다

- 재현 경로: QA 관리자 로그인 → `/mypage` → `주문 내역` → `프로필 관리`
- 기대 결과: pathname이 각각 `/mypage/orders`, `/mypage/profile`로 바뀐다.
- 실제 결과: pathname은 계속 `/mypage`이고 hash만 `#orders`, `#profile`로 바뀐다.
- 브라우저 증거:
  - 주문 내역 클릭 후 `http://localhost:3011/mypage#orders`
  - 프로필 관리 클릭 후 `http://localhost:3011/mypage#profile`
- 코드 증거: `app/components/AccountDashboard.tsx:66-74`, `136-150`
- 영향: 독립 페이지 주소 공유, 직접 진입, 페이지 단위 레이아웃과 제목, 모바일 정보 구조를 보장할 수 없다.
- 수정 방향: `/mypage`, `/mypage/orders`, `/mypage/profile` 라우트를 만들고 공통 레이아웃·사이드바를 `app/mypage/layout.tsx`로 분리한다. 메뉴는 `Link`의 실제 pathname을 사용해야 한다.

### [P1] 하위 마이페이지 라우트 파일이 존재하지 않는다

- 재현 경로: 저장소의 App Router 페이지 목록 확인
- 기대 결과: `app/mypage/orders/page.tsx`, `app/mypage/profile/page.tsx` 존재
- 실제 결과: `app/mypage/page.tsx`만 존재
- 증거: 저장소 파일 목록과 `app/mypage/page.tsx:1-10`
- 영향: `/mypage/orders`, `/mypage/profile` 직접 URL과 새로고침 계약을 구현할 수 없다.
- 수정 방향: 독립 라우트를 추가하고 각 페이지에는 목적에 맞는 주 콘텐츠만 렌더링한다.

### [P2] 프로필 메뉴 하나에 서로 다른 세 작업이 한꺼번에 들어 있다

- 재현 경로: `/mypage#profile`
- 기대 결과: 프로필 목적에 맞는 명확한 화면과 단계적 위험 작업 진입
- 실제 결과: `프로필 관리`, `로그인 계정 연결`, `회원 탈퇴` 섹션이 같은 콘텐츠 열에 함께 표시된다.
- 브라우저 증거: 프로필 메뉴에서 세 개의 H2가 동시에 확인됨
- 코드 증거: `app/components/AccountDashboard.tsx:165-182`
- 영향: 사용자가 말한 “항목 진입 시 아래로 쌓임” 현상을 구조적으로 만든다. 특히 모바일에서 사이드바 다음에 긴 세 섹션이 이어질 가능성이 높다.
- 수정 방향: 최소한 `/mypage/profile` 내부에서 계정 정보와 로그인 수단을 명확히 구획하고, 회원 탈퇴는 별도 위험 작업 진입 또는 독립 확인 화면으로 분리한다.

### [P2] 관리자 일부 화면은 관찰 시간 동안 로딩 상태를 벗어나지 못했다

- 재현 경로: 관리자 로그인 → `/admin/reviews`, `/admin/refunds`, `/admin/payments` 직접 진입
- 기대 결과: 목록 또는 빈 상태가 표시됨
- 실제 결과: 각각 `후기 목록을 불러오고 있습니다`, `환불 신청 목록을 불러오고 있습니다`, `결제 시도 목록을 불러오고 있습니다` 상태에서 관찰 종료
- 확인된 정상 범위: `/admin/members`는 `회원 관리` 제목을 렌더링했고 접근 거부 문구가 없었다.
- 영향: 장시간 로딩인지 단순 관찰 시간 부족인지 이번 실행만으로 확정할 수 없다.
- 수정 방향: 후속 QA에서 각 관리자 API 응답 시간·상태 코드와 로딩 종료 여부를 다시 확인한다.
- 판정 주의: 실행 중단 요청 때문에 확정 결함이 아니라 `BLOCKED` 성격으로 기록한다.

## 전자책 3권과 PDF 권한

| 상품 | 주문/API | 마이페이지 링크 | 실제 PDF 최종 렌더링 |
|---|---|---|---|
| Codex | PASS | `/api/library/codex` 확인 | BLOCKED |
| UI/UX 커리어 | PASS | `/api/library/career` 확인 | BLOCKED |
| 승무원에서 IT | PASS | `/api/library/jane` 확인 | BLOCKED |

주문 내역 화면에서 3개 주문과 3개의 `PDF 읽기` 링크를 확인했다. `/api/account/orders`도 동일한 세 상품과 세 링크를 반환했다. 권한 API는 테스트 구매자에게 열람을 허용하고 상품 자산으로 리다이렉트하도록 구현되어 있다(`app/api/library/[product]/route.ts:10-37`). 다만 브라우저에서 각 PDF가 끝까지 렌더링되는지는 중단 지시에 따라 실행하지 않았으므로 통과 처리하지 않는다.

## 관리자 메뉴

| 메뉴 | 노출 | 직접 진입 결과 |
|---|---|---|
| 회원 관리 | PASS | 제목 렌더링 확인 |
| 후기 관리 | PASS | 경로 진입, 로딩 종료 미검증 |
| 환불 관리 | PASS | 경로 진입, 로딩 종료 미검증 |
| 결제 상태 관리 | PASS | 경로 진입, 로딩 종료 미검증 |

네 메뉴는 관리자 상태에서만 조건부로 노출된다(`app/components/AccountDashboard.tsx:153`). 상태를 변경하는 버튼은 누르지 않았다.

## 상태별 검증표

| 사용자 상태 | 시나리오 | 결과 | 근거 |
|---|---|---|---|
| 비로그인 | `/qa-login` 접근 | PASS | 로컬 QA 로그인 폼 표시 |
| QA 관리자 | 소셜 로그인 없이 로그인 | PASS | `/mypage` 진입 및 admin 역할 확인 |
| QA 관리자 | 전자책 3권 주문 노출 | PASS | 화면과 orders API 모두 3권 |
| QA 관리자 | 주문 메뉴 이동 | FAIL | `/mypage#orders`, pathname 불변 |
| QA 관리자 | 프로필 메뉴 이동 | FAIL | `/mypage#profile`, pathname 불변 |
| QA 관리자 | 뒤로가기·앞으로가기 | PARTIAL | hash 방문 순서는 복원됐지만 독립 pathname 이동은 아님 |
| QA 관리자 | 관리자 메뉴 노출 | PASS | 회원·후기·환불·결제 메뉴 표시 |
| QA 관리자 | 관리자 목록 완전 렌더링 | BLOCKED | 회원 관리 외 세 화면은 로딩 종료 전 검사 중단 |
| QA 관리자 | PDF 3개 최종 렌더링 | BLOCKED | 링크와 권한 응답까지만 확인 |
| QA 관리자 | 로그아웃 | PASS | 로그인 화면 복귀 확인 |

## 미검증 항목과 차단 사유

- 390px 모바일 레이아웃: 검사 중단 요청으로 미실행
- `/mypage/orders`, `/mypage/profile` 브라우저 직접 URL과 새로고침: 라우트 파일 부재는 확인했지만 실제 404 화면 재현은 이번 인증 실행에서 미실행
- 브라우저 새로고침 후 현재 hash 상태 유지: 미실행
- 세 PDF의 최종 자산 응답과 뷰어 렌더링: 미실행
- 환불 신청·검토·완료·불가 전 상태: 테스트 데이터 없음 및 상태 변경 금지
- 회원 탈퇴 확인 다이얼로그 키보드·포커스: 파괴적 흐름 회피 및 검사 중단
- 일반 구매자·구매 이력 없음·환불 완료 사용자: 해당 상태 계정 없음
- 카카오·Google 계정 연결·해제: 외부 인증과 계정 상태 변경을 실행하지 않음
- 관리자 후기·환불·결제 화면의 로딩 완료: 실행 중단

## 출시 판정

**BLOCK**

인증된 QA 관리자로 로그인하고 전자책 3권과 관리자 권한을 확인할 수 있는 기반은 동작한다. 그러나 마이페이지의 핵심 정보 구조가 독립 URL이 아닌 해시 전환이며 필수 하위 라우트가 없다. `/mypage/orders`, `/mypage/profile`을 실제 페이지로 분리하고 모바일·직접 URL·새로고침·PDF 렌더링·관리자 로딩을 재검수하기 전에는 출시 통과로 판정할 수 없다.
