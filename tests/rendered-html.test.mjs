import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("collection home connects all three ebook pages", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.match(source, /href: "\/codex"/);
  assert.match(source, /href: "\/career"/);
  assert.match(source, /href: "\/jane"/);
  assert.match(source, /PHILIP BOOKS/);
  assert.match(source, /return books\.filter/);
  assert.doesNotMatch(source, /const curated|id="stories"|id="popular"/);
});

test("shared detail page includes commerce and verified buyer reviews", async () => {
  const source = await readFile(new URL("app/components/ClassDetailPage.tsx", root), "utf8");
  assert.match(source, /PurchaseButton product=\{book\.product\}/);
  assert.match(source, /ReviewSection product=\{book\.product\}/);
  assert.match(source, /detail-side-sticky/);
  assert.match(source, /detail-mobile-buy/);
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
