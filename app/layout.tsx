import type { Metadata } from "next";
import "pretendard/dist/web/static/Pretendard-Regular.css";
import "pretendard/dist/web/static/Pretendard-Bold.css";
import "./globals.css";
import "./design-system.css";
import "./typography-system.css";

const productionSiteUrl = "https://codex-solo-builder-book.wani3000.chatgpt.site";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl = configuredSiteUrl?.startsWith("https://") ? configuredSiteUrl : productionSiteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "다니엘의 노트 | 경험을 다음 기회로 바꾸는 실전 전자책",
    template: "%s | 다니엘의 노트",
  },
  description: "AI 서비스 제작, UI/UX 디자이너 커리어와 승무원에서 IT로 이동한 실제 경험을 실행 가능한 방법으로 정리한 실전 전자책 컬렉션.",
  keywords: ["Codex 사용법", "비개발자 코딩", "UI UX 디자이너", "승무원 이직", "서비스 운영", "커리어 전환", "전자책"],
  authors: [{ name: "필립" }],
  creator: "필립",
  publisher: "필립",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "경험을 다음 기회로 바꾸는 실전 전자책",
    description: "AI 서비스 제작 · UI/UX 커리어 · 승무원에서 IT로. 실제로 해본 사람의 실행 가능한 플레이북.",
    siteName: "다니엘의 노트",
    url: "/",
    images: [{ url: "/og-collection.png", width: 1733, height: 908, alt: "다니엘의 노트 실전 전자책 세 권" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "경험을 다음 기회로 바꾸는 실전 전자책",
    description: "AI 서비스 제작, UI/UX 커리어, 승무원에서 IT로 이어지는 실제 경험의 플레이북.",
    images: ["/og-collection.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body><a className="skip-link" href="#main-content">본문 바로가기</a><div id="main-content" tabIndex={-1}>{children}</div></body>
    </html>
  );
}
