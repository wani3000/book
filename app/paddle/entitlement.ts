import { jwtVerify, SignJWT } from "jose";
import type { EbookProduct } from "@/app/library/catalog";

const encoder = new TextEncoder();
const issuer = "philip-books";
const audience = "paddle-checkout";

function key() {
  const secret = process.env.GOOGLE_SESSION_SECRET;
  if (!secret) throw new Error("Session secret is not configured");
  return encoder.encode(secret);
}

export async function createPurchaseEntitlement(memberId: string, product: EbookProduct) {
  return new SignJWT({ product })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(memberId)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(key());
}

export async function verifyPurchaseEntitlement(token: string) {
  const { payload } = await jwtVerify(token, key(), { issuer, audience });
  if (!payload.sub || typeof payload.product !== "string") throw new Error("Invalid purchase entitlement");
  return { memberId: payload.sub, product: payload.product };
}
