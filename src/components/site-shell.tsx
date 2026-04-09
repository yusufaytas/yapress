"use client";

import Link from "next/link";
import type { PropsWithChildren } from "react";
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

type SiteShellProps = PropsWithChildren<{
  searchPosts?: SearchPost[]
}>

export function SiteShell({ children, searchPosts = [] }: SiteShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="shell">
      <header className="site-header">
        <div className="container">
          <div className="site-header-row">
            <div className="site-banner">
              <div className="site-banner__main">
                <Link href="/" className="brand-wrap">
                  {siteConfig.logo ? (
                    <img
                      src={siteConfig.logo.src}
                      alt={siteConfig.logo.alt ?? `${siteConfig.title} logo`}
                      className="site-logo"
                    />
                  ) : null}
                  <span className="brand">{siteConfig.title}</span>
                </Link>
                {siteConfig.tagline ? <p className="site-tagline">{siteConfig.tagline}</p> : null}
              </div>
            </div>
            {siteConfig.bannerImage ? (
              <div className="site-banner-image-wrap">
                <img
                  src={siteConfig.bannerImage.src}
                  alt={siteConfig.bannerImage.alt ?? `${siteConfig.title} banner`}
                  className="site-banner-image"
                />
              </div>
            ) : null}
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
          </div>
          <div className="site-divider" />
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer-wrap">
        <div className="container site-footer">
          <div className="site-footer__column site-footer__column--brand">
            <div className="site-kicker">{siteConfig.title}</div>
            {siteConfig.tagline ? <p className="site-tagline">{siteConfig.tagline}</p> : null}
          </div>
          {(siteConfig.footerColumns ?? []).map((column) => (
            <div key={column.title} className="site-footer__column">
              <div className="site-kicker">{column.title}</div>
              <nav className="footer-nav" aria-label={column.title}>
                {column.links.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
          {siteConfig.externalLinks && siteConfig.externalLinks.length > 0 ? (
            <div className="site-footer__column">
              <div className="site-kicker">Elsewhere</div>
              <nav className="footer-nav" aria-label="External links">
                {siteConfig.externalLinks.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
        <div className="container site-footer__bottom">
          <span>Copyright © {new Date().getFullYear()} {siteConfig.title}</span>
          <span className="site-footer__separator">·</span>
          <span>All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}
