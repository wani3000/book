import type { Metadata } from "next";
import ClassDetailPage, { type DetailBook } from "../components/ClassDetailPage";

export const metadata: Metadata = { title: "아이디어를 서비스로 바꾸는 Codex 사용법", description: "IT 초보자가 Codex로 기획, 개발, 배포, 결제, SEO와 자동화까지 완성하는 230쪽 실전 전자책.", alternates: { canonical: "/codex" }, openGraph: { title: "아이디어를 서비스로 바꾸는 Codex 사용법", images: ["/ebook-cover.png"] }, twitter: { card: "summary_large_image", images: ["/ebook-cover.png"] } };

const book: DetailBook = {
  product: "codex", category: "AI · 개발 · 생산성", title: "아이디어를 서비스로 바꾸는 Codex 사용법", subtitle: "폴더 생성부터 배포·결제·SEO까지 혼자 완성하는 실전 가이드", creator: "필립", cover: "/ebook-cover.png", coverWidth: 1054, coverHeight: 1492, pages: "230쪽", chapters: "50단계 실전 + 경험편 24장", level: "완전 입문", theme: "orange",
  headline: "개발자를 기다리지 않고 내 서비스를 직접 출시하는 법", intro: "AI가 코드를 만들어주는 시대에도 폴더, GitHub, 서버, 배포, 결제 같은 단어 앞에서 멈추는 사람이 많습니다. 이 책은 완전한 IT 초보자가 Codex에 무엇을 부탁하고, 결과를 어떻게 확인하며, 실제 서비스로 연결하는지 처음부터 끝까지 안내합니다.", quote: "좋은 프롬프트 한 줄보다 중요한 것은 목표를 나누고, 결과를 확인하고, 다음 명령을 이어가는 힘입니다.",
  targets: [["아이디어는 있지만 개발을 모르는 분", "코드가 아니라 서비스 출시의 전체 순서부터 알고 싶은 분"], ["AI로 만들다 중간에 멈춘 분", "커밋·푸시·배포·서버 같은 용어에서 막혔던 분"], ["혼자 첫 서비스를 운영할 분", "로그인, 데이터, 결제, SEO와 홍보까지 직접 연결할 분"]],
  outcomes: [["Codex에 제대로 명령하는 법", "목표·맥락·제약·완료 조건을 담은 요청과 후속 명령을 익힙니다."], ["서비스를 출시하는 전체 흐름", "폴더에서 시작해 GitHub와 Vercel을 거쳐 실제 주소로 공개합니다."], ["운영에 필요한 기능 연결", "Supabase, 결제, 지도, 검색 등록, 광고와 자동화를 이해합니다."], ["실수를 줄이는 검증 습관", "코드를 몰라도 테스트 결과와 화면을 확인하고 수정시키는 방법을 배웁니다."]],
  curriculum: [["PART 01", "시작하기", "웹서비스 구조, 폴더, 터미널, Git과 GitHub를 초보자의 언어로 설명합니다."], ["PART 02", "Codex로 제작하기", "좋은 프롬프트, 화면 제작, 모바일 대응, 오류 수정과 접근성을 다룹니다."], ["PART 03", "서비스 기능 붙이기", "Supabase, 회원가입, 로그인, 데이터, 이미지와 관리자 기능을 연결합니다."], ["PART 04", "세상에 출시하기", "Vercel, GitHub Pages, 도메인, 결제, 지도와 카카오톡 연동을 진행합니다."], ["PART 05", "검색되고 성장하기", "SEO, 구글·네이버 검색 등록, AdSense와 Threads 자동화를 다룹니다."], ["PART 06", "서비스를 사업으로 만들기", "첫 고객, 반복 운영, B2B, 자동화와 매각까지 실제 경험을 정리합니다."]],
  included: ["230쪽 전체 PDF 전자책", "50개 압축형 Codex 실행 카드", "하나의 예약 서비스로 보는 50단계", "오류 실습·완료 증거 체크리스트", "모바일 청첩장·마리에카드·아파트구구·다니엘의 바이블 사례"],
  creatorTitle: "비개발자 AI 서비스 빌더", creatorBio: "필립은 모바일 청첩장과 부동산 정보 서비스 등 여러 제품을 직접 기획·디자인·운영해 왔습니다. 개발자가 아닌 사람이 AI와 함께 실제 서비스를 끝까지 완성할 때 필요한 판단과 시행착오를 이 책에 담았습니다.", creatorProof: ["모바일 청첩장 서비스 기획·디자인·마케팅·운영", "아파트 정보 서비스 직접 제작·운영", "AI 코딩 도구로 여러 웹서비스 출시"],
  faqs: [["코딩을 전혀 몰라도 읽을 수 있나요?", "네. 폴더와 파일이 무엇인지부터 설명하고, 각 단계에서 Codex에 입력할 문장을 제공합니다."], ["프롬프트만 모아둔 책인가요?", "아닙니다. 제작, 데이터, 배포, 결제, SEO와 운영을 하나의 실제 출시 흐름으로 연결합니다."], ["어떤 준비물이 필요한가요?", "인터넷이 연결된 컴퓨터와 Codex를 사용할 계정이면 시작할 수 있습니다."], ["전자책은 어떻게 받나요?", "결제가 확인되면 마이페이지에서 PDF를 바로 읽을 수 있습니다."]]
};

export default function Page() { return <ClassDetailPage book={book} />; }
