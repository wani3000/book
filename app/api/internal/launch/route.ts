import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { ebookCatalog, isEbookProduct } from "@/app/library/catalog";

export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const configured = process.env.LAUNCH_MIGRATION_TOKEN?.trim();
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return Boolean(configured && supplied && configured === supplied);
}

function unavailable() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function GET(request: Request) {
  if (!authorized(request)) return unavailable();
  const action = new URL(request.url).searchParams.get("action");
  if (action === "status") {
    const objects = await Promise.all(Object.values(ebookCatalog).map(async (book) => {
      const object = await env.BOOKS.head(book.objectKey);
      return { product: book.product, present: Boolean(object), size: object?.size ?? 0 };
    }));
    const schema = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all<{ name: string }>();
    return NextResponse.json({ objects, tables: schema.results.map((row) => row.name) });
  }
  if (action === "backup") {
    const applicationTables = ["members", "auth_identities", "orders", "payment_attempts", "refund_requests", "reviews", "audit_logs", "request_limits", "notification_outbox"];
    const backup: Record<string, unknown[]> = {};
    for (const name of applicationTables) {
      const rows = await env.DB.prepare(`SELECT * FROM \`${name}\``).all<Record<string, unknown>>();
      backup[name] = rows.results;
    }
    return NextResponse.json({ createdAt: new Date().toISOString(), tables: backup }, {
      headers: { "Content-Disposition": `attachment; filename="d1-backup-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "no-store" },
    });
  }
  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}

export async function PUT(request: Request) {
  if (!authorized(request)) return unavailable();
  const product = new URL(request.url).searchParams.get("product") ?? "";
  if (!isEbookProduct(product)) return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength < 10_000 || bytes.byteLength > 25_000_000) return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
  const signature = new Uint8Array(bytes.slice(0, 5));
  if (new TextDecoder().decode(signature) !== "%PDF-") return NextResponse.json({ error: "Invalid PDF" }, { status: 400 });
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const sha256 = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const book = ebookCatalog[product];
  await env.BOOKS.put(book.objectKey, bytes, {
    httpMetadata: { contentType: "application/pdf", contentDisposition: `inline; filename="${book.filename}"` },
    customMetadata: { sha256, product },
  });
  return NextResponse.json({ ok: true, product, size: bytes.byteLength, sha256 });
}
