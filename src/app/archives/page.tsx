import type { Metadata } from "next";
import Link from "next/link";

import { getDateArchiveBuckets } from "@/lib/content";
import { buildMetadata, buildItemListJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Archives",
  description: "Browse the full publishing archive month by month.",
  pathname: "/archives",
  keywords: ["archives", "post archive", "monthly archive"]
});

export default function ArchivesPage() {
  const archives = getDateArchiveBuckets();

  const jsonLd = buildItemListJsonLd(
    "Archives",
    "Browse the full publishing archive month by month.",
    "/archives",
    archives.map((bucket) => ({
      name: `${bucket.year}-${bucket.month}`,
      url: bucket.permalink,
      description: `${bucket.posts.length} ${bucket.posts.length === 1 ? "post" : "posts"}`
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
          <h1 className="page-title">Archives</h1>
          <p className="lede">Browse the published archive month by month</p>
        </div>
        <div className="taxonomy-grid">
          {archives.map((bucket) => (
            <Link key={`${bucket.year}-${bucket.month}`} href={bucket.permalink} className="taxonomy-card">
              <div className="taxonomy-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V7M16 3V7M4 11H20M6 21H18C19.1046 21 20 20.1046 20 19V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="taxonomy-card__content">
                <h2 className="taxonomy-card__title">{bucket.year}-{bucket.month}</h2>
                <p className="taxonomy-card__description">Posts published during this month.</p>
                <div className="taxonomy-card__count">
                  {bucket.posts.length} {bucket.posts.length === 1 ? "post" : "posts"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
