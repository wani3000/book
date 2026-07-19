import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "비개발자도 Codex로 서비스를 만들 수 있다 | 필립",
    template: "%s | Codex Solo Builder",
  },
  description: "IT 초보자가 Codex로 폴더 생성부터 GitHub, Vercel 배포, Supabase, 결제, SEO와 Threads 자동화까지 완성하는 253쪽 실전 전자책.",
  keywords: ["Codex 사용법", "비개발자 코딩", "AI 서비스 만들기", "바이브 코딩", "1인 개발", "전자책"],
  authors: [{ name: "필립" }],
  creator: "필립",
  publisher: "필립",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "비개발자도 Codex로 서비스를 만들 수 있다",
    description: "개발자 없이 아이디어에서 배포·결제·홍보·운영까지. 253쪽 Codex 실전 워크북.",
    siteName: "Codex Solo Builder",
    url: "/",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "비개발자도 Codex로 서비스를 만들 수 있다" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "비개발자도 Codex로 서비스를 만들 수 있다",
    description: "49개 장을 따라 서비스의 처음부터 끝까지 완성하는 초보자용 Codex 실전서.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
