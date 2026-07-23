import { EventName, type AdjustmentUpdatedEvent, type TransactionCanceledEvent, type TransactionCompletedEvent, type TransactionPaymentFailedEvent } from "@paddle/paddle-node-sdk";
import { and, eq } from "drizzle-orm";
import { ebookCatalog, isEbookProduct } from "@/app/library/catalog";
import { verifyPurchaseEntitlement } from "@/app/paddle/entitlement";
import { getPaddleInstance } from "@/app/paddle/server";
import { getDb } from "@/db";
import { members, orders } from "@/db/schema";
import { notifyPaymentCancelled, notifyPaymentCompleted, notifyPaymentFailed, notifyRefundCompleted } from "@/app/notifications/events";

export const dynamic = "force-dynamic";

function expectedPriceId(product: string) {
  if (product === "codex") return process.env.NEXT_PUBLIC_CODEX_PRICE_ID;
  if (product === "career") return process.env.NEXT_PUBLIC_CAREER_PRICE_ID;
  if (product === "jane") return process.env.NEXT_PUBLIC_JANE_PRICE_ID;
  return undefined;
}

async function recordCompletedTransaction(event: TransactionCompletedEvent) {
  const customData = event.data.customData as Record<string, unknown> | null;
  const entitlement = typeof customData?.entitlement === "string" ? customData.entitlement : "";
  if (!entitlement) throw new Error("Missing purchase entitlement");

  const purchase = await verifyPurchaseEntitlement(entitlement);
  if (!isEbookProduct(purchase.product)) throw new Error("Unknown ebook product");
  const configuredPriceId = expectedPriceId(purchase.product);
  const purchasedPriceIds = event.data.items.map((item) => item.price?.id).filter(Boolean);
  if (!configuredPriceId || !purchasedPriceIds.includes(configuredPriceId)) throw new Error("Purchased price does not match product");

  const member = await getDb().query.members.findFirst({ where: eq(members.id, purchase.memberId) });
  if (!member || member.status !== "active") throw new Error("Active member not found");
  const book = ebookCatalog[purchase.product];
  const now = new Date().toISOString();
  const amount = Number(event.data.details?.totals?.grandTotal ?? book.amount);
  const existingOrder = await getDb().query.orders.findFirst({ where: and(eq(orders.provider, "paddle"), eq(orders.providerReference, event.data.id)) });
  const orderId = existingOrder?.id ?? crypto.randomUUID();
  await getDb().insert(orders).values({
    id: orderId,
    memberId: member.id,
    product: purchase.product,
    productTitle: book.title,
    amount: Number.isFinite(amount) ? amount : book.amount,
    currency: event.data.currencyCode,
    status: "paid",
    provider: "paddle",
    providerReference: event.data.id,
    createdAt: event.data.createdAt,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: orders.providerReference,
    set: { status: "paid", amount: Number.isFinite(amount) ? amount : book.amount, currency: event.data.currencyCode, updatedAt: now },
  });
  if (existingOrder?.status !== "paid") await notifyPaymentCompleted(member, { orderId, title: book.title, amount: Number.isFinite(amount) ? amount : book.amount, provider: "Paddle", purchasedAt: event.data.createdAt });
}

async function applyAdjustment(event: AdjustmentUpdatedEvent) {
  if (event.data.status !== "approved" || event.data.type !== "full") return;
  if (!["refund", "chargeback"].includes(event.data.action)) return;
  const order = await getDb().query.orders.findFirst({ where: and(eq(orders.provider, "paddle"), eq(orders.providerReference, event.data.transactionId)) });
  if (!order || ["refunded", "chargeback"].includes(order.status)) return;
  await getDb().update(orders).set({
    status: event.data.action === "chargeback" ? "chargeback" : "refunded",
    updatedAt: new Date().toISOString(),
  }).where(and(eq(orders.provider, "paddle"), eq(orders.providerReference, event.data.transactionId)));
  const member = await getDb().query.members.findFirst({ where: eq(members.id, order.memberId) });
  if (member) await notifyRefundCompleted(member, { orderId: order.id, title: order.productTitle });
}

async function notifyIncompleteTransaction(event: TransactionPaymentFailedEvent | TransactionCanceledEvent, cancelled: boolean) {
  const customData = event.data.customData as Record<string, unknown> | null;
  const entitlement = typeof customData?.entitlement === "string" ? customData.entitlement : "";
  if (!entitlement) return;
  const purchase = await verifyPurchaseEntitlement(entitlement);
  if (!isEbookProduct(purchase.product)) return;
  const member = await getDb().query.members.findFirst({ where: eq(members.id, purchase.memberId) });
  if (!member) return;
  const order = { orderId: event.data.id, title: ebookCatalog[purchase.product].title };
  if (cancelled) await notifyPaymentCancelled(member, order);
  else await notifyPaymentFailed(member, order);
}

export async function POST(request: Request) {
  const signature = request.headers.get("paddle-signature") ?? "";
  const rawBody = await request.text();
  const secret = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET ?? "";
  if (!signature || !rawBody || !secret) return Response.json({ error: "Missing webhook configuration" }, { status: 400 });

  try {
    const event = await getPaddleInstance().webhooks.unmarshal(rawBody, secret, signature);
    if (event.eventType === EventName.TransactionCompleted) await recordCompletedTransaction(event);
    else if (event.eventType === EventName.AdjustmentUpdated) await applyAdjustment(event);
    else if (event.eventType === EventName.TransactionPaymentFailed) await notifyIncompleteTransaction(event, false);
    else if (event.eventType === EventName.TransactionCanceled) await notifyIncompleteTransaction(event, true);
    return Response.json({ received: true });
  } catch (error) {
    console.error("Paddle webhook error", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
