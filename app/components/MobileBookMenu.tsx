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
  const triggerButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerButton.current;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.getElementById("main-content")?.setAttribute("inert", "");
    closeButton.current?.focus();
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const focusable = [...(drawer.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])') ?? [])];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", handleKeys);
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      document.getElementById("main-content")?.removeAttribute("inert");
      window.removeEventListener("keydown", handleKeys);
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="mobile-book-menu">
      <button
        ref={triggerButton}
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
        <div className="mobile-book-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <aside ref={drawer} className="mobile-book-drawer" id="mobile-book-drawer" role="dialog" aria-modal="true" aria-label="전자책 카테고리 선택">
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
