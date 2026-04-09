import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata, buildItemListJsonLd, serializeJsonLd } from "@/lib/seo";
import { getSeriesBuckets } from "@/lib/content";

export const metadata: Metadata = buildMetadata({
  title: "Series",
  description: "Browse ordered post series.",
  pathname: "/series"
});

export default function SeriesPage() {
  const buckets = getSeriesBuckets();
  
  const jsonLd = buildItemListJsonLd(
    "Series",
    "Browse ordered post series.",
    "/series",
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
          <h1 className="page-title">Series</h1>
          <p className="lede">Follow multi-part stories and tutorials</p>
        </div>
        <div className="taxonomy-grid">
          {buckets.map((bucket) => (
            <Link key={bucket.slug} href={bucket.permalink} className="taxonomy-card taxonomy-card--series">
              <div className="taxonomy-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 12H15M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="taxonomy-card__content">
                <h2 className="taxonomy-card__title">{bucket.title}</h2>
                {bucket.description ? (
                  <p className="taxonomy-card__description">{bucket.description}</p>
                ) : null}
                <div className="taxonomy-card__count">
                  {bucket.posts.length} {bucket.posts.length === 1 ? 'part' : 'parts'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
