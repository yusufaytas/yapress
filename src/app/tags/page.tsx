import type { Metadata } from "next";
import Link from "next/link";

import { getTagBuckets } from "@/lib/content";
import { buildMetadata, buildItemListJsonLd, serializeJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Tags",
  description: "Browse posts by tag.",
  pathname: "/tags"
});

export default function TagsPage() {
  const allBuckets = getTagBuckets();
  
  // Show only top 50 tags sorted by post count
  const buckets = allBuckets
    .sort((a, b) => b.posts.length - a.posts.length)
    .slice(0, 50);
  
  const jsonLd = buildItemListJsonLd(
    "Tags",
    "Browse posts by tag.",
    "/tags",
    buckets.map((bucket) => ({
      name: `#${bucket.title}`,
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
          <h1 className="page-title">Tags</h1>
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
