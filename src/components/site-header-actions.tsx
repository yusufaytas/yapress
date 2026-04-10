"use client";

import Link from "next/link";
import { useState } from "react";

import { Search } from "@/components/search";
import siteConfig from "@/site.config";

type SearchPost = {
  title: string
  slug: string
  excerpt: string
  date?: string
  categories: string[]
  permalink: string
}

type SiteHeaderActionsProps = {
  searchPosts: SearchPost[]
}

export function SiteHeaderActions({ searchPosts }: SiteHeaderActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="header-actions">
      <button
        className="menu-toggle"
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className="menu-toggle__line"></span>
        <span className="menu-toggle__line"></span>
        <span className="menu-toggle__line"></span>
      </button>
      <nav className={`nav ${isMenuOpen ? "nav--open" : ""}`} aria-label="Primary">
        {(siteConfig.headerLinks ?? []).map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="header-search">
        <Search posts={searchPosts} />
      </div>
    </div>
  );
}
