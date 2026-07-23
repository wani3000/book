import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("collection home connects all three ebook pages", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  const header = await readFile(new URL("app/components/StorefrontHeader.tsx", root), "utf8");
  assert.match(source, /href: "\/codex"/);
  assert.match(source, /href: "\/career"/);
  assert.match(source, /href: "\/jane"/);
  assert.match(header, /다니엘의 노트/);
  assert.match(source, /return books\.filter/);
  assert.doesNotMatch(source, /const curated|id="stories"|id="popular"/);
});

test("mobile menu uses the three storefront categories", async () => {
  const menu = await readFile(new URL("app/components/MobileBookMenu.tsx", root), "utf8");
  assert.match(menu, /label: "전체"/);
  assert.match(menu, /label: "커리어"/);
  assert.match(menu, /label: "개발 · 생산성"/);
  assert.doesNotMatch(menu, /menuBooks|전체 전자책 보기/);
});

test("production metadata never falls back to localhost", async () => {
  const layout = await readFile(new URL("app/layout.tsx", root), "utf8");
  assert.match(layout, /https:\/\/danielsnote\.com/);
  assert.doesNotMatch(layout, /const siteUrl = .*localhost/);
});

test("web typography keeps readable minimums without changing the business footer", async () => {
  const layout = await readFile(new URL("app/layout.tsx", root), "utf8");
  const designSystem = await readFile(new URL("app/design-system.css", root), "utf8");
  const typography = await readFile(new URL("app/typography-system.css", root), "utf8");
  assert.match(layout, /import "\.\/typography-system\.css"/);
  assert.match(typography, /--web-type-min: 14px/);
  assert.match(typography, /--web-type-min-mobile: 15px/);
  assert.match(typography, /--web-type-body: 16px/);
  assert.match(designSystem, /--type-button: 13px/);
  assert.match(designSystem, /--type-button-weight: 400/);
  assert.match(typography, /font-size: var\(--type-button\) !important/);
  assert.match(typography, /font-weight: var\(--type-button-weight\) !important/);
  assert.match(typography, /font-weight: 700/);
  assert.match(typography, /\.refund-request-form \.refund-confirm[\s\S]*font-weight: 400/);
  assert.doesNotMatch(typography, /\.business-footer/);
});

test("storefront reset clears the stale search query from the URL", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.match(source, /url\.searchParams\.delete\("q"\)/);
  assert.match(source, /window\.history\.replaceState/);
  assert.match(source, /onClick=\{resetDiscovery\}/);
});

test("sitemap does not claim every page changed on every request", async () => {
  const source = await readFile(new URL("app/sitemap.xml/route.ts", root), "utf8");
  assert.doesNotMatch(source, /new Date|<lastmod>/);
});

test("shared detail page includes commerce and verified buyer reviews", async () => {
  const source = await readFile(new URL("app/components/ClassDetailPage.tsx", root), "utf8");
  const reviewSource = await readFile(new URL("app/components/ReviewSection.tsx", root), "utf8");
  assert.match(source, /PurchaseButton product=\{book\.product\}/);
  assert.match(source, /ReviewSection product=\{book\.product\}/);
  assert.match(source, /detail-side-sticky/);
  assert.match(source, /detail-mobile-buy/);
  assert.doesNotMatch(source, /<details|<summary/);
  assert.doesNotMatch(reviewSource, /<details|<summary/);
});

test("Codex book page supplies its detail sales content", async () => {
  const source = await readFile(new URL("app/codex/page.tsx", root), "utf8");
  assert.match(source, /product: "codex"/);
  assert.match(source, /개발자를 기다리지 않고/);
  assert.match(source, /마리에카드·아파트구구/);
});

test("career book page includes its sales content and reviews", async () => {
  const source = await readFile(new URL("app/career/page.tsx", root), "utf8");
  assert.match(source, /커리어도 디자인할 수 있습니다/);
  assert.match(source, /모바일 청첩장/);
  assert.match(source, /AI로 실행력을 증명하기/);
  assert.match(source, /product: "career"/);
});

