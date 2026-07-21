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
  assert.match(header, /PHILIP BOOKS/);
  assert.match(source, /return books\.filter/);
  assert.doesNotMatch(source, /const curated|id="stories"|id="popular"/);
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
  assert.match(source, /email_verified !== true/);
  assert.match(source, /insert\(members\)/);
  assert.match(source, /httpOnly: true/);
  assert.match(source, /sameSite: "lax"/);
});

test("my page provides profile, order, logout, and account deletion flows", async () => {
  const page = await readFile(new URL("app/components/AccountDashboard.tsx", root), "utf8");
  const profileApi = await readFile(new URL("app/api/account/profile/route.ts", root), "utf8");
  assert.match(page, /구매 내역/);
  assert.match(page, /회원 탈퇴/);
  assert.match(profileApi, /export async function PATCH/);
  assert.match(profileApi, /export async function DELETE/);
  assert.match(profileApi, /status: "deleted"/);
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
  assert.match(footer, /217-26-12405/);
  assert.match(footer, /제 2020-서울구로-0138호/);
  assert.match(terms, /이용약관/);
  assert.match(privacy, /개인정보처리방침/);
  assert.match(refund, /구매일로부터 7일/);
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
  assert.match(callback, /detail\.merchantPayKey !== orderId/);
  assert.match(callback, /provider: "naverpay"/);
  assert.match(server, /payments\/v2\.2\/apply\/payment/);
  assert.match(server, /application\/x-www-form-urlencoded/);
});

test("direct payment refunds require an admin and revoke paid access", async () => {
  const refund = await readFile(new URL("app/api/admin/orders/refund/route.ts", root), "utf8");
  assert.match(refund, /admin\?\.isAdmin/);
  assert.match(refund, /cancelKakaoPay/);
  assert.match(refund, /cancelNaverPay/);
  assert.match(refund, /status: "refund_processing"/);
  assert.match(refund, /"refund_pending"/);
  assert.match(refund, /"refund_review"/);
});
