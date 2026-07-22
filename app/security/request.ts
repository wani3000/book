import { getDb } from "@/db";
import { requestLimits } from "@/db/schema";
import { eq } from "drizzle-orm";

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const expected = new URL(request.url).origin;
  return origin === expected ? null : Response.json({ error: "허용되지 않은 요청 출처입니다." }, { status: 403 });
}

function requestIdentity(request: Request) {
  const forwarded = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0];
  return (forwarded || "unknown").trim().slice(0, 80);
}

export async function enforceRateLimit(request: Request, scope: string, limit: number, windowSeconds = 60) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const key = `${scope}:${requestIdentity(request)}:${windowStart}`;
  const db = getDb();
  const row = await db.select().from(requestLimits).where(eq(requestLimits.key, key)).get();
  if (row && row.count >= limit) {
    return Response.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, windowStart + windowSeconds - now)) },
    });
  }
  if (row) await db.update(requestLimits).set({ count: row.count + 1 }).where(eq(requestLimits.key, key));
  else await db.insert(requestLimits).values({ key, count: 1, windowStartedAt: windowStart });
  return null;
}
