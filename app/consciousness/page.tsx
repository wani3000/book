import type { Metadata } from "next";
import NovelDetailPage from "../components/NovelDetailPage";

export const metadata: Metadata = {
  title: "의식의 국경",
  description: "다른 몸에서 눈을 떠도 나는 여전히 같은 사람인가. 몸과 기억, 정체성과 소유권, 불멸과 통제의 경계를 따라가는 제임스 한의 장편 SF소설.",
  alternates: { canonical: "/consciousness" },
  openGraph: {
    title: "의식의 국경 | 제임스 한 장편 SF소설",
    description: "내 몸인데, 돌아갈 권한은 내게 없었다.",
    type: "book",
    images: [{ url: "/consciousness-cover.png", width: 1600, height: 2263, alt: "의식의 국경 표지" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "의식의 국경 | 제임스 한 장편 SF소설",
    description: "다른 몸에서 눈을 떴다. 그런데 나는 여전히 나일까.",
    images: ["/consciousness-cover.png"],
  },
};

export default function Page() {
  return <NovelDetailPage />;
}
