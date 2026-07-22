import { getDb } from "@/db";
import { members } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    await getDb().select({ id: members.id }).from(members).limit(1);
    return Response.json({ status: "ok", database: "ok", latencyMs: Date.now() - startedAt }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ status: "degraded", database: "error", latencyMs: Date.now() - startedAt }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
