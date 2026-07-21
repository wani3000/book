# Design QA

> 범위 안내(2026-07-20): 아래 검증 기록은 마켓 메인(`/`) 기준이다. 최신 공통 상세페이지(`/codex`, `/career`, `/jane`)는 빌드와 구조 테스트를 통과했지만 별도의 데스크톱·모바일 스크린샷 QA 기록은 아직 없다. 상세페이지 공개 전 후속 시각 검증 항목은 상위 `HANDOFF.md`를 따른다.

- Source visual truth: `/Users/chulwan/Documents/Codex/2026-07-18/pc/reference/class101-ref-3.png`
- Implementation screenshots: `/Users/chulwan/Documents/Codex/2026-07-18/pc/website/qa-home-desktop.png`, `/Users/chulwan/Documents/Codex/2026-07-18/pc/website/qa-home-mobile.png`
- Combined comparison: `/Users/chulwan/Documents/Codex/2026-07-18/pc/website/qa-side-by-side.png`
- Viewports: desktop 1440×1024, mobile 390×844
- State: public marketplace home, default category; search interaction tested with `승무원`

**Full-view comparison evidence**

- The implementation follows the reference's compact white marketplace canvas, slim header, centered search field, small promotional banner, two-row category control grid, five-column product rows, carousel controls, and numbered popularity section.
- PHILIP BOOKS content intentionally uses portrait ebook covers instead of the reference's landscape video thumbnails. The visual density, card count, metadata hierarchy, and horizontal browsing behavior are retained.

**Focused region comparison evidence**

- Header: navigation weight, search-field height, account placement, and 1380px content frame align closely with the reference.
- Discovery area: left promo/right category grid proportions, border radii, and compact spacing match the reference hierarchy.
- Product row: five items, badge/bookmark positions, title/creator/price hierarchy, and section controls align with the source structure.
- Mobile: search moves below the logo, categories become a horizontal scroller, product rows retain a visible next-card affordance, and no horizontal page overflow or clipped primary control was observed.

**Required fidelity surfaces**

- Fonts and typography: Geist with Korean system fallbacks produces a comparable neutral commerce UI; weights, title sizes, metadata scale, and wrapping are consistent and readable.
- Spacing and layout rhythm: header, discovery grid, section gaps, five-column tracks, and mobile horizontal rails preserve the source density without collisions.
- Colors and tokens: white/gray base, black text, orange active state, and restrained category accents match the reference's marketplace semantics while retaining PHILIP BOOKS identity.
- Image quality and asset fidelity: all three real ebook covers are sharp, correctly proportioned, and never stretched; no placeholder imagery is present.
- Copy and content: every card is grounded in one of the three real books; duplicate placements are explicitly curated workbook or recommendation contexts and link to the correct detail page.
- Icons: Phosphor icons provide one consistent library with appropriate size, weight, and alignment.
- Accessibility and behavior: semantic headings, labels, focus indicators, keyboard-reachable controls, descriptive alt text, functioning search/category filters, and mobile tap targets are present.

**Findings**

- No actionable P0, P1, or P2 fidelity issues remain.

**Comparison history**

- Initial browser render exposed a local image-optimization runtime overlay. Replaced homepage `next/image` instances with intrinsic-dimension native images, reloaded, and confirmed zero console errors.
- Post-fix desktop and mobile captures show stable images, intact layout, and working search filtering.

**Primary interactions tested**

- Search field filters the catalog to the Jane book for `승무원`.
- Category buttons expose pressed state and filter the product rail.
- Book, story, ranking, and hero links resolve to `/codex`, `/career`, or `/jane`.
- Console errors checked: none after the image fix.

**Follow-up polish**

- P3: add more distinct products later if the catalog grows; repeated curated placements are currently necessary because the store has three books.

final result: passed

---

## 마이페이지 메뉴별 콘텐츠 분리 QA — 2026-07-21

