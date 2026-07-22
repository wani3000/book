import Link from "next/link";
import BusinessFooter from "./BusinessFooter";

export default function PolicyPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <main className="policy-site">
    <header className="policy-header"><Link href="/">다니엘의 노트</Link><nav><Link href="/payment">결제·이용</Link><Link href="/terms">이용약관</Link><Link href="/privacy">개인정보처리방침</Link><Link href="/refund">교환·환불정책</Link></nav></header>
    <article className="policy-document"><p className="policy-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="policy-date">시행일 2026년 7월 21일</p>{children}</article>
    <BusinessFooter />
  </main>;
}
