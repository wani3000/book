import { desc } from "drizzle-orm";
import { getAuthenticatedMember } from "@/app/auth/member";
import { getDb } from "@/db";
import { auditLogs, members, orders, paymentAttempts, refundRequests, reviews } from "@/db/schema";

export const dynamic = "force-dynamic";

function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export async function GET(request: Request) {
  const admin = await getAuthenticatedMember(request);
  if (!admin?.isAdmin) return Response.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  const type = new URL(request.url).searchParams.get("type") ?? "orders";
  const db = getDb();
  let rows: Record<string, unknown>[];
  if (type === "members") rows = await db.select().from(members).orderBy(desc(members.createdAt)).limit(1000);
  else if (type === "payments") rows = await db.select().from(paymentAttempts).orderBy(desc(paymentAttempts.createdAt)).limit(1000);
  else if (type === "refunds") rows = await db.select().from(refundRequests).orderBy(desc(refundRequests.requestedAt)).limit(1000);
  else if (type === "reviews") rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(1000);
  else if (type === "audit") rows = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(1000);
  else rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(1000);
  const headers = rows.length ? Object.keys(rows[0]) : ["empty"];
  const csv = `\uFEFF${headers.map(csvCell).join(",")}\n${rows.map((row) => headers.map((key) => csvCell(row[key])).join(",")).join("\n")}`;
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="daniels-note-${type}.csv"`, "Cache-Control": "private, no-store" } });
}