- Scope: `/mypage#overview`, `/mypage#orders`, `/mypage#profile`
- 좌측 회원 정보·구매 요약·메뉴 레이아웃은 유지하고, 우측에는 선택한 메뉴의 콘텐츠만 표시한다.
- `내 서재`는 안내 화면, `주문 내역`은 구매 전자책과 PDF 링크, `프로필 관리`는 회원 정보와 탈퇴 영역만 렌더링한다.
- 해시 변경을 브라우저 기록과 동기화해 뒤로가기 시 이전 메뉴로 정상 복귀한다.

**Verification**

- `#overview`: 안내 화면 1개, 주문 및 프로필 영역 0개.
- `#orders`: 주문 영역 1개, 안내 및 프로필 영역 0개.
- `#profile`: 프로필과 회원 탈퇴 영역만 표시, 주문 및 안내 영역 0개.
- 모바일 390px: 가로 오버플로 없음, 로그인 닉네임과 선택 화면 정상 노출.
- 린트, 프로덕션 빌드, 자동화 테스트 18개 통과.

final result: passed

---

## 로그인 상태 헤더·마이페이지 QA — 2026-07-21

- Desktop reference: `/var/folders/sb/cmz9v7xx5jn3xhtb61xgzx3m0000gn/T/TemporaryItems/NSIRD_screencaptureui_w7Ew0s/스크린샷 2026-07-21 오후 2.34.17.png`
- Mobile reference: `/var/folders/sb/cmz9v7xx5jn3xhtb61xgzx3m0000gn/T/TemporaryItems/NSIRD_screencaptureui_S58q8j/스크린샷 2026-07-21 오후 2.33.55.png`
- Desktop implementation: `/Users/hanwha/Documents/전자책/book/.artifacts/mypage-desktop.png`
- Mobile implementation: `/Users/hanwha/Documents/전자책/book/.artifacts/mypage-mobile.png`
- Desktop comparison: `/Users/hanwha/Documents/전자책/book/.artifacts/mypage-desktop-comparison.jpg`
- Mobile comparison: `/Users/hanwha/Documents/전자책/book/.artifacts/mypage-mobile-comparison.jpg`
- Viewports: desktop 2048×1150, mobile 390×844
- State: Google 로그인 완료, 전자책 3권 구매 계정

**Full-view comparison evidence**

- 데스크톱은 참고 화면처럼 좌측 계정 요약·메뉴와 우측 핵심 콘텐츠의 2열 구조를 사용한다.
- 모바일은 프로필, 활동 요약, 내 서재 바로가기, 세로 메뉴가 한 열로 이어진다.
- 기존 사이트 공통 헤더와 푸터를 유지하면서 마이페이지 내부 정보 구조만 참고 화면에 맞춰 재구성했다.

**Focused region comparison evidence**

- 로그인 상태 헤더에는 `로그인` 대신 실제 표시 이름 `박철완`이 노출된다.
- 프로필 영역은 아바타, 닉네임, 이메일, 계정 관리 링크를 한 행에 배치한다.
- 구매한 전자책·작성한 후기 요약, 내 서재 바로가기와 메뉴 목록이 데스크톱·모바일 모두 동일한 순서로 유지된다.

**Required fidelity surfaces**

- Typography: Pretendard Regular/Bold만 사용하고 모바일 자체 문구 최소 15px를 지킨다.
- Layout: desktop 1200px 공통 폭, mobile 375px client/scroll width로 가로 넘침이 없다.
- Authentication: 헤더와 마이페이지가 같은 실제 세션의 닉네임을 표시한다.
- Functionality: PDF 읽기, 책 정보, 주문 내역, 프로필 저장, 로그아웃, 회원 탈퇴 흐름을 유지한다.

**Findings and fixes**

- P1: 모바일 헤더가 로그인 후에도 정적 `로그인` 링크를 표시 → 세션 기반 compact 계정 UI로 교체했다.
- P1: 기존 마이페이지의 작은 카드 중심 구조가 참고 화면과 다름 → 좌측 허브·우측 콘텐츠 구조로 재배치했다.
- P2: 모바일 계정 메뉴에 10–12px 문구 존재 → 자체 문구 최소 15px로 상향했다.
- No actionable P0, P1, or P2 issues remain.

