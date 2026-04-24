import type { Metadata } from "next";
import Link from "next/link";

import { getTagBuckets } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildMetadata, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Browse Articles by Tag",
  description: "Browse posts by tag.",
  pathname: "/tags"
});

export default function TagsPage() {
  const allBuckets = getTagBuckets();
  
  // Show only top 50 tags sorted by post count
  const buckets = allBuckets
    .sort((a, b) => b.posts.length - a.posts.length)
    .slice(0, 50);
  
  const jsonLd = buildCollectionPageJsonLd(
    "Browse Articles by Tag",
    "Browse posts by tag.",
    "/tags",
    buckets.length
  );
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Browse Articles by Tag" }
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
          <h1 className="page-title">Browse Articles by Tag</h1>
          <p className="lede">Discover posts by keywords and topics</p>
        </div>
        <div className="tag-cloud">
          {buckets.map((bucket) => (
            <Link key={bucket.slug} href={bucket.permalink} className="tag-cloud__item">
              <span className="tag-cloud__label" title={bucket.description}>{`#${bucket.title}`}</span>
              <span className="tag-cloud__count">{bucket.posts.length}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
