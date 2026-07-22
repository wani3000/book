export async function redirectForAdminReauthentication(result: { code?: string }) {
  if (result.code !== "admin_reauthentication_required") return false;
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
  const returnTo = `${window.location.pathname}${window.location.search}`;
  window.location.href = `/mypage?reauth=admin&returnTo=${encodeURIComponent(returnTo)}`;
  return true;
}
