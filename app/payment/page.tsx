import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage from "@/app/components/PolicyPage";

export const metadata: Metadata = {
  title: "결제·이용 안내",
  description: "PHILIP BOOKS 전자책의 결제수단, 제공 시점, 구매 확인 및 고객지원 안내",
};

const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE?.trim();

export default function PaymentGuidePage() {
  return <PolicyPage eyebrow="PAYMENT & DELIVERY" title="결제·이용 안내">
    <section><h2>판매 상품</h2><p>PHILIP BOOKS는 PDF 전자책 3종을 판매합니다. 각 상품의 판매가는 19,000원이며 상품 상세페이지에서 제목, 저자, 파일 형식, 분량, 목차와 주요 내용을 구매 전에 확인할 수 있습니다.</p><ul><li><Link href="/codex">아이디어를 서비스로 바꾸는 Codex 사용법</Link></li><li><Link href="/career">커리어도 디자인할 수 있습니다</Link></li><li><Link href="/jane">승무원 다음은 IT였습니다</Link></li></ul></section>
    <section><h2>결제수단</h2><p>가맹점 심사와 기술검수가 완료된 결제수단부터 카카오페이와 Npay 단건결제를 제공합니다. 결제수단별 결제창에서 최종 금액과 결제수단을 확인한 뒤 결제를 완료합니다. PHILIP BOOKS는 카드번호나 계좌번호 원문을 직접 저장하지 않습니다.</p></section>
    <section><h2>디지털 콘텐츠 제공</h2><p>구매자는 결제 전에 PDF 제공이 즉시 시작되고 실제 열람 또는 다운로드 후에는 단순 변심 청약철회가 제한될 수 있다는 안내를 확인하고 동의합니다. 결제가 승인되면 Google 로그인 계정의 마이페이지 구매 내역에 전자책이 즉시 표시되며 별도의 배송은 없습니다.</p></section>
    <section><h2>구매 확인과 이용 방법</h2><ol><li>상품 상세페이지에서 구매할 전자책과 가격을 확인합니다.</li><li>Google 계정으로 로그인하고 디지털 콘텐츠 제공 조건에 동의합니다.</li><li>카카오페이 또는 Npay 결제창에서 결제를 완료합니다.</li><li>마이페이지의 구매 내역에서 주문 상태를 확인하고 PDF를 읽습니다.</li></ol><p>결제는 완료됐지만 구매 내역이 보이지 않으면 중복 결제를 시도하지 말고 고객센터로 주문 이메일과 결제수단을 알려 주세요.</p></section>
    <section><h2>취소·환불</h2><p>미열람 구매는 구매일부터 7일 이내에 마이페이지에서 환불을 신청할 수 있습니다. 파일 결함, 설명과 다른 상품 또는 서비스 장애는 별도 기준으로 확인합니다. 자세한 조건과 처리 상태는 <Link href="/refund">교환·환불정책</Link>에서 확인할 수 있습니다.</p></section>
    <section><h2>영수증과 결제 문의</h2><p>카카오페이 또는 Npay 결제 내역과 결제사업자가 제공하는 거래 확인 화면에서 결제 정보를 확인할 수 있습니다. 주문 확인, 콘텐츠 이용, 환불 문의는 PHILIP BOOKS 고객센터에서 처리합니다.</p><ul>{phone && <li>전화: {phone}</li>}<li>전자우편: <a href="mailto:florencelab@naver.com">florencelab@naver.com</a></li><li>카카오톡: <a href="https://open.kakao.com/o/sOQOF6Bh" target="_blank" rel="noreferrer">상담 채널 열기</a></li><li>운영시간: 평일 10:00–17:00 (공휴일 제외)</li></ul></section>
  </PolicyPage>;
}
