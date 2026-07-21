import type { Metadata } from "next";
import PolicyPage from "@/app/components/PolicyPage";

export const metadata: Metadata = { title: "교환·환불정책", description: "다니엘의 노트 디지털 전자책의 청약철회 및 환불 기준" };

export default function RefundPage() {
  return <PolicyPage eyebrow="REFUND POLICY" title="교환·환불정책">
    <section><h2>구매 전 확인 사항</h2><p>다니엘의 노트 상품은 결제 후 마이페이지에서 바로 열람하는 PDF 디지털 콘텐츠입니다. 상품 상세페이지의 제목, 목차, 분량, 파일 형식과 이용 환경을 구매 전에 확인해 주세요.</p></section>
    <section><h2>청약철회 가능 기간</h2><p>콘텐츠 열람 또는 다운로드가 시작되지 않은 경우에는 구매일로부터 7일 이내에 청약철회를 요청할 수 있습니다. 로그인 후 마이페이지의 구매 내역에서 &apos;환불 신청하기&apos;를 눌러 사유를 작성해 주세요. 로그인이 어렵다면 주문에 사용한 이메일 주소와 주문번호를 적어 florencelab@naver.com으로 보내 주세요.</p></section>
    <section><h2>청약철회 제한</h2><p>구매자가 디지털 콘텐츠 제공이 즉시 시작된다는 점과 제공 시작 후 청약철회가 제한될 수 있다는 점에 동의하고 실제 열람 또는 다운로드를 시작한 경우, 전자상거래 등에서의 소비자보호에 관한 법률에 따라 단순 변심에 의한 청약철회가 제한될 수 있습니다.</p></section>
    <section><h2>결함 또는 표시와 다른 상품</h2><p>파일이 정상적으로 열리지 않거나 상품 설명과 현저히 다른 콘텐츠가 제공된 경우에는 콘텐츠를 이용할 수 있게 된 날부터 3개월 이내이면서 그 사실을 안 날 또는 알 수 있었던 날부터 30일 이내에 교환·수정 제공 또는 환불을 요청할 수 있습니다. 회사 책임으로 이용하지 못한 경우에는 확인 후 전액 환불합니다.</p></section>
    <section><h2>처리 방법과 시점</h2><p>환불 요청을 접수하면 마이페이지에 &apos;환불 신청 완료&apos; 상태가 표시됩니다. 담당자가 구매 및 최초 열람 기록을 확인하는 동안에는 &apos;환불 검토 중&apos;, 승인이 끝나면 &apos;환불 완료&apos;, 조건에 맞지 않으면 사유와 함께 &apos;환불 불가&apos;로 표시됩니다. 환불 승인을 시작하는 즉시 전자책 이용 권한이 회수되며, 결제수단 사업자의 처리 일정에 따라 결제 취소 또는 환급이 반영됩니다.</p></section>
    <section><h2>문의</h2><p>전자우편: florencelab@naver.com<br />카카오톡: <a href="https://open.kakao.com/o/sOQOF6Bh" target="_blank" rel="noreferrer">상담 채널 열기</a><br />운영시간: 평일 10:00–17:00 (공휴일 제외)</p></section>
  </PolicyPage>;
}
