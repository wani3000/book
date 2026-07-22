import { getDb } from "@/db";
import { auditLogs, authIdentities, members, notificationOutbox, requestLimits, reviews } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    await Promise.all([
      getDb().select({ id: members.id, termsAcceptedAt: members.termsAcceptedAt, privacyAcceptedAt: members.privacyAcceptedAt, reactivatedAt: members.reactivatedAt }).from(members).limit(1),
      getDb().select({ id: authIdentities.id }).from(authIdentities).limit(1),
      getDb().select({ id: reviews.id, orderId: reviews.orderId, moderationReason: reviews.moderationReason, reviewedAt: reviews.reviewedAt }).from(reviews).limit(1),
      getDb().select({ id: auditLogs.id }).from(auditLogs).limit(1),
      getDb().select({ key: requestLimits.key }).from(requestLimits).limit(1),
      getDb().select({ id: notificationOutbox.id }).from(notificationOutbox).limit(1),
    ]);
    return Response.json({ status: "ok", database: "ok", schema: "0008", notifications: process.env.RESEND_API_KEY && process.env.TRANSACTIONAL_EMAIL_FROM ? "configured" : "outbox-only", latencyMs: Date.now() - startedAt }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ status: "degraded", database: "error", schema: "migration-required", latencyMs: Date.now() - startedAt }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
