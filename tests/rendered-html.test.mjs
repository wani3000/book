import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("collection home connects all three ebook pages", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  const header = await readFile(new URL("app/components/StorefrontHeader.tsx", root), "utf8");
  assert.match(source, /href: "\/codex"/);
  assert.match(source, /href: "\/career"/);
  assert.match(source, /href: "\/jane"/);
  assert.match(header, /DANIEL&amp;apos;S NOTE|DANIEL&apos;S NOTE/);
  assert.match(source, /return books\.filter/);
  assert.doesNotMatch(source, /const curated|id="stories"|id="popular"/);
});

test("production metadata never falls back to localhost", async () => {
  const layout = await readFile(new URL("app/layout.tsx", root), "utf8");
  assert.match(layout, /https:\/\/codex-solo-builder-book\.wani3000\.chatgpt\.site/);
  assert.doesNotMatch(layout, /const siteUrl = .*localhost/);
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
  assert.match(source, /product: "jane"/);
});

test("review API only exposes approved verified reviews", async () => {
  const source = await readFile(new URL("app/api/reviews/route.ts", root), "utf8");
  assert.match(source, /eq\(reviews\.status, "approved"\)/);
  assert.match(source, /eq\(reviews\.purchaseVerified, 1\)/);
  assert.match(source, /getAuthenticatedMember/);
});

test("review moderation is protected and only approves purchase-verified reviews", async () => {
  const source = await readFile(new URL("app/api/admin/reviews/route.ts", root), "utf8");
  const page = await readFile(new URL("app/components/ReviewAdmin.tsx", root), "utf8");
  assert.match(source, /member\?\.isAdmin/);
  assert.match(source, /purchaseVerified: action === "approve" \? 1 : 0/);
  assert.match(source, /status: action === "approve" \? "approved" : "rejected"/);
  assert.match(page, /구매 확인 후 공개/);
});

test("storefront does not publish fabricated ratings or sample reviews", async () => {
  const detail = await readFile(new URL("app/components/ClassDetailPage.tsx", root), "utf8");
  const reviews = await readFile(new URL("app/components/ReviewSection.tsx", root), "utf8");
  assert.doesNotMatch(detail, /후기 3개|4\.8/);
  assert.doesNotMatch(reviews, /sampleReviews|가상 독자/);
  assert.match(reviews, /아직 공개된 구매 후기가 없습니다/);
});

test("Google login persists a verified member and creates a secure session", async () => {
  const source = await readFile(new URL("app/api/auth/google/route.ts", root), "utf8");
  const account = await readFile(new URL("app/components/GoogleAccount.tsx", root), "utf8");
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
  assert.match(account, /continue_with/);
  assert.match(account, /size: mode === "login" \? "large"/);
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
  assert.match(start, /scope: "openid profile_nickname profile_image account_email"/);
  assert.match(callback, /url\.searchParams\.get\("state"\) !== oauth\.state/);
  assert.match(callback, /account_link_required/);
  assert.match(kakaoAuth, /createRemoteJWKSet/);
  assert.match(kakaoAuth, /payload\.nonce !== nonce/);
  assert.match(kakaoAuth, /is_email_verified !== true/);
  assert.match(pending, /termsAccepted !== true \|\| body\.privacyAccepted !== true/);
  assert.match(identitiesApi, /마지막 로그인 수단은 해제할 수 없습니다/);
  assert.match(kakaoUi, /카카오로 계속하기/);
  assert.match(schema, /authIdentities/);
  assert.match(migration, /legacy-google:/);
});

test("my page provides profile, order, logout, and account deletion flows", async () => {
  const page = await readFile(new URL("app/components/AccountDashboard.tsx", root), "utf8");
  const refundForm = await readFile(new URL("app/components/RefundRequestForm.tsx", root), "utf8");
  const profileApi = await readFile(new URL("app/api/account/profile/route.ts", root), "utf8");
  assert.match(page, /구매 내역/);
  assert.match(page, /누군가의 경험이/);
  assert.match(page, /account-login-header/);
  assert.match(page, /회원 탈퇴/);
  assert.match(page, /주문번호/);
  assert.match(page, /결제수단/);
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
  assert.match(libraryApi, /NextResponse\.redirect/);
  assert.match(dashboard, /PDF 읽기/);
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
