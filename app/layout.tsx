import type { Metadata } from "next";
import { Suspense } from "react";
import "pretendard/dist/web/static/Pretendard-Regular.css";
import "pretendard/dist/web/static/Pretendard-Bold.css";
import "./globals.css";
import "./design-system.css";
import "./typography-system.css";
import GoogleAnalytics from "./components/GoogleAnalytics";

const productionSiteUrl = "https://danielsnote.com";
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const siteUrl = configuredSiteUrl?.startsWith("https://") ? configuredSiteUrl : productionSiteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "다니엘의 노트 | 경험을 다음 기회로 바꾸는 실전 전자책",
    template: "%s | 다니엘의 노트",
  },
  description: "AI 서비스 제작, UI/UX 커리어, 승무원에서 IT로 이동한 경험과 인간의 정체성을 묻는 장편 SF소설을 만나는 전자책 컬렉션.",
  keywords: ["Codex 사용법", "비개발자 코딩", "UI UX 디자이너", "승무원 이직", "서비스 운영", "커리어 전환", "SF소설", "의식 이전", "전자책"],
  authors: [{ name: "필립" }, { name: "제인" }, { name: "제임스 한" }],
  creator: "다니엘의 노트",
  publisher: "다니엘의 노트",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "새로운 생각을 여는 네 권의 전자책",
    description: "실전 경험을 담은 가이드부터 몸과 기억의 경계를 묻는 장편 SF소설까지.",
    siteName: "다니엘의 노트",
    url: "/",
    images: [{ url: "/og-collection.png", width: 1733, height: 908, alt: "다니엘의 노트 전자책 네 권" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "새로운 생각을 여는 네 권의 전자책",
    description: "실전 경험을 담은 가이드부터 질문을 남기는 장편 SF소설까지.",
    images: ["/og-collection.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="naver-site-verification" content="10986c83c4876b995ad8e090fb27231a711efabe" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      </head>
      <body suppressHydrationWarning><a className="skip-link" href="#main-content">본문 바로가기</a><div id="main-content" tabIndex={-1}>{children}</div><Suspense fallback={null}><GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()} /></Suspense></body>
    </html>
  );
}