test("Jane book page includes career transition, commerce, and reviews", async () => {
  const source = await readFile(new URL("app/jane/page.tsx", root), "utf8");
  assert.match(source, /승무원 다음은 IT였습니다/);
  assert.match(source, /프로젝트 운영 매니저/);
  assert.match(source, /Codex로 만든 HTML 대시보드/);
  assert.match(source, /pages: "48쪽"/);
  assert.match(source, /22개 장 \+ 통합 실습팩/);
  assert.doesNotMatch(source, /78쪽/);
  assert.match(source, /product: "jane"/);
});

test("all three sales pages match the current PDF editions", async () => {
  const codex = await readFile(new URL("app/codex/page.tsx", root), "utf8");
  const career = await readFile(new URL("app/career/page.tsx", root), "utf8");
  const jane = await readFile(new URL("app/jane/page.tsx", root), "utf8");
  assert.match(codex, /pages: "230쪽"/);
  assert.match(codex, /50단계 실전 \+ 경험편 24장/);
  assert.match(career, /pages: "90쪽"/);
  assert.match(career, /20개 장 \+ 통합 별첨/);
  assert.match(jane, /pages: "48쪽"/);
  assert.match(jane, /22개 장 \+ 통합 실습팩/);
});

test("review API only exposes approved verified reviews", async () => {
  const source = await readFile(new URL("app/api/reviews/route.ts", root), "utf8");
  assert.match(source, /eq\(reviews\.status, "approved"\)/);
  assert.match(source, /eq\(reviews\.purchaseVerified, 1\)/);
  assert.match(source, /getAuthenticatedMember/);
  assert.match(source, /eq\(orders\.memberId, member\.id\)/);
  assert.match(source, /구매한 전자책에만 후기를 작성할 수 있습니다/);
});

test("review moderation is protected and only approves purchase-verified reviews", async () => {
  const source = await readFile(new URL("app/api/admin/reviews/route.ts", root), "utf8");
  const page = await readFile(new URL("app/components/ReviewAdmin.tsx", root), "utf8");
  assert.match(source, /member\?\.isAdmin/);
  assert.match(source, /purchaseVerified: 1/);
  assert.match(source, /status: action === "approve" \? "approved" : "rejected"/);
  assert.match(page, /구매 확인 후 공개/);
});

