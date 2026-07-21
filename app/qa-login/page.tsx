import type { Metadata } from "next";
import QaLoginForm from "../components/QaLoginForm";

export const metadata: Metadata = {
  title: "QA 관리자 로그인",
  robots: { index: false, follow: false, nocache: true },
};

export default function QaLoginPage() {
  return <QaLoginForm />;
}
