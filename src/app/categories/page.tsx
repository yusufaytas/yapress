import type { Metadata } from "next";
import Link from "next/link";

import { getCategoryBuckets } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Browse Articles by Category",
  description: "Browse posts by category.",
  pathname: "/categories"
});

export default function CategoriesPage() {
  const buckets = getCategoryBuckets().filter((bucket) => bucket.posts.length > 0);
  
  const jsonLd = buildCollectionPageJsonLd(
    "Browse Articles by Category",
    "Browse posts by category.",
    "/categories",
    buckets.length
  );
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Browse Articles by Category" }
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
          <h1 className="page-title">Browse Articles by Category</h1>
          <p className="lede">Explore posts organized by topic</p>
        </div>
        <div className="taxonomy-grid">
          {buckets.map((bucket) => (
            <Link key={bucket.slug} href={bucket.permalink} className="taxonomy-card">
              <div className="taxonomy-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="taxonomy-card__content">
                <h2 className="taxonomy-card__title">{bucket.title}</h2>
                {bucket.description ? (
                  <p className="taxonomy-card__description">{bucket.description}</p>
                ) : null}
                <div className="taxonomy-card__count">
                  {bucket.posts.length} {bucket.posts.length === 1 ? 'post' : 'posts'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