test("storefront separates verified reviews from clearly disclosed reference reviews", async () => {
  const detail = await readFile(new URL("app/components/ClassDetailPage.tsx", root), "utf8");
  const reviews = await readFile(new URL("app/components/ReviewSection.tsx", root), "utf8");
  assert.doesNotMatch(detail, /후기 3개|4\.8/);
  assert.match(reviews, /아직 공개된 구매 후기가 없습니다/);
  assert.match(reviews, /실제 구매자의 후기가 아닙니다/);
  assert.doesNotMatch(reviews, /예시 후기/);
  assert.match(reviews, /className="sample-badge">참고용/);
  assert.match(reviews, /const \[canSubmitReview, setCanSubmitReview\] = useState\(false\)/);
  assert.match(reviews, /fetch\("\/api\/account\/orders"/);
  assert.match(reviews, /\{canSubmitReview && <section className="review-form-shell"/);
  assert.match(reviews, /codex: \[/);
  assert.match(reviews, /career: \[/);
  assert.match(reviews, /jane: \[/);
});

test("Google login persists a verified member and creates a secure session", async () => {
  const source = await readFile(new URL("app/api/auth/google/route.ts", root), "utf8");
  const account = await readFile(new URL("app/components/GoogleAccount.tsx", root), "utf8");
  const oauth = await readFile(new URL("app/auth/google.ts", root), "utf8");
  const start = await readFile(new URL("app/api/auth/google/start/route.ts", root), "utf8");
  const callback = await readFile(new URL("app/api/auth/google/callback/route.ts", root), "utf8");
  const pending = await readFile(new URL("app/api/auth/google/pending/route.ts", root), "utf8");
  const identity = await readFile(new URL("app/components/GoogleIdentity.tsx", root), "utf8");
  const styles = await readFile(new URL("app/globals.css", root), "utf8");
  assert.match(source, /email_verified !== true/);
  assert.match(source, /insert\(members\)/);
  assert.match(source, /httpOnly: true/);
  assert.match(source, /sameSite: "lax"/);
  assert.match(source, /SIGNUP_CONSENT_REQUIRED/);
  assert.match(source, /ACCOUNT_REACTIVATION_REQUIRED/);
  assert.match(source, /existing\?\.status === "deleted" && !reactivate/);
  assert.match(source, /reactivatedAt: existing\?\.status === "deleted" \? now/);
  assert.match(account, /\[필수\] 이용약관 동의/);
  assert.match(account, /\[선택\] 새 책과 할인 소식 받기/);
  assert.match(account, /동의하고 재가입하기/);
  assert.match(account, /className="google-login-button auth-login-button"/);
  assert.match(account, /Google로 계속하기/);
  assert.doesNotMatch(account, /renderButton|iframe|accounts\.google\.com\/gsi\/client/);
  assert.doesNotMatch(identity, /renderButton|iframe|accounts\.google\.com\/gsi\/client/);
  assert.match(oauth, /GOOGLE_CLIENT_SECRET/);
  assert.match(oauth, /code_verifier: verifier/);
  assert.match(oauth, /payload\.nonce !== nonce/);
  assert.match(start, /code_challenge_method: "S256"/);
  assert.match(start, /scope: "openid email profile"/);
  assert.match(callback, /url\.searchParams\.get\("state"\) !== oauth\.state/);
  assert.match(callback, /google_account_link_required/);
  assert.match(pending, /body\.termsAccepted !== true \|\| body\.privacyAccepted !== true/);
  assert.match(styles, /\.auth-login-button \{ width:100%; height:56px/);
  assert.match(styles, /font-size:15px; font-weight:500; line-height:20px/);
  assert.match(account, /mode === "compact"\) return <Link className="google-account-login-link" href="\/mypage">로그인<\/Link>/);
  assert.match(account, /className="google-account-profile-link" href="\/mypage"/);
  assert.match(account, /님의 마이페이지로 이동/);
  assert.match(account, /mode === "icon"/);
  assert.match(account, /className="header-user-icon" href="\/mypage"/);
});

test("QA admin login is secret-gated, production-disabled by default, and creates the normal secure session", async () => {
  const gate = await readFile(new URL("app/auth/qa.ts", root), "utf8");
  const route = await readFile(new URL("app/api/auth/qa-login/route.ts", root), "utf8");
  const page = await readFile(new URL("app/qa-login/page.tsx", root), "utf8");
  assert.match(gate, /QA_LOGIN_ENABLED/);
  assert.match(gate, /QA_LOGIN_ALLOW_PRODUCTION/);
  assert.match(gate, /password\.length >= 24/);
  assert.match(gate, /crypto\.subtle\.digest/);
  assert.match(route, /qaAdminCredentials/);
  assert.match(route, /role: "admin"/);
  assert.match(route, /createSessionToken/);
  assert.match(route, /httpOnly: true/);
  assert.match(route, /sameSite: "lax"/);
  assert.match(route, /Cache-Control": "no-store"/);
  assert.match(page, /robots: \{ index: false, follow: false, nocache: true \}/);
  assert.doesNotMatch(route, /oxaz1234@gmail\.com/);
});

test("Kakao login uses OIDC, PKCE, explicit consent, and provider-safe account linking", async () => {
  const start = await readFile(new URL("app/api/auth/kakao/start/route.ts", root), "utf8");
  const callback = await readFile(new URL("app/api/auth/kakao/callback/route.ts", root), "utf8");
  const pending = await readFile(new URL("app/api/auth/kakao/pending/route.ts", root), "utf8");
  const identitiesApi = await readFile(new URL("app/api/auth/identities/route.ts", root), "utf8");
  const kakaoAuth = await readFile(new URL("app/auth/kakao.ts", root), "utf8");
  const kakaoUi = await readFile(new URL("app/components/KakaoAccount.tsx", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  const migration = await readFile(new URL("drizzle/0007_icy_silver_surfer.sql", root), "utf8");
  assert.match(start, /code_challenge_method: "S256"/);
  assert.match(start, /scope: "openid profile_nickname profile_image"/);
  assert.match(callback, /url\.searchParams\.get\("state"\) !== oauth\.state/);
  assert.match(callback, /account_link_required/);
  assert.match(kakaoAuth, /createRemoteJWKSet/);
  assert.match(kakaoAuth, /payload\.nonce !== nonce/);
  assert.match(kakaoAuth, /fallbackKakaoEmail/);
  assert.match(kakaoAuth, /export function kakaoLoginEnabled\(\)/);
  assert.match(kakaoAuth, /process\.env\.KAKAO_REST_API_KEY\?\.trim\(\)/);
  assert.match(kakaoAuth, /process\.env\.KAKAO_CLIENT_SECRET\?\.trim\(\)/);
  assert.match(pending, /termsAccepted !== true \|\| body\.privacyAccepted !== true/);
  assert.match(identitiesApi, /마지막 로그인 수단은 해제할 수 없습니다/);
  assert.match(kakaoUi, /카카오로 계속하기/);
  assert.match(kakaoUi, /카카오 로그인 준비 중/);
  assert.match(schema, /authIdentities/);
  assert.match(migration, /legacy-google:/);
});

test("my page provides profile, order, logout, and account deletion flows", async () => {
  const page = await readFile(new URL("app/components/AccountDashboard.tsx", root), "utf8");
  const shell = await readFile(new URL("app/mypage/page.tsx", root), "utf8");
  const refundForm = await readFile(new URL("app/components/RefundRequestForm.tsx", root), "utf8");
  const profileApi = await readFile(new URL("app/api/account/profile/route.ts", root), "utf8");
  assert.match(page, /구매 내역/);
  assert.match(page, /누군가의 경험이/);
  assert.match(page, /account-login-header/);
  assert.match(page, /회원 탈퇴/);
  assert.match(page, /주문번호/);
  assert.match(page, /결제수단/);
  assert.match(page, /section === "overview" \? <aside className="mypage-sidebar">/);
  assert.match(page, /href="\/mypage\/library"/);
  assert.match(page, /"마이페이지로 돌아가기"/);
  assert.match(page, /section === "library"/);
  assert.match(page, /href="\/mypage\/profile">프로필 관리<\/Link>/);
  assert.match(page, /className="mypage-profile-sections"/);
  assert.doesNotMatch(page, /<p>LOGIN<\/p>|<p>SESSION<\/p>/);
  assert.match(page, /function MyPageHeader/);
  assert.match(page, /window\.location\.assign\(fallbackHref\)/);
  assert.match(page, /window\.scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/);
  assert.doesNotMatch(page, /window\.history\.pushState\(null, "", `#\$\{section\}`\)/);
  assert.match(page, /const \[ordersLoading, setOrdersLoading\] = useState\(true\)/);
  assert.match(page, /const orderRequest = fetch\("\/api\/account\/orders"/);
  assert.match(page, /setMember\(profile\.member\);[\s\S]*setLoading\(false\);[\s\S]*await orderRequest/);
  assert.match(page, /section === "overview" \? "\/" : "\/mypage"/);
  assert.doesNotMatch(shell, /StorefrontHeader/);
  assert.match(page, /deleteConfirmation !== "회원 탈퇴"/);
  assert.match(profileApi, /export async function PATCH/);
  assert.match(profileApi, /export async function DELETE/);
  assert.match(profileApi, /status: "deleted"/);
  assert.match(profileApi, /inArray\(refundRequests\.status, \["requested", "reviewing"\]\)/);
  assert.match(profileApi, /acknowledged !== true/);
  assert.match(refundForm, /환불 신청하기/);
  assert.match(refundForm, /환불 신청 완료/);
  assert.match(refundForm, /환불 검토 중/);
  assert.match(refundForm, /환불 완료/);
  assert.match(refundForm, /환불 불가/);
});

test("Kakao-only accounts never expose the internal fallback email in the interface", async () => {
  const dashboard = await readFile(new URL("app/components/AccountDashboard.tsx", root), "utf8");
  const pendingApi = await readFile(new URL("app/api/auth/kakao/pending/route.ts", root), "utf8");
  const kakaoUi = await readFile(new URL("app/components/KakaoAccount.tsx", root), "utf8");
  assert.match(dashboard, /@daniels-note\.kakao\.local/);
  assert.match(dashboard, /카카오 계정으로 로그인/);
  assert.match(dashboard, /카카오가 이메일을 제공하지 않아 계정 종류만 표시합니다/);
  assert.match(dashboard, /disabled=\{!hasCustomerEmail\}/);
  assert.match(pendingApi, /emailAvailable: !pending\.email\.endsWith/);
  assert.match(pendingApi, /const marketingConsent = !pending\.email\.endsWith/);
  assert.match(kakaoUi, /카카오에서 이메일을 제공하지 않아 이메일 소식 수신 항목은 표시하지 않습니다/);
});

test("the Korean service name and production security headers are applied consistently", async () => {
  const files = await Promise.all([
    readFile(new URL("app/components/PolicyPage.tsx", root), "utf8"),
    readFile(new URL("app/components/AccountDashboard.tsx", root), "utf8"),
    readFile(new URL("app/admin/members/page.tsx", root), "utf8"),
    readFile(new URL("app/admin/reviews/page.tsx", root), "utf8"),
    readFile(new URL("app/admin/refunds/page.tsx", root), "utf8"),
    readFile(new URL("app/admin/payments/page.tsx", root), "utf8"),
  ]);
  for (const source of files) {
    assert.doesNotMatch(source, /DANIEL(?:&apos;|')?S NOTE/);
  }
  const worker = await readFile(new URL("worker/index.ts", root), "utf8");
  for (const header of ["Content-Security-Policy", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) {
    assert.match(worker, new RegExp(header));
  }
});

test("mobile account and policy body copy keeps a 15px minimum outside the footer", async () => {
  const css = await readFile(new URL("app/globals.css", root), "utf8");
  assert.match(css, /Mobile body copy stays at 15px or larger/);
  assert.match(css, /\.account-site \.order-meta[\s\S]*\.policy-site \.policy-document li[\s\S]*font-size:15px/);
});

test("account guide and schema document consent, deletion, and explicit reactivation", async () => {
  const guide = await readFile(new URL("app/account-guide/page.tsx", root), "utf8");
  const privacy = await readFile(new URL("app/privacy/page.tsx", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  const migration = await readFile(new URL("drizzle/0006_typical_metal_master.sql", root), "utf8");
  assert.match(guide, /회원가입과 로그인/);
  assert.match(guide, /자동 복구하지 않고/);
  assert.match(privacy, /동의 일시와 버전/);
  assert.match(schema, /termsAcceptedAt/);
  assert.match(schema, /privacyAcceptedAt/);
  assert.match(schema, /reactivatedAt/);
  assert.match(migration, /terms_accepted_at/);
  assert.match(migration, /reactivated_at/);
});

test("test purchaser receives all three protected PDF entitlements", async () => {
  const catalog = await readFile(new URL("app/library/catalog.ts", root), "utf8");
  const libraryApi = await readFile(new URL("app/api/library/[product]/route.ts", root), "utf8");
  const dashboard = await readFile(new URL("app/components/AccountDashboard.tsx", root), "utf8");
  assert.match(catalog, /oxaz1234@gmail\.com/);
  assert.match(catalog, /Object\.values\(ebookCatalog\)/);
  assert.match(libraryApi, /getAuthenticatedMember/);
  assert.match(libraryApi, /isTestPurchaser\(member\.email\)/);
  assert.match(libraryApi, /eq\(orders\.status, "paid"\)/);
  assert.match(libraryApi, /isNull\(orders\.firstAccessedAt\)/);
  assert.match(libraryApi, /firstAccessedAt: new Date\(\)\.toISOString\(\)/);
  assert.match(catalog, /objectKey: "ebooks\//);
  assert.doesNotMatch(catalog, /assetPath|library-assets/);
  assert.match(libraryApi, /env\.BOOKS\.get\(book\.objectKey\)/);
  assert.match(libraryApi, /"Cache-Control": "private, no-store, max-age=0"/);
  assert.doesNotMatch(libraryApi, /NextResponse\.redirect/);
  assert.match(dashboard, /PDF 읽기/);
  for (const filename of ["codex-7461d974.pdf", "career-4e8b1d67.pdf", "jane-fc5efcfd.pdf"]) {
    await assert.rejects(access(new URL(`public/library-assets/${filename}`, root)));
  }
});

test("admin member management is protected server-side", async () => {
  const source = await readFile(new URL("app/api/admin/members/route.ts", root), "utf8");
  assert.match(source, /requireAdmin/);
  assert.match(source, /member\?\.isAdmin/);
  assert.match(source, /"active", "suspended"/);
});

test("purchase flow requires a signed-in member", async () => {
  const source = await readFile(new URL("app/components/PurchaseButton.tsx", root), "utf8");
  assert.match(source, /fetch\("\/api\/checkout\/context"/);
  assert.match(source, /window\.location\.href = `\/mypage/);
  assert.match(source, /customData: \{ entitlement: context\.entitlement \}/);
  assert.match(source, /간편결제 준비 중/);
  assert.match(source, /가맹 심사가 끝나면 구매가 열립니다/);
});

test("Paddle webhook creates paid orders and revokes access after full refunds", async () => {
  const webhook = await readFile(new URL("app/api/paddle/webhook/route.ts", root), "utf8");
  assert.match(webhook, /webhooks\.unmarshal\(rawBody, secret, signature\)/);
  assert.match(webhook, /EventName\.TransactionCompleted/);
  assert.match(webhook, /verifyPurchaseEntitlement/);
  assert.match(webhook, /onConflictDoUpdate/);
  assert.match(webhook, /EventName\.AdjustmentUpdated/);
  assert.match(webhook, /status: event\.data\.action === "chargeback" \? "chargeback" : "refunded"/);
});

test("KakaoPay direct checkout verifies the signed-in buyer and approved amount", async () => {
  const button = await readFile(new URL("app/components/PurchaseButton.tsx", root), "utf8");
  const ready = await readFile(new URL("app/api/kakaopay/ready/route.ts", root), "utf8");
  const approve = await readFile(new URL("app/api/kakaopay/approve/route.ts", root), "utf8");
  assert.match(button, /fetch\(`\/api\/\$\{provider\}\/ready`/);
  assert.match(button, /beginPurchase\("kakaopay"\)/);
  assert.match(ready, /getAuthenticatedMember/);
  assert.match(ready, /paymentAttempts/);
  assert.match(approve, /approved\.amount\?\.total !== book\.amount/);
  assert.match(approve, /provider: "kakaopay"/);
  assert.match(approve, /status: "paid"/);
});

test("merchant review pages disclose seller, privacy, and refund rules", async () => {
  const footer = await readFile(new URL("app/components/BusinessFooter.tsx", root), "utf8");
  const terms = await readFile(new URL("app/terms/page.tsx", root), "utf8");
  const privacy = await readFile(new URL("app/privacy/page.tsx", root), "utf8");
  const refund = await readFile(new URL("app/refund/page.tsx", root), "utf8");
  const payment = await readFile(new URL("app/payment/page.tsx", root), "utf8");
  assert.match(footer, /217-26-12405/);
  assert.match(footer, /제 2020-서울구로-0138호/);
  assert.match(footer, /서울특별시 구로구 고척로 49/);
  assert.doesNotMatch(footer, /고척로 49,/);
  assert.doesNotMatch(terms, /고척로 49,/);
  assert.match(terms, /이용약관/);
  assert.match(privacy, /개인정보처리방침/);
  assert.match(privacy, /개인정보의 국외 이전/);
  assert.doesNotMatch(privacy, /실제 운영 설정 확정 후/);
  assert.match(refund, /구매일로부터 7일/);
  assert.match(footer, /카카오톡 상담/);
  assert.match(footer, /결제·이용 안내/);
  assert.match(payment, /PDF 전자책 3종/);
  assert.match(payment, /별도의 배송은 없습니다/);
});

test("NaverPay checkout creates a member order and verifies approval details", async () => {
  const button = await readFile(new URL("app/components/PurchaseButton.tsx", root), "utf8");
  const ready = await readFile(new URL("app/api/naverpay/ready/route.ts", root), "utf8");
  const callback = await readFile(new URL("app/api/naverpay/return/route.ts", root), "utf8");
  const server = await readFile(new URL("app/naverpay/server.ts", root), "utf8");
  assert.match(button, /\/api\/\$\{provider\}\/ready/);
  assert.match(button, /Naver\.Pay\.create/);
  assert.match(ready, /getAuthenticatedMember/);
  assert.match(ready, /provider: "naverpay"/);
  assert.match(callback, /detail\?\.totalPayAmount !== book\.amount/);
  assert.match(callback, /detail\?\.merchantPayKey !== orderId/);
  assert.match(callback, /provider: "naverpay"/);
  assert.match(server, /payments\/v2\.2\/apply\/payment/);
  assert.match(server, /application\/x-www-form-urlencoded/);
  assert.match(server, /pay\.paygate\.naver\.com/);
  assert.match(server, /X-NaverPay-Idempotency-Key/);
  assert.match(server, /expectedRestAmount/);
  assert.doesNotMatch(server, /NAVERPAY_PARTNER_ID/);
});

test("direct checkout stores consent version and blocks repeat ownership", async () => {
  const kakaoReady = await readFile(new URL("app/api/kakaopay/ready/route.ts", root), "utf8");
  const naverReady = await readFile(new URL("app/api/naverpay/ready/route.ts", root), "utf8");
  const button = await readFile(new URL("app/components/PurchaseButton.tsx", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  for (const source of [kakaoReady, naverReady]) {
    assert.match(source, /hasPaidOrder/);
    assert.match(source, /contentProvisionConsentVersion/);
    assert.match(source, /status: 409/);
  }
  assert.match(button, /purchase-consent/);
  assert.match(button, /disabled=\{loading \|\| !consented\}/);
  assert.match(schema, /contentProvisionConsentVersion/);
});

test("admin can reconcile provider payment state and recover an order", async () => {
  const api = await readFile(new URL("app/api/admin/payments/route.ts", root), "utf8");
  const page = await readFile(new URL("app/components/PaymentAdmin.tsx", root), "utf8");
  assert.match(api, /member\?\.isAdmin/);
  assert.match(api, /getKakaoPayOrder/);
  assert.match(api, /getNaverPayHistory/);
  assert.match(api, /onConflictDoNothing/);
  assert.match(api, /status: "paid"/);
  assert.match(api, /status: "refunded"/);
  assert.match(page, /결제 상태 확인·복구/);
});

test("direct payment refunds require an admin and revoke paid access", async () => {
  const endpoint = await readFile(new URL("app/api/admin/orders/refund/route.ts", root), "utf8");
  const processor = await readFile(new URL("app/refunds/process.ts", root), "utf8");
  assert.match(endpoint, /admin\?\.isAdmin/);
  assert.match(endpoint, /processPaidOrderRefund/);
  assert.match(processor, /cancelKakaoPay/);
  assert.match(processor, /cancelNaverPay/);
  assert.match(processor, /status: "refund_processing"/);
  assert.match(processor, /"refund_pending"/);
  assert.match(processor, /"refund_review"/);
  assert.match(processor, /reconcileRefundOrder/);
  assert.match(processor, /getNaverPayHistory/);
  assert.match(processor, /getKakaoPayOrder/);
});

test("customer refund requests enforce ownership, policy confirmation, and first-access limits", async () => {
  const source = await readFile(new URL("app/api/account/refunds/route.ts", root), "utf8");
  assert.match(source, /getAuthenticatedMember/);
  assert.match(source, /eq\(orders\.memberId, member\.id\)/);
  assert.match(source, /body\.policyConfirmed !== true/);
  assert.match(source, /!order\.firstAccessedAt/);
  assert.match(source, /reasonCode === "change_of_mind"/);
  assert.match(source, /status: "requested"/);
});

test("admin refund workflow supports review, rejection, and payment cancellation approval", async () => {
  const source = await readFile(new URL("app/api/admin/refunds/route.ts", root), "utf8");
  const page = await readFile(new URL("app/components/RefundAdmin.tsx", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  const migration = await readFile(new URL("drizzle/0004_wonderful_tenebrous.sql", root), "utf8");
  assert.match(source, /member\?\.isAdmin/);
  assert.match(source, /\["review", "approve", "reject", "reconcile"\]/);
  assert.match(source, /processPaidOrderRefund/);
  assert.match(source, /status: "rejected"/);
  assert.match(page, /승인·결제 취소/);
  assert.match(page, /환불 불가/);
  assert.match(page, /결제 상태 확인/);
  assert.match(schema, /refundRequests = sqliteTable/);
  assert.match(schema, /firstAccessedAt: text/);
  assert.match(migration, /CREATE TABLE `refund_requests`/);
  assert.match(migration, /ADD `first_accessed_at`/);
});

test("mypage uses independent routes instead of hash navigation", async () => {
  const dashboard = await readFile(new URL("app/components/AccountDashboard.tsx", root), "utf8");
  for (const path of ["library", "orders", "profile"]) {
    await readFile(new URL(`app/mypage/${path}/page.tsx`, root), "utf8");
    assert.match(dashboard, new RegExp(`/mypage/${path}`));
  }
  assert.doesNotMatch(dashboard, /hashchange|window\.location\.hash|href="#orders"/);
});

test("reviews are automatically tied to a paid order and limited to one per product", async () => {
  const api = await readFile(new URL("app/api/reviews/route.ts", root), "utf8");
  const form = await readFile(new URL("app/components/ReviewSection.tsx", root), "utf8");
  const migration = await readFile(new URL("drizzle/0008_prelaunch_p1.sql", root), "utf8");
  assert.match(api, /eq\(orders\.memberId, member\.id\)/);
  assert.match(api, /purchaseReference: paidOrder\?\.providerReference/);
  assert.match(api, /purchaseVerified: 1/);
  assert.doesNotMatch(form, /name="purchaseReference"/);
  assert.match(migration, /reviews_member_product_unique/);
});

test("P1 security, accessibility, health, audit, and notification controls exist", async () => {
  const worker = await readFile(new URL("worker/index.ts", root), "utf8");
  const layout = await readFile(new URL("app/layout.tsx", root), "utf8");
  const menu = await readFile(new URL("app/components/MobileBookMenu.tsx", root), "utf8");
  const home = await readFile(new URL("app/page.tsx", root), "utf8");
  const schema = await readFile(new URL("db/schema.ts", root), "utf8");
  const health = await readFile(new URL("app/api/health/route.ts", root), "utf8");
  const notices = await readFile(new URL("app/notifications/outbox.ts", root), "utf8");
  const kakaoApproval = await readFile(new URL("app/api/kakaopay/approve/route.ts", root), "utf8");
  const naverApproval = await readFile(new URL("app/api/naverpay/return/route.ts", root), "utf8");
  const refunds = await readFile(new URL("app/api/admin/refunds/route.ts", root), "utf8");
  await readFile(new URL("OPERATIONS_RUNBOOK.md", root), "utf8");
  assert.match(worker, /Strict-Transport-Security/);
  assert.match(worker, /Content-Security-Policy/);
  assert.match(worker, /request_limits/);
  assert.match(worker, /허용되지 않은 요청 출처/);
  assert.match(layout, /본문 바로가기/);
  assert.match(menu, /setAttribute\("inert"/);
  assert.match(menu, /event\.key !== "Tab"/);
  assert.match(home, /prefers-reduced-motion/);
  assert.match(home, /자동 전환 일시정지/);
  assert.match(schema, /auditLogs/);
  assert.match(schema, /notificationOutbox/);
  assert.match(health, /schema: "0008"/);
  assert.match(health, /authIdentities/);
  assert.match(health, /notificationOutbox/);
  assert.match(notices, /Transactional notice could not be recorded/);
  assert.match(kakaoApproval, /event: "payment\.completed"/);
  assert.match(naverApproval, /event: "payment\.completed"/);
  assert.match(refunds, /"refund\.completed"/);
  assert.match(refunds, /"refund\.rejected"/);
});

test("sensitive admin mutations require a recent login", async () => {
  const session = await readFile(new URL("app/auth/session.ts", root), "utf8");
  const member = await readFile(new URL("app/auth/member.ts", root), "utf8");
  const membersApi = await readFile(new URL("app/api/admin/members/route.ts", root), "utf8");
  const reviewsApi = await readFile(new URL("app/api/admin/reviews/route.ts", root), "utf8");
  const paymentsApi = await readFile(new URL("app/api/admin/payments/route.ts", root), "utf8");
  const refundsApi = await readFile(new URL("app/api/admin/refunds/route.ts", root), "utf8");
  const reauthentication = await readFile(new URL("app/components/adminReauthentication.ts", root), "utf8");
  assert.match(session, /authenticatedAt/);
  assert.match(member, /ADMIN_REAUTH_MAX_AGE_SECONDS = 30 \* 60/);
  for (const source of [membersApi, reviewsApi, paymentsApi, refundsApi]) {
    assert.match(source, /hasRecentAuthentication/);
    assert.match(source, /admin_reauthentication_required/);
  }
  assert.match(reauthentication, /api\/auth\/logout/);
  assert.match(reauthentication, /returnTo=/);
});

test("book detail pages expose Book, Product, Offer, and breadcrumb structured data", async () => {
  const source = await readFile(new URL("app/components/ClassDetailPage.tsx", root), "utf8");
  for (const type of ["Book", "Product", "Offer", "BreadcrumbList"]) assert.match(source, new RegExp(`\\"@type\\": \\"${type}\\"`));
  assert.match(source, /application\/ld\+json/);
});
