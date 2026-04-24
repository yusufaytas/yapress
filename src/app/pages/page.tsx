import type { Metadata } from "next";
import Link from "next/link";

import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildMetadata, serializeJsonLd } from "@/lib/seo";
import { getAllPages } from "@/lib/content";

export const metadata: Metadata = buildMetadata({
  title: "Pages",
  description: "General site pages and archive navigation.",
  pathname: "/pages"
});

export default function PagesIndexPage() {
  const pages = getAllPages().filter((page) => page.permalink !== "/");
  
  const jsonLd = buildCollectionPageJsonLd(
    "Pages",
    "General site pages and archive navigation.",
    "/pages",
    pages.length
  );
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Pages" }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="container section stack">
        <div className="taxonomy-header">
          <h1 className="page-title">Pages</h1>
          <p className="lede">Explore site pages and resources</p>
        </div>
        <div className="taxonomy-grid">
          {pages.map((page) => (
            <Link key={page.slug} href={page.permalink} className="taxonomy-card">
              <div className="taxonomy-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="taxonomy-card__content">
                <h2 className="taxonomy-card__title">{page.title}</h2>
                {page.description ? (
                  <p className="taxonomy-card__description">{page.description}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
