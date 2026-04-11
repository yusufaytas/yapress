import Image from "next/image";
import Link from "next/link";
import type { PropsWithChildren } from "react";

import { SiteHeaderActions } from "@/components/site-header-actions";
import { getPluginComponents } from "@/lib/plugins";
import siteConfig from "@/site.config";

function normalizePublicAssetPath(src: string) {
  return src.startsWith("/") ? src : `/${src}`;
}

export function SiteShell({ children }: PropsWithChildren) {
  return (
    <div className="shell">
      {getPluginComponents("bodyStart")}
      <header className="site-header">
        <div className="container">
          {getPluginComponents("headerStart")}
          <div className="site-header-row">
            <div className="site-banner">
              <div className="site-banner__main">
                <Link href="/" className="brand-wrap">
                  {siteConfig.logo ? (
                    <Image
                      src={normalizePublicAssetPath(siteConfig.logo.src)}
                      alt={siteConfig.logo.alt ?? `${siteConfig.title} logo`}
                      width={siteConfig.logo.width ?? 400}
                      height={siteConfig.logo.height ?? 400}
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
                <Image
                  src={normalizePublicAssetPath(siteConfig.bannerImage.src)}
                  alt={siteConfig.bannerImage.alt ?? `${siteConfig.title} banner`}
                  fill
                  sizes="(min-width: 64rem) 600px, 100vw"
                  className="site-banner-image"
                />
              </div>
            ) : null}
            <SiteHeaderActions />
          </div>
          {getPluginComponents("headerEnd")}
          <div className="site-divider" />
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer-wrap">
        {getPluginComponents("footerStart")}
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
        {getPluginComponents("footerEnd")}
      </footer>
      {getPluginComponents("popup")}
      {getPluginComponents("bodyEnd")}
    </div>
  );
}
