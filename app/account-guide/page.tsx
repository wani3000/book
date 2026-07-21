import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage from "@/app/components/PolicyPage";

export const metadata: Metadata = { title: "회원·구매내역 안내", description: "PHILIP BOOKS 회원가입, 구매내역, 전자책 열람, 탈퇴와 재가입 안내" };

export default function AccountGuidePage() {
  return <PolicyPage eyebrow="ACCOUNT GUIDE" title="회원·구매내역 안내">
    <section><h2>회원가입과 로그인</h2><p>PHILIP BOOKS는 별도 비밀번호 없이 Google 계정으로 로그인합니다. 처음 이용하는 경우 Google 인증 후 이용약관과 개인정보 수집·이용에 필수로 동의해야 회원가입이 완료됩니다. 마케팅 수신 동의는 선택이며, 동의하지 않아도 구매와 전자책 이용에 제한이 없습니다.</p></section>
    <section><h2>마이페이지에서 할 수 있는 일</h2><ul><li>표시 이름과 마케팅 수신 여부 변경</li><li>주문번호, 결제수단, 결제금액과 주문 상태 확인</li><li>결제 완료 전자책 PDF 열람 및 최초 열람 여부 확인</li><li>환불 신청과 신청 완료·검토 중·환불 완료·환불 불가 상태 확인</li><li>로그아웃과 회원 탈퇴</li></ul></section>
    <section><h2>구매내역과 전자책 권한</h2><p>결제 승인이 확인된 주문만 마이페이지에 구매 완료로 표시되고 PDF 열람 권한이 제공됩니다. 환불이 완료되면 해당 주문의 PDF 권한은 자동으로 회수됩니다. 결제는 완료됐지만 구매 내역이 보이지 않으면 중복 결제하지 말고 주문 이메일과 결제수단을 고객센터에 알려 주세요.</p></section>
    <section><h2>회원 탈퇴</h2><p>프로필 관리의 회원 탈퇴 화면에서 주의사항을 확인하고 ‘회원 탈퇴’를 직접 입력해야 탈퇴가 처리됩니다. 탈퇴 즉시 로그아웃되며 마이페이지와 PDF 열람이 중단됩니다. 진행 중인 환불 신청이 있으면 결과가 확정될 때까지 탈퇴할 수 없습니다.</p></section>
    <section><h2>탈퇴 후 기록 보관과 재가입</h2><p>회원 프로필은 탈퇴 처리되지만 주문·결제·환불 등 거래 기록은 관계 법령이 정한 기간 동안 분리 보관합니다. 같은 Google 계정으로 다시 로그인하면 자동 복구하지 않고 재가입 안내를 표시합니다. 필수 동의를 다시 확인하고 재가입하면 보관된 기존 구매 내역과 유효한 전자책 열람 권한이 다시 연결됩니다.</p></section>
    <section><h2>도움이 필요할 때</h2><p>계정, 구매내역 또는 탈퇴 처리에 문제가 있으면 <a href="mailto:florencelab@naver.com">florencelab@naver.com</a> 또는 <a href="https://open.kakao.com/o/sOQOF6Bh" target="_blank" rel="noreferrer">카카오톡 상담</a>으로 문의해 주세요. 환불 조건은 <Link href="/refund">교환·환불정책</Link>에서 확인할 수 있습니다.</p></section>
  </PolicyPage>;
}

