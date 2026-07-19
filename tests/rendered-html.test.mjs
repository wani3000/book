import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Codex book page includes commerce and verified buyer reviews", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.match(source, /PurchaseButton product="codex"/);
  assert.match(source, /ReviewSection product="codex"/);
  assert.match(source, /PHILIP BOOKS/);
});

test("career book page includes its sales content and reviews", async () => {
  const source = await readFile(new URL("app/career/page.tsx", root), "utf8");
  assert.match(source, /커리어도 디자인할 수 있습니다/);
  assert.match(source, /모바일 청첩장/);
  assert.match(source, /AI를 썼다는 말보다/);
  assert.match(source, /ReviewSection product="career"/);
});

test("Seo Nara book page includes career transition, commerce, and reviews", async () => {
  const source = await readFile(new URL("app/seonara/page.tsx", root), "utf8");
  assert.match(source, /승무원 다음은 IT였습니다/);
  assert.match(source, /프로젝트 운영 매니저/);
  assert.match(source, /Codex로 직접 만들었습니다/);
  assert.match(source, /PurchaseButton product="seonara"/);
  assert.match(source, /ReviewSection product="seonara"/);
});

test("review API only exposes approved verified reviews", async () => {
  const source = await readFile(new URL("app/api/reviews/route.ts", root), "utf8");
  assert.match(source, /eq\(reviews\.status, "approved"\)/);
  assert.match(source, /eq\(reviews\.purchaseVerified, 1\)/);
});
