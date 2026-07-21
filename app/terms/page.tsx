import type { Metadata } from "next";
import PolicyPage from "@/app/components/PolicyPage";

export const metadata: Metadata = { title: "이용약관", description: "PHILIP BOOKS 전자책 서비스 이용약관" };

const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE?.trim();

export default function TermsPage() {
  return <PolicyPage eyebrow="TERMS OF SERVICE" title="이용약관">
    <section><h2>제1조 목적</h2><p>이 약관은 플로렌스랩(이하 “회사”)이 운영하는 PHILIP BOOKS에서 제공하는 전자책 판매 및 열람 서비스의 이용 조건과 회사와 이용자의 권리·의무를 정함을 목적으로 합니다.</p></section>
    <section><h2>제2조 회사 정보</h2><ul><li>상호: 플로렌스랩(Florence Lab)</li><li>대표자: 박철완</li><li>사업자등록번호: 217-26-12405</li><li>통신판매업신고: 제 2020-서울구로-0138호</li><li>주소: 서울특별시 구로구 고척로 49</li>{phone && <li>고객센터: {phone}</li>}<li>전자우편: florencelab@naver.com</li><li>카카오톡 상담: <a href="https://open.kakao.com/o/sOQOF6Bh" target="_blank" rel="noreferrer">상담 채널 열기</a></li></ul></section>
    <section><h2>제3조 서비스와 계약 성립</h2><p>회사는 PDF 전자책의 상품 정보, 가격, 이용 조건을 표시합니다. 이용자가 상품을 선택하고 결제를 완료해 회사가 결제 완료를 확인하면 구매 계약이 성립합니다. 서비스 운영상 필요한 경우 상품 구성이나 제공 방식이 변경될 수 있으며, 구매자의 권리에 중대한 영향을 주는 변경은 사전에 알립니다.</p></section>
    <section><h2>제4조 회원 계정</h2><p>구매 내역과 전자책 열람은 Google 로그인 계정에 연결됩니다. 신규 회원은 Google 인증 후 이용약관과 개인정보 수집·이용에 동의해야 가입이 완료됩니다. 탈퇴 즉시 계정과 콘텐츠 이용은 중단되며 거래 기록은 관계 법령에 따라 필요한 기간 동안 보관될 수 있습니다. 같은 Google 계정으로 재가입하는 경우 자동 복구하지 않고 필수 동의를 다시 확인한 뒤 기존 구매 내역과 유효한 열람 권한을 연결합니다. 이용자는 본인의 계정을 안전하게 관리해야 하며, 계정을 타인에게 양도하거나 구매 콘텐츠를 불법 복제·배포해서는 안 됩니다. 자세한 절차는 <a href="/account-guide">회원·구매내역 안내</a>를 따릅니다.</p></section>
    <section><h2>제5조 결제와 콘텐츠 제공</h2><p>판매 가격은 상품 상세페이지에 표시하며 현재 각 전자책은 19,000원입니다. 결제는 가맹점 심사와 기술검수가 완료된 카카오페이 또는 Npay 단건결제로 처리됩니다. 구매자가 디지털 콘텐츠 즉시 제공과 청약철회 제한 안내를 확인하고 결제를 완료하면, 회사는 결제 승인 직후 구매자의 마이페이지에서 PDF를 제공하며 별도의 배송은 없습니다. 결제·이용 절차는 <a href="/payment">결제·이용 안내</a>에서 확인할 수 있습니다.</p></section>
    <section><h2>제6조 이용 제한</h2><p>저작권 침해, 계정 도용, 결제 부정 이용, 서비스 장애를 유발하는 행위가 확인되면 회사는 사전 통지 후 이용을 제한할 수 있습니다. 긴급한 보안 문제가 있는 경우 먼저 제한한 뒤 알릴 수 있습니다.</p></section>
    <section><h2>제7조 청약철회와 환불</h2><p>청약철회, 교환 및 환불 조건은 별도의 교환·환불정책을 따릅니다. 디지털 콘텐츠 제공이 시작된 경우 관련 법령에 따라 청약철회가 제한될 수 있으며, 결함이 있거나 표시·광고와 다른 콘텐츠가 제공된 경우에는 법령과 정책에 따라 조치합니다.</p></section>
    <section><h2>제8조 책임과 분쟁 해결</h2><p>회사는 고의 또는 과실로 이용자에게 손해를 발생시킨 경우 관련 법령에 따라 책임을 부담합니다. 이 약관에 정하지 않은 사항은 전자상거래 등에서의 소비자보호에 관한 법률 등 대한민국 법령을 따르며, 분쟁은 민사소송법상 관할 법원에서 해결합니다.</p></section>
  </PolicyPage>;
}
