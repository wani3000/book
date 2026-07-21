"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ArrowRight, List, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const menuBooks = [
  {
    href: "/codex",
    title: "아이디어를 서비스로 바꾸는 Codex 사용법",
    meta: "AI 서비스 · 필립",
    image: "/ebook-cover.png",
    accent: "lime",
  },
  {
    href: "/career",
    title: "커리어도 디자인할 수 있습니다",
    meta: "UI/UX 디자인 · 필립",
    image: "/career-cover.png",
    accent: "blue",
  },
  {
    href: "/jane",
    title: "승무원 다음은 IT였습니다",
    meta: "커리어 전환 · 제인",
    image: "/jane-cover.png",
    accent: "burgundy",
  },
];

export default function MobileBookMenu() {
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="mobile-book-menu">
      <button
        className="mobile-menu-trigger"
        type="button"
        aria-label="전자책 메뉴 열기"
        aria-expanded={open}
        aria-controls="mobile-book-drawer"
        onClick={() => setOpen(true)}
      >
        <List size={24} weight="bold" />
      </button>

      {open && createPortal(
        <div className="mobile-book-overlay">
          <aside className="mobile-book-drawer" id="mobile-book-drawer" role="dialog" aria-modal="true" aria-label="전자책 선택">
            <div className="mobile-drawer-head">
              <button ref={closeButton} type="button" aria-label="전자책 메뉴 닫기" onClick={() => setOpen(false)}><X size={24} weight="bold" /></button>
            </div>
            <nav aria-label="전자책 3권">
              {menuBooks.map((book, index) => (
                <Link href={book.href} key={book.href} onClick={() => setOpen(false)}>
                  <span className={`mobile-menu-cover ${book.accent}`}><img src={book.image} alt="" /></span>
                  <span><small>BOOK 0{index + 1}</small><strong>{book.title}</strong><em>{book.meta}</em></span>
                  <ArrowRight size={18} weight="bold" />
                </Link>
              ))}
            </nav>
            <Link className="mobile-menu-all" href="/#books" onClick={() => setOpen(false)}>전체 전자책 보기 <ArrowRight size={17} weight="bold" /></Link>
          </aside>
        </div>,
        document.body,
      )}
    </div>
  );
}
