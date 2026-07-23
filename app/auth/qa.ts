export function qaLoginEnabled() {
  const enabled = process.env.QA_LOGIN_ENABLED === "true";
  const productionAllowed = process.env.NODE_ENV !== "production" || process.env.QA_LOGIN_ALLOW_PRODUCTION === "true";
  const email = process.env.QA_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const password = process.env.QA_ADMIN_PASSWORD ?? "";
  return enabled && productionAllowed && Boolean(process.env.GOOGLE_SESSION_SECRET) && email.includes("@") && password.length >= 24;
}

export function qaAdminCredentials() {
  if (!qaLoginEnabled()) return null;
  return {
    email: process.env.QA_ADMIN_EMAIL!.trim().toLowerCase(),
    password: process.env.QA_ADMIN_PASSWORD!,
  };
}

export async function secretsMatch(actual: string, expected: string) {
  const encoder = new TextEncoder();
  const [actualHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(actual)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const left = new Uint8Array(actualHash);
  const right = new Uint8Array(expectedHash);
  let difference = left.length ^ right.length;
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}
