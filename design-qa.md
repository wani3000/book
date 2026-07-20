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