**Verification**

- 모바일 header name: `박철완`.
- 모바일 document width: 375px client / 375px scroll.
- 브라우저 콘솔 오류 0건.
- 린트, 프로덕션 빌드, 자동 테스트 18개 통과.

final result: passed

---

## Google 로그인 페이지 QA — 2026-07-21

- Source visual truth: `/var/folders/sb/cmz9v7xx5jn3xhtb61xgzx3m0000gn/T/TemporaryItems/NSIRD_screencaptureui_1uudif/스크린샷 2026-07-21 오후 1.47.11.png`
- Desktop implementation: `/Users/hanwha/Documents/전자책/book/.artifacts/login-page-viewport.png`
- Mobile implementation: `/Users/hanwha/Documents/전자책/book/.artifacts/login-page-mobile.png`
- Combined comparison: `/Users/hanwha/Documents/전자책/book/.artifacts/login-page-comparison.jpg`
- Viewports: desktop 2048×1150, mobile 390×844
- State: 로그아웃 상태의 `/mypage`, Google 로그인 사용 가능

**Full-view comparison evidence**

- 참고 화면의 흰 배경, 넓은 여백, 중앙 집중형 로그인 영역, 상단 헤더와 하단 푸터 구성을 유지했다.
- 서비스 정책에 맞춰 이메일·비밀번호 및 복수 소셜 로그인은 제외하고 Google 로그인 하나로 단순화했다.
- 로그인 페이지도 메인·세부 판매페이지와 같은 `StorefrontHeader`와 `BusinessFooter`를 사용한다.

**Focused region comparison evidence**

- 데스크톱: 1200px 공통 콘텐츠 폭 안에서 420px 로그인 영역이 수평 중앙에 정렬된다.
- 모바일: 햄버거, 로고, 로그인 링크가 한 줄에 유지되고 검색창은 다음 줄로 내려간다.
- Google 로그인 버튼, 안내 문구, 전자책 둘러보기 링크가 명확한 단일 흐름으로 배치된다.

**Required fidelity surfaces**

- Typography: 웹사이트 공통 Pretendard Regular/Bold만 사용하며, 모바일 자체 문구는 15px 이상이다. Google 제공 버튼 글자는 공급자 스타일을 유지한다.
- Layout: 데스크톱과 모바일 모두 문서 가로 넘침 없이 중앙 정렬된다.
- Header/footer consistency: 메인·세부·로그인 화면이 동일한 공통 컴포넌트를 공유한다.
- Authentication: Google Identity Services 표준 버튼과 기존 서버 세션 흐름을 그대로 사용한다.

**Findings and fixes**

- P1: 모바일 Google 버튼의 고정 너비로 39px 가로 넘침 발생 → 화면 너비 기반 버튼 크기와 iframe 최대 너비를 적용해 해소했다.
- P1: 모바일 헤더의 Google 버튼이 로고와 충돌 → 모바일에서는 15px `로그인` 링크로 바꾸고 본문 Google 버튼을 유지했다.
- P2: 모바일 로그인 보조 문구가 12–14px → 사이트 정책에 맞춰 자체 문구를 15px로 상향했다.
- No actionable P0, P1, or P2 issues remain.

**Verification**

- Desktop comparison input reviewed at 2048×1150.
- Mobile document width: 375px client / 375px scroll, no horizontal overflow.
- Lint, production build, and 18 automated tests pass.

final result: passed

---

## 전체 전자책 가로형 섹션 QA — 2026-07-21

- Source visual truth: `/var/folders/sb/cmz9v7xx5jn3xhtb61xgzx3m0000gn/T/TemporaryItems/NSIRD_screencaptureui_oYtfw1/스크린샷 2026-07-21 오전 9.43.16.png`
- Implementation screenshot: `/Users/hanwha/Documents/전자책/book/.design-qa/all-books-viewport.png`
- Mobile implementation screenshot: `/Users/hanwha/Documents/전자책/book/.design-qa/all-books-mobile.png`
- Combined comparison evidence: `/Users/hanwha/Documents/전자책/book/.design-qa/all-books-comparison.png`
- Viewports: desktop 1100×1000, mobile 390×844
- State: 메인 페이지 기본 상태, `전체 전자책` 섹션 및 세 가지 카테고리 필터

