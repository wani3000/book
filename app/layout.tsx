import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "실전 전자책 | AI 서비스 제작과 커리어 전환",
    template: "%s | 필립의 실전 전자책",
  },
  description: "Codex 서비스 제작, UI/UX 디자이너 커리어와 승무원에서 IT로 이동한 실제 경험을 다루는 실전 전자책.",
  keywords: ["Codex 사용법", "비개발자 코딩", "UI UX 디자이너", "승무원 이직", "서비스 운영", "커리어 전환", "전자책"],
  authors: [{ name: "필립" }],
  creator: "필립",
  publisher: "필립",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: "아이디어를 서비스로 바꾸는 Codex 사용법",
    description: "개발자 없이 아이디어에서 배포·결제·홍보·운영까지. 258쪽 Codex 실전 워크북.",
    siteName: "Philip Books",
    url: "/",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "아이디어를 서비스로 바꾸는 Codex 사용법" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "아이디어를 서비스로 바꾸는 Codex 사용법",
    description: "50개 장을 따라 서비스의 처음부터 끝까지 완성하는 초보자용 Codex 실전서.",
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
