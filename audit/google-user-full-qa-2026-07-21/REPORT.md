# PHILIP BOOKS production QA — 2026-07-21

Target: `https://codex-solo-builder-book.wani3000.chatgpt.site`

Build tested: local `main` at `b7d9ffb` and the currently published production site.

## Current verdict after fixes

- Automated production build and all 21 rendered-HTML tests pass.
- Public storefront, search, filters, three detail pages, policy pages, and mobile navigation work.
- The production site has no first-party console errors in the tested flows.
- Google sign-in reaches Google's account chooser, but the test account is signed out of Google and requires an interactive passkey confirmation. Signed-in revalidation is paused at that boundary.
- Payment buttons are intentionally disabled because KakaoPay and NaverPay have not been enabled, and now explain that merchant review must finish before sales open.
- Canonical, Open Graph, Twitter image, structured-data, and favicon URLs now resolve to the public HTTPS domain even if a stale local URL remains in the deployment environment.
- The sitemap no longer emits a false request-time `lastmod`, search reset removes stale `q`, privacy overseas-transfer information is published, and Codex PDF page 129 has been re-typeset.
- One launch input remains external: a real public customer-service telephone number must be supplied as `NEXT_PUBLIC_BUSINESS_PHONE` before live domestic payment review and sales.

## Findings and resolution

### Resolved P1 — Production metadata pointed to localhost

All public pages emit production metadata using `http://localhost:3001` as the base URL. This affects canonical links, Open Graph images, Twitter images, structured data, and favicon URLs.

Examples:

- `/` canonical: `http://localhost:3001/`
- `/codex` canonical: `http://localhost:3001/codex`
- `/career` canonical: `http://localhost:3001/career`
- `/jane` canonical: `http://localhost:3001/jane`

Likely cause: the deployed `NEXT_PUBLIC_SITE_URL` value is set to the local development URL. The metadata base is read in `app/layout.tsx`.

Resolution: `app/layout.tsx` now accepts only an HTTPS configured URL and otherwise falls back to the public production URL. Browser QA confirmed the canonical, OG image, and favicon on `/codex` use the public domain.

### Resolved P2 — Sitemap `lastmod` changed on every request

`/sitemap.xml` creates `lastmod` from `new Date()` for every request. Two requests two seconds apart returned different timestamps.

Resolution: unsupported `lastmod` values were removed. Repeated local requests now return identical XML.

### Resolved P2 — Clearing an empty search left the stale `q` URL

Reproduction:

1. Open `/?q=zzzz-no-result`.
2. Press **전체 전자책 보기**.
3. All books return, but the URL remains `?q=zzzz-no-result`.
4. Reload the page.
5. The empty result returns.

Resolution: reset now clears state and removes `q` with `history.replaceState`. Browser QA confirmed `/?q=zzzz-no-result` returns to `/` and restores all three books.

### Resolved P2 — Checkout had no visible unavailable-state explanation

All purchase buttons are disabled while payment providers are disabled, but the detail pages do not explain why purchase is unavailable or when it will open.

Resolution: disabled controls now read `간편결제 준비 중` and state that KakaoPay·NaverPay merchant review must finish before purchase opens.

### Partially resolved P2 — Legal/merchant launch information

- Privacy policy placeholders were replaced with provider, country, data category, purpose, timing/method, retention, and refusal-consequence information.
- Email and the existing public Kakao consultation channel are shown in the footer and policies.
- No customer-service telephone number is displayed because no verified public number exists in the repository. The environment hook is ready, but the owner must supply the actual number.

These items should be finalized before payment-provider review and public sales.

### Resolved P3 — Long Korean chapter title wrapped awkwardly in book 1

Codex PDF page 129 (printed page number 128) was re-typeset with a compact chapter-title style. The full title now fits on one line.

## Tested steps

1. Existing signed-in `/mypage` state — session and three test entitlements were visible before logout.
2. Logout — passed; `/mypage` changed to the signed-out login view.
3. Google sign-in button — passed through site integration and opened the Google account chooser.
4. Google account selection — reached passkey confirmation; user action required.
5. Storefront desktop — passed; all three book covers and links rendered.
6. Search with `승무원` — passed; only the Jane book remained.
7. Search from a detail page — passed; navigated to `/?q=승무원`.
8. Empty search — empty state rendered; reset URL persistence issue recorded above.
9. Category filters — passed: career shows two books, development/productivity shows Codex only.
10. Three detail pages — passed structurally and visually; full content is expanded without accordion controls.
11. Purchase state — disabled as configured; no live payment attempted.
12. Terms, privacy, and refund pages — passed route and content checks; launch information gaps noted above.
13. Protected PDFs while signed out — all three `/api/library/*` routes returned `401` and did not expose files.
14. Admin/account APIs while signed out — admin routes returned `403`; member routes returned `401`.
15. Mobile 390×844 DOM/reflow — passed with no horizontal overflow on home, Codex detail, and login page.
16. Mobile menu — open, three-book navigation, and close states passed.
17. Browser logs — no first-party errors; Chrome-extension warnings were excluded.
18. SEO routes — `robots.txt` and `sitemap.xml` return `200`; metadata issues recorded above.
19. PDF integrity — public files match source PDFs byte-for-byte.
20. PDF metadata — Codex 258 pages/필립, Career 64 pages/필립, Jane 56 pages/제인.
21. PDF visual sample — cover, middle, and final pages rendered for all three books; no clipping, missing fonts, or broken images in the sampled pages.
22. Public-name scan — no `박철완` or `서나라` text found in the three public PDFs.

## Evidence

The account screenshots below remain local QA evidence and are intentionally excluded from the public repository because they may contain account information. The PDF typography screenshot is versioned at `audit/pdf-qa/codex-page-129.png`.

- `01-mypage-current.png` — signed-in test-account state before logout
- `02-login-page.png` — signed-out Google login screen
- `03-home-desktop.png` — desktop storefront
- `04-codex-detail.png` — book 1 detail
- `05-career-detail.png` — book 2 detail
- `06-jane-detail.png` — book 3 detail
- `07-refund-policy.png` — refund policy
- `tmp/pdfs/qa-2026-07-21/` — rendered PDF sample pages and extracted text

Mobile screenshot capture was unavailable in the in-app browser during this run; mobile checks are based on the live 390×844 DOM, computed viewport widths, interaction state, and horizontal-overflow measurements. This does not constitute a full visual or WCAG audit.

## Remaining signed-in checks

After completing the Google passkey confirmation:

- Reload `/mypage` and confirm the latest account UI.
- Verify `#overview`, `#orders`, and `#profile`, including browser back/forward.
- Open all three protected PDF routes from the order list.
- Confirm profile form validation and save feedback with a reversible no-op value.
- Confirm marketing-consent state persists after refresh.
- Open admin member/review pages and verify data loading without changing member or review state.
- Open account deletion only to the confirmation boundary; do not confirm deletion.
- Recheck first-party console errors after each signed-in route.