**Full-view comparison evidence**

- 참고 화면의 검은 패널, 세 줄 가로 목록, 왼쪽 이미지와 오른쪽 정보 계층을 동일한 방향으로 구현했다.
- 오픈 일자와 원본 카테고리 표시는 전자책 카테고리로 치환하고, 목록 가격은 노출하지 않는다.
- 제공된 세 권의 실제 표지를 사용했으며 각 행 전체가 해당 상세페이지 링크로 동작한다.

**Focused region comparison evidence**

- 결합 비교 이미지에서 제목, 썸네일 비율, 태그, 행 간 구분선과 수직 리듬을 함께 확인했다.
- 모바일 캡처에서 82×104px 썸네일, 축약된 메타데이터, 우측 화살표가 가로 넘침 없이 유지됨을 확인했다.

**Required fidelity surfaces**

- Fonts and typography: 전체 랜딩의 Pretendard 계열을 유지하고, 참고 화면처럼 제목은 굵게, 보조 정보는 낮은 대비와 작은 크기로 구분했다.
- Spacing and layout rhythm: 데스크톱은 170px 썸네일과 188px 행, 모바일은 82px 썸네일과 144px 행으로 변환해 세 줄 리듬을 보존했다.
- Colors and visual tokens: `#111` 패널, 흰색 제목, 회색 메타데이터와 구분선을 사용해 참고 화면의 명도 구조를 맞췄다.
- Image quality and asset fidelity: 실제 표지를 고정 높이와 `object-fit` 비율로 표시해 늘어짐이나 잘림이 없다.
- Copy and content: 세 권의 실제 제목, 저자, 분야와 소개 문구만 사용하고 가격은 상세 구매 단계에서만 안내한다.

**Findings**

- No actionable P0, P1, or P2 issues remain.
- P3: 참고 이미지보다 썸네일이 세로형이지만 실제 전자책 표지 비율을 보존하기 위한 의도적 차이다.

**Comparison history**

- 첫 구현에서 데스크톱 패널과 세 줄 목록 구조가 참고 이미지의 핵심 계층을 충족했다.
- 모바일 390×844 검증에서 문서 너비 375px, 섹션 너비 347px, 각 행 너비 311px로 가로 오버플로가 없음을 확인했다.

**Primary interactions tested**

- `커리어`: 디자이너 커리어와 승무원 커리어 전환 전자책 2권 노출.
- `개발 · 생산성`: Codex 전자책 1권 노출.
- `전체`: 세 권 전체 노출 구조 확인.
- 행 링크와 추천 배너 링크가 각 상세페이지로 연결됨.
- 브라우저 콘솔 오류: 없음.

final result: passed

---

## 랜딩페이지 가격 비노출 QA — 2026-07-21

- Change reference: `/var/folders/sb/cmz9v7xx5jn3xhtb61xgzx3m0000gn/T/TemporaryItems/NSIRD_screencaptureui_JUwWmS/스크린샷 2026-07-21 오후 2.01.47.png`
- Implementation screenshot: `/Users/hanwha/Documents/전자책/book/.artifacts/all-books-no-price.png`
- Combined comparison: `/Users/hanwha/Documents/전자책/book/.artifacts/all-books-no-price-comparison.jpg`
- Scope: 메인 랜딩의 `세 권의 실전 전자책` 카드 및 `전체 전자책` 목록

**Verification**

- 메인 랜딩 DOM에서 `19,000원` 노출 0건.
- 표지, 카테고리, 제목, 소개, 저자와 상세페이지 링크는 그대로 유지.
- 브라우저 콘솔 오류 0건.
- No actionable P0, P1, or P2 issues remain.

final result: passed
