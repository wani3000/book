"use client";
import Link from "next/link";
import { ArrowRight, Briefcase, Code, List, SquaresFour, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const menuCategories = [
  { href: "/#all-books-title", label: "전체", icon: SquaresFour },
  { href: "/?category=커리어#all-books-title", label: "커리어", icon: Briefcase },
  { href: "/?category=개발%20%C2%B7%20생산성#all-books-title", label: "개발 · 생산성", icon: Code },
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
          <aside className="mobile-book-drawer" id="mobile-book-drawer" role="dialog" aria-modal="true" aria-label="전자책 카테고리 선택">
            <div className="mobile-drawer-head">
              <button ref={closeButton} type="button" aria-label="전자책 메뉴 닫기" onClick={() => setOpen(false)}><X size={24} weight="bold" /></button>
            </div>
            <nav className="mobile-category-menu" aria-label="전자책 카테고리">
              {menuCategories.map(({ href, label, icon: Icon }) => (
                <Link href={href} key={label} onClick={() => setOpen(false)}>
                  <span className="mobile-category-icon"><Icon size={23} weight="duotone" aria-hidden="true" /></span>
                  <strong>{label}</strong>
                  <ArrowRight size={18} weight="bold" />
                </Link>
              ))}
            </nav>
          </aside>
        </div>,
        document.body,
      )}
    </div>
  );
}
