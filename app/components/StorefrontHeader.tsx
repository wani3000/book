"use client";

import Link from "next/link";
import { BookOpen, MagnifyingGlass } from "@phosphor-icons/react";
import GoogleAccount from "./GoogleAccount";
import MobileBookMenu from "./MobileBookMenu";

type StorefrontHeaderProps = {
  query?: string;
  onQueryChange?: (value: string) => void;
};

export default function StorefrontHeader({ query, onQueryChange }: StorefrontHeaderProps) {
  return (
    <header className="class-header">
      <div className="class-header-main">
        <div className="class-brand-cluster">
          <MobileBookMenu />
          <Link className="class-logo" href="/" aria-label="PHILIP BOOKS 홈">
            <BookOpen weight="fill" size={29} aria-hidden="true" />
            <strong>PHILIP BOOKS</strong>
          </Link>
        </div>
        <form className="class-search" action="/" method="get" role="search">
          <label className="sr-only" htmlFor="storefront-search">전자책 검색</label>
          <input
            id="storefront-search"
            name="q"
            value={query}
            onChange={onQueryChange ? (event) => onQueryChange(event.target.value) : undefined}
            placeholder="관심 주제, 전자책, 경험을 검색해보세요"
          />
          <button type="submit" aria-label="검색"><MagnifyingGlass size={22} weight="bold" aria-hidden="true" /></button>
        </form>
        <div className="class-account">
          <Link href="/#books">전체 전자책</Link>
          <GoogleAccount />
        </div>
      </div>
    </header>
  );
}
