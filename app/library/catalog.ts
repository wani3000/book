export const ebookCatalog = {
  codex: {
    product: "codex",
    title: "ChatGPT Codex로 혼자 서비스 만들기",
    amount: 19000,
    assetPath: "/library-assets/codex-7461d974.pdf",
    filename: "chatgpt-codex-solo-service.pdf",
  },
  career: {
    product: "career",
    title: "커리어도 디자인할 수 있습니다",
    amount: 19000,
    assetPath: "/library-assets/career-4e8b1d67.pdf",
    filename: "career-design-philip.pdf",
  },
  jane: {
    product: "jane",
    title: "승무원 다음은 IT였습니다",
    amount: 19000,
    assetPath: "/library-assets/jane-23fded4f.pdf",
    filename: "flight-attendant-to-it-seonara.pdf",
  },
} as const;

export type EbookProduct = keyof typeof ebookCatalog;

export function isEbookProduct(value: string): value is EbookProduct {
  return value in ebookCatalog;
}

export function isTestPurchaser(email: string) {
  const configured = process.env.TEST_PURCHASER_EMAILS ?? "oxaz1234@gmail.com";
  return configured
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.trim().toLowerCase());
}

export function testPurchaserOrders() {
  const createdAt = "2026-07-20T00:00:00.000Z";
  return Object.values(ebookCatalog).map((book) => ({
    id: `test-${book.product}`,
    product: book.product,
    productTitle: book.title,
    amount: book.amount,
    currency: "KRW",
    status: "paid",
    createdAt,
    downloadUrl: `/api/library/${book.product}`,
    testEntitlement: true,
  }));
}
