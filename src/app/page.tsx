import type { Metadata } from "next";

import { ArticleCard } from "@/components/article-card";
import { PaginationNav } from "@/components/pagination-nav";
import { getPaginatedPosts } from "@/lib/content";
import { buildMetadata, buildCollectionPageJsonLd, serializeJsonLd } from "@/lib/seo";
import siteConfig from "@/site.config";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.title} | ${siteConfig.tagline}`,
  description: siteConfig.description,
  pathname: "/"
});

export default function HomePage() {
  const pagination = getPaginatedPosts(1);
  const posts = pagination.posts;
  const homeHeadline = siteConfig.tagline ?? "Latest Articles";
  const jsonLd = buildCollectionPageJsonLd(
    homeHeadline,
    "Latest posts from the site archive.",
    "/",
    posts.length
  );

  return (
    <div className="container">
      <section className="section stack">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <div className="taxonomy-header">
          <h1 className="page-title">{homeHeadline}</h1>
          <p className="lede">{siteConfig.description}</p>
        </div>
        <div className="post-list">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
        <PaginationNav currentPage={pagination.currentPage} totalPages={pagination.totalPages} firstPageHref="/" />
      </section>
    </div>
  );
}
