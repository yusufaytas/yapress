import type { Metadata } from "next";
import Link from "next/link";

import { getCategoryBuckets } from "@/lib/content";
import { buildMetadata, buildItemListJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Categories",
  description: "Browse posts by category.",
  pathname: "/categories"
});

export default function CategoriesPage() {
  const buckets = getCategoryBuckets();
  
  const jsonLd = buildItemListJsonLd(
    "Categories",
    "Browse posts by category.",
    "/categories",
    buckets.map((bucket) => ({
      name: bucket.title,
      url: bucket.permalink,
      description: bucket.description
    }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="container section stack">
        <div className="taxonomy-header">
          <h1 className="page-title">Categories</h1>
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
