import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("collection home connects all three ebook pages", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.match(source, /href: "\/codex"/);
  assert.match(source, /href: "\/career"/);
  assert.match(source, /href: "\/seonara"/);
  assert.match(source, /PHILIP BOOKS/);
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

test("Seo Nara book page includes career transition, commerce, and reviews", async () => {
  const source = await readFile(new URL("app/seonara/page.tsx", root), "utf8");
  assert.match(source, /승무원 다음은 IT였습니다/);
  assert.match(source, /프로젝트 운영 매니저/);
  assert.match(source, /Codex로 만든 HTML 대시보드/);
  assert.match(source, /product: "seonara"/);
});

test("review API only exposes approved verified reviews", async () => {
  const source = await readFile(new URL("app/api/reviews/route.ts", root), "utf8");
  assert.match(source, /eq\(reviews\.status, "approved"\)/);
  assert.match(source, /eq\(reviews\.purchaseVerified, 1\)/);
});
