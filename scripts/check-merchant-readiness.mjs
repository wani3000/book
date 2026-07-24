import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const technical = process.argv.includes("--technical");

function loadEnvFile(name) {
  const file = resolve(root, name);
  if (!existsSync(file)) return;
  for (const rawLine of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const checks = [];
function check(label, ok, action) {
  checks.push({ label, ok: Boolean(ok), action });
}

const footer = readFileSync(resolve(root, "app/components/BusinessFooter.tsx"), "utf8");
const terms = readFileSync(resolve(root, "app/terms/page.tsx"), "utf8");
const refund = readFileSync(resolve(root, "app/refund/page.tsx"), "utf8");
const privacy = readFileSync(resolve(root, "app/privacy/page.tsx"), "utf8");
const payment = readFileSync(resolve(root, "app/payment/page.tsx"), "utf8");
const naver = readFileSync(resolve(root, "app/naverpay/server.ts"), "utf8");

const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE?.trim() ?? "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://danielsnote.com";

check("공개 HTTPS 판매 주소", /^https:\/\//.test(siteUrl), "NEXT_PUBLIC_SITE_URL에 실제 심사 도메인을 입력하세요.");
check("고객센터 전화번호", /^0\d{1,2}-\d{3,4}-\d{4}$/.test(phone), "NEXT_PUBLIC_BUSINESS_PHONE에 하이픈을 포함한 공개 전화번호를 입력하세요.");
check("사업자 정보 표시", ["플로렌스랩", "217-26-12405", "2026-서울구로-1222"].every((value) => footer.includes(value)), "공통 푸터의 사업자 정보를 복구하세요.");
check("전자책 4종·가격·제공 안내", payment.includes("PDF 전자책 4종") && payment.includes("19,000원") && payment.includes("별도의 배송은 없습니다"), "결제·이용 안내를 확인하세요.");
check("이용약관", terms.includes("카카오페이") && terms.includes("Npay") && terms.includes("청약철회"), "결제수단과 디지털 콘텐츠 제공 조건을 약관에 표시하세요.");
check("환불정책", refund.includes("구매일로부터 7일") && refund.includes("열람 또는 다운로드"), "환불 가능 기간과 제한 조건을 확인하세요.");
check("개인정보처리방침", privacy.includes("카카오페이") && privacy.includes("네이버파이낸셜"), "결제 처리위탁 내용을 확인하세요.");
check("네이버페이 최신 API 주소", naver.includes("pay.paygate.naver.com") && naver.includes("X-NaverPay-Idempotency-Key"), "네이버페이 공식 최신 API 규격을 유지하세요.");
check("신청 문서", existsSync(resolve(root, "KAKAOPAY_APPLICATION.md")) && existsSync(resolve(root, "NAVERPAY_APPLICATION.md")) && existsSync(resolve(root, "MERCHANT_REVIEW_READINESS.md")), "심사 제출 문서를 준비하세요.");

if (technical) {
  check("카카오페이 개발/운영 인증값", Boolean(process.env.KAKAOPAY_CID && process.env.KAKAOPAY_SECRET_KEY), "카카오페이에서 발급된 CID와 Secret Key를 비밀 환경변수로 입력하세요.");
  check("카카오페이 결제 활성화", process.env.NEXT_PUBLIC_KAKAOPAY_ENABLED === "true", "기술검수 환경에서 NEXT_PUBLIC_KAKAOPAY_ENABLED=true로 설정하세요.");
  check("Npay 개발/운영 인증값", Boolean(process.env.NAVERPAY_CLIENT_ID && process.env.NAVERPAY_CLIENT_SECRET && process.env.NAVERPAY_CHAIN_ID), "Npay에서 발급된 Client ID, Client Secret, Chain ID를 입력하세요.");
  check("Npay 결제 활성화", process.env.NEXT_PUBLIC_NAVERPAY_ENABLED === "true", "기술검수 환경에서 NEXT_PUBLIC_NAVERPAY_ENABLED=true로 설정하세요.");
  check("Npay 모드", ["development", "production"].includes(process.env.NAVERPAY_MODE ?? ""), "NAVERPAY_MODE를 검수 환경에 맞게 설정하세요.");
}

for (const item of checks) console.log(`${item.ok ? "PASS" : "FAIL"}  ${item.label}${item.ok ? "" : ` — ${item.action}`}`);
const failed = checks.filter((item) => !item.ok);
console.log(`\n${checks.length - failed.length}/${checks.length}개 통과`);
if (failed.length) process.exitCode = 1;
