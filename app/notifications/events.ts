import { deliverNotice } from "./outbox";
import { emailLinks, friendlyEmail, receiptAttachment, type FriendlyEmail } from "./templates";

type Recipient = { id: string; email: string; notificationEmail?: string | null; displayName?: string | null; name?: string | null };
type OrderInfo = { orderId: string; title: string; amount: number; provider: string; purchasedAt?: string };

export function recipientEmail(member: Recipient) {
  return member.notificationEmail?.trim() || member.email.trim();
}

async function send(member: Recipient, event: string, message: FriendlyEmail, recipient = recipientEmail(member)) {
  return deliverNotice({ memberId: member.id, recipient, event, ...message });
}

async function sendAdmins(event: string, message: FriendlyEmail) {
  const recipients = (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  await Promise.allSettled(recipients.map((recipient) => deliverNotice({ recipient, event: `admin.${event}`, ...message })));
}

export async function notifyWelcome(member: Recipient, reactivated = false) {
  const name = member.displayName || member.name || "회원";
  return send(member, reactivated ? "member.reactivated" : "member.welcome", friendlyEmail({
    subject: reactivated ? "[다니엘의 노트] 다시 만나서 반가워요" : "[다니엘의 노트] 환영해요",
    eyebrow: reactivated ? "WELCOME BACK" : "WELCOME",
    title: reactivated ? "다시 시작할 준비가 되었어요" : "다니엘의 노트에 오신 걸 환영해요",
    greeting: `${name}님, 반가워요.`,
    paragraphs: [reactivated ? "이전에 구매한 책과 이용할 수 있는 권한을 다시 연결했어요." : "다른 사람의 실제 경험을 내 다음 기회로 바꾸는 여정을 함께할게요.", "관심 있는 책을 둘러보고, 구매한 책은 내 서재에서 언제든 편하게 읽어 보세요."],
    action: { label: "전자책 둘러보기", url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://danielsnote.com"}/#books` },
  }));
}

export async function notifyPaymentCompleted(member: Recipient, order: OrderInfo, recovered = false) {
  const message = friendlyEmail({
    subject: recovered ? "[다니엘의 노트] 결제가 확인되었어요" : "[다니엘의 노트] 결제가 완료되었어요",
    eyebrow: "PAYMENT COMPLETE",
    title: recovered ? "결제를 확인하고 책을 다시 열어드렸어요" : "결제가 완료되었어요",
    greeting: `${member.displayName || member.name || "회원"}님, 구매해 주셔서 고마워요.`,
    paragraphs: [recovered ? "결제사업자 기록을 다시 확인해 정상 결제로 처리했어요." : "이제 내 서재에서 전자책을 바로 읽을 수 있어요.", "전자책 원본은 환불 후에도 안전하게 권한을 관리할 수 있도록 이메일에 직접 첨부하지 않고 내 서재에서 제공해요."],
    details: [{ label: "전자책", value: order.title }, { label: "결제금액", value: `${order.amount.toLocaleString("ko-KR")}원` }, { label: "결제수단", value: order.provider }, { label: "주문번호", value: order.orderId }],
    action: { label: "내 서재에서 읽기", url: emailLinks.library() },
    attachments: [receiptAttachment(order)],
  });
  await send(member, "payment.completed", message);
  await sendAdmins("payment.completed", friendlyEmail({ subject: "[운영 알림] 새 결제가 완료되었어요", eyebrow: "ADMIN NOTICE", title: "새 결제가 완료되었어요", paragraphs: ["주문과 전자책 권한이 정상적으로 생성되었어요."], details: [{ label: "회원", value: recipientEmail(member) }, { label: "전자책", value: order.title }, { label: "주문번호", value: order.orderId }], action: { label: "운영 현황 확인하기", url: emailLinks.adminOperations() } }));
}

export async function notifyPaymentCancelled(member: Recipient, order: Pick<OrderInfo, "orderId" | "title">) {
  return send(member, "payment.cancelled", friendlyEmail({ subject: "[다니엘의 노트] 결제가 취소되었어요", eyebrow: "PAYMENT CANCELLED", title: "결제가 취소되었어요", greeting: `${member.displayName || member.name || "회원"}님,`, paragraphs: ["결제창에서 취소되어 금액은 청구되지 않았어요.", "원하실 때 상품 페이지에서 다시 시작하면 돼요."], details: [{ label: "전자책", value: order.title }, { label: "주문번호", value: order.orderId }], action: { label: "전자책 다시 보기", url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://danielsnote.com"}/#books` } }));
}

export async function notifyPaymentFailed(member: Recipient, order: Pick<OrderInfo, "orderId" | "title">) {
  return send(member, "payment.failed", friendlyEmail({ subject: "[다니엘의 노트] 결제를 완료하지 못했어요", eyebrow: "PAYMENT HELP", title: "결제를 완료하지 못했어요", greeting: `${member.displayName || member.name || "회원"}님, 걱정하지 않으셔도 돼요.`, paragraphs: ["결제 승인 과정이 끝나지 않아 전자책 금액이 정상 청구되지 않았어요.", "중복 결제는 하지 말고, 결제수단에서 금액이 빠져나갔다면 주문번호와 함께 알려 주세요."], details: [{ label: "전자책", value: order.title }, { label: "주문번호", value: order.orderId }], action: { label: "주문 내역 확인하기", url: emailLinks.orders() } }));
}

export async function notifyRefundRequested(member: Recipient, order: Pick<OrderInfo, "orderId" | "title">) {
  const message = friendlyEmail({ subject: "[다니엘의 노트] 환불 신청을 받았어요", eyebrow: "REFUND REQUEST", title: "환불 신청을 받았어요", greeting: `${member.displayName || member.name || "회원"}님, 신청해 주신 내용을 확인할게요.`, paragraphs: ["환불 조건과 결제 상태를 차근차근 확인한 뒤 결과를 알려드릴게요.", "진행 상태는 마이페이지 주문 내역에서도 확인할 수 있어요."], details: [{ label: "전자책", value: order.title }, { label: "주문번호", value: order.orderId }], action: { label: "환불 상태 확인하기", url: emailLinks.orders() } });
  await send(member, "refund.requested", message);
  await sendAdmins("refund.requested", friendlyEmail({ subject: "[운영 알림] 새 환불 신청이 들어왔어요", eyebrow: "ADMIN NOTICE", title: "새 환불 신청이 들어왔어요", paragraphs: ["환불 조건과 최초 열람 여부를 확인해 주세요."], details: [{ label: "회원", value: recipientEmail(member) }, { label: "전자책", value: order.title }, { label: "주문번호", value: order.orderId }], action: { label: "환불 검토하기", url: emailLinks.adminRefunds() } }));
}

export async function notifyRefundReviewing(member: Recipient, order: Pick<OrderInfo, "orderId" | "title">) {
  return send(member, "refund.reviewing", friendlyEmail({ subject: "[다니엘의 노트] 환불 신청을 확인하고 있어요", eyebrow: "REFUND REVIEW", title: "환불 신청을 확인하고 있어요", greeting: `${member.displayName || member.name || "회원"}님,`, paragraphs: ["담당자가 신청 내용과 결제 상태를 검토하고 있어요.", "결과가 정리되는 대로 이메일과 주문 내역에서 알려드릴게요."], details: [{ label: "전자책", value: order.title }, { label: "주문번호", value: order.orderId }], action: { label: "현재 상태 확인하기", url: emailLinks.orders() } }));
}

export async function notifyRefundCompleted(member: Recipient, order: Pick<OrderInfo, "orderId" | "title">) {
  return send(member, "refund.completed", friendlyEmail({ subject: "[다니엘의 노트] 환불이 완료되었어요", eyebrow: "REFUND COMPLETE", title: "환불이 완료되었어요", greeting: `${member.displayName || member.name || "회원"}님,`, paragraphs: ["결제 취소가 완료되었고 전자책 열람 권한도 함께 종료되었어요.", "결제수단에 실제 반영되는 시점은 카드사나 간편결제사에 따라 조금 다를 수 있어요."], details: [{ label: "전자책", value: order.title }, { label: "주문번호", value: order.orderId }], action: { label: "주문 내역 확인하기", url: emailLinks.orders() } }));
}

export async function notifyRefundRejected(member: Recipient, order: Pick<OrderInfo, "orderId" | "title">, reason: string) {
  return send(member, "refund.rejected", friendlyEmail({ subject: "[다니엘의 노트] 환불이 어려운 이유를 안내드려요", eyebrow: "REFUND RESULT", title: "이번 환불은 진행하기 어려워요", greeting: `${member.displayName || member.name || "회원"}님, 기다려 주셔서 고마워요.`, paragraphs: ["신청 내용을 확인했지만 아래 이유로 환불을 진행하기 어려워요.", "내용이 사실과 다르거나 추가 확인이 필요하면 언제든 편하게 답장해 주세요."], details: [{ label: "전자책", value: order.title }, { label: "주문번호", value: order.orderId }, { label: "안내 사유", value: reason }], action: { label: "처리 결과 확인하기", url: emailLinks.orders() } }));
}

export async function notifyMarketingPreference(member: Recipient, enabled: boolean) {
  return send(member, enabled ? "marketing.subscribed" : "marketing.unsubscribed", friendlyEmail(enabled ? { subject: "[다니엘의 노트] 새 소식 신청이 완료되었어요", eyebrow: "GOOD NEWS", title: "앞으로 좋은 소식을 전해드릴게요", greeting: `${member.displayName || member.name || "회원"}님, 신청해 주셔서 고마워요.`, paragraphs: ["새로운 전자책과 꼭 필요한 할인 소식만 정성껏 골라 보내드릴게요.", "원하지 않을 때는 프로필 관리에서 언제든 편하게 끌 수 있어요."], action: { label: "수신 설정 확인하기", url: emailLinks.profile() }, marketing: true } : { subject: "[다니엘의 노트] 소식 메일을 그만 보내드릴게요", eyebrow: "EMAIL PREFERENCE", title: "소식 메일 수신이 해제되었어요", greeting: `${member.displayName || member.name || "회원"}님,`, paragraphs: ["요청하신 대로 새 책과 할인 소식 메일을 그만 보내드릴게요.", "결제와 환불처럼 꼭 필요한 안내는 계속 안전하게 보내드려요."], action: { label: "수신 설정 확인하기", url: emailLinks.profile() } }));
}

export async function notifyEmailChanged(member: Recipient, newEmail: string, previousEmail?: string) {
  const message = friendlyEmail({ subject: "[다니엘의 노트] 알림 이메일이 변경되었어요", eyebrow: "EMAIL UPDATED", title: "알림 이메일이 변경되었어요", greeting: `${member.displayName || member.name || "회원"}님,`, paragraphs: [`앞으로 결제와 환불 안내를 ${newEmail}로 보내드릴게요.`, "직접 변경하지 않았다면 고객센터로 바로 알려 주세요."], action: { label: "프로필 확인하기", url: emailLinks.profile() } });
  await send(member, "email.changed", message, newEmail);
  if (previousEmail && previousEmail !== newEmail && !previousEmail.endsWith("@daniels-note.kakao.local")) await send(member, "email.changed.security", message, previousEmail);
}

export async function notifyAccountDeleted(member: Recipient) {
  return send(member, "member.deleted", friendlyEmail({ subject: "[다니엘의 노트] 회원 탈퇴가 완료되었어요", eyebrow: "ACCOUNT CLOSED", title: "회원 탈퇴가 완료되었어요", greeting: `${member.displayName || member.name || "회원"}님, 그동안 함께해 주셔서 고마워요.`, paragraphs: ["요청하신 대로 계정 이용과 전자책 열람을 종료했어요.", "결제·환불 기록은 관련 법령에서 정한 기간 동안 안전하게 보관한 뒤 삭제해요."], note: "직접 요청하지 않았다면 고객센터로 바로 알려 주세요." }));
}

export function emailVerificationMessage(name: string, verificationUrl: string) {
  return friendlyEmail({ subject: "[다니엘의 노트] 새 이메일을 확인해 주세요", eyebrow: "VERIFY EMAIL", title: "새 이메일을 확인해 주세요", greeting: `${name || "회원"}님,`, paragraphs: ["알림을 받을 이메일 주소를 바꾸기 위해 한 번만 확인이 필요해요.", "아래 버튼을 누르면 새 이메일 주소가 안전하게 등록돼요."], action: { label: "이메일 주소 확인하기", url: verificationUrl }, note: "이 링크는 30분 동안 사용할 수 있어요. 직접 요청하지 않았다면 아무것도 하지 않으셔도 돼요." });
}

export function marketingCampaignMessage(input: { subject: string; title: string; message: string; actionLabel?: string; actionUrl?: string }) {
  return friendlyEmail({ subject: `[다니엘의 노트] ${input.subject}`, eyebrow: "DANIEL'S LETTER", title: input.title, paragraphs: [input.message], action: input.actionLabel && input.actionUrl ? { label: input.actionLabel, url: input.actionUrl } : undefined, marketing: true });
}
