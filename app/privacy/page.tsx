import type { Metadata } from "next";
import PolicyPage from "@/app/components/PolicyPage";

export const metadata: Metadata = { title: "개인정보처리방침", description: "PHILIP BOOKS 개인정보 수집·이용 및 보호 안내" };

export default function PrivacyPage() {
  return <PolicyPage eyebrow="PRIVACY POLICY" title="개인정보처리방침">
    <section><h2>1. 수집하는 개인정보</h2><p>회사는 회원 가입과 서비스 제공을 위해 Google 로그인에서 제공되는 고유 식별자, 이메일 주소, 이름, 프로필 이미지와 이용자가 직접 입력한 표시 이름 및 마케팅 수신 동의 여부를 처리합니다. 구매 시 주문번호, 상품, 결제금액, 결제상태, 결제사업자 거래 식별자를 처리하며 카드·계좌 원문 정보는 회사가 직접 저장하지 않습니다.</p></section>
    <section><h2>2. 이용 목적</h2><ul><li>회원 식별, 로그인 및 계정 관리</li><li>결제 확인, 구매 내역 제공, 전자책 열람 권한 관리</li><li>문의·환불 처리와 부정 이용 방지</li><li>이용자가 동의한 경우에 한한 새 상품 및 혜택 안내</li></ul></section>
    <section><h2>3. 보유 기간</h2><p>회원 정보는 회원 탈퇴 시까지 보유한 뒤 지체 없이 파기합니다. 다만 관계 법령에 따라 계약·청약철회·대금결제 및 재화 공급 기록은 5년, 소비자 불만 또는 분쟁처리 기록은 3년, 웹사이트 방문 기록은 관련 법령이 정한 기간 동안 보관할 수 있습니다.</p></section>
    <section><h2>4. 제3자 제공과 처리위탁</h2><p>회사는 원칙적으로 이용자의 개인정보를 동의 없이 제3자에게 제공하지 않습니다. 서비스 운영을 위해 Google(로그인), 카카오페이 및 네이버파이낸셜 Npay(결제), Cloudflare 및 OpenAI Sites(웹 호스팅·데이터 저장) 서비스를 이용하며, 각 사업자는 해당 업무 수행에 필요한 범위에서 정보를 처리할 수 있습니다. 해외 이전이 발생하는 서비스의 구체적인 이전 국가·항목·시점·보유기간은 실제 운영 설정 확정 후 이 방침에 고지합니다.</p></section>
    <section><h2>5. 이용자의 권리</h2><p>이용자는 마이페이지에서 자신의 정보를 조회·수정하고 회원 탈퇴를 요청할 수 있습니다. 개인정보 열람, 정정, 삭제, 처리정지에 관한 추가 요청은 florencelab@naver.com으로 접수할 수 있습니다.</p></section>
    <section><h2>6. 안전성 확보 조치</h2><p>회사는 로그인 세션을 보안 쿠키로 관리하고, 결제 비밀키를 서버 환경에 분리하며, 접근 권한을 필요한 운영자로 제한하는 등 개인정보 보호를 위한 기술적·관리적 조치를 적용합니다.</p></section>
    <section><h2>7. 개인정보 보호 문의</h2><p>개인정보 보호 관련 문의와 권리 행사는 플로렌스랩 개인정보 보호 담당자에게 전자우편(florencelab@naver.com)으로 요청할 수 있습니다.</p></section>
  </PolicyPage>;
}
