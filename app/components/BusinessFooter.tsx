import Link from "next/link";

const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE?.trim();

export default function BusinessFooter() {
  return (
    <footer className="class-footer business-footer">
      <Link className="class-logo" href="/"><span className="class-logo-mark" aria-hidden="true">D</span><strong>다니엘의 노트</strong></Link>
      <p>실제 경험을 실행 가능한 지식으로 만듭니다.</p>
      <div className="business-footer-links"><Link href="/payment">결제·이용 안내</Link><Link href="/account-guide">회원·구매내역 안내</Link><Link href="/terms">이용약관</Link><Link href="/privacy">개인정보처리방침</Link><Link href="/refund">교환·환불정책</Link></div>
      <address>
        <span>상호 플로렌스랩(Florence Lab)</span><span>대표자 박철완</span><span>사업자등록번호 217-26-12405</span>
        <span>통신판매업신고 제2026-서울구로-1222호</span><span>서울특별시 구로구 고척로 49</span>
        {phone && <span>고객센터 {phone}</span>}<a href="mailto:florencelab@naver.com">florencelab@naver.com</a><a href="https://open.kakao.com/o/sOQOF6Bh" target="_blank" rel="noreferrer">카카오톡 상담</a>
      </address>
      <small>© 2026 다니엘의 노트 · 플로렌스랩</small>
    </footer>
  );
}
