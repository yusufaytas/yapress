import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { PaginationNav } from "@/components/pagination-nav";
import { getPaginatedPosts, getPaginationParams } from "@/lib/content";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildMetadata, serializeJsonLd } from "@/lib/seo";
import { EMPTY_DYNAMIC_SEGMENT, ensureStaticParams } from "@/lib/staticParams";
import siteConfig from "@/site.config";

export const dynamicParams = false;

export function generateStaticParams() {
  return ensureStaticParams(getPaginationParams(undefined, 2), { page: EMPTY_DYNAMIC_SEGMENT });
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  const pageNumber = Number(page);
  const homeHeadline = siteConfig.tagline ?? "Latest Articles";

  return buildMetadata({
    title: `${homeHeadline} - Page ${pageNumber}`,
    description: `Page ${pageNumber} of the latest articles.`,
    pathname: `/page/${pageNumber}`,
    noIndex: !Number.isInteger(pageNumber) || pageNumber < 2
  });
}

export default async function PaginatedPostsPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const pageNumber = Number(page);
  const homeHeadline = siteConfig.tagline ?? "Latest Articles";

  if (!Number.isInteger(pageNumber) || pageNumber < 2) {
    notFound();
  }

  const pagination = getPaginatedPosts(pageNumber);

  if (pageNumber > pagination.totalPages) {
    notFound();
  }

  const jsonLd = buildCollectionPageJsonLd(
    homeHeadline,
    `Page ${pageNumber} of the latest articles.`,
    `/page/${pageNumber}`,
    pagination.posts.length
  );
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: `Page ${pageNumber}` }
  ]);

  return (
    <div className="container section stack">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="taxonomy-header">
        <h1 className="page-title">{homeHeadline}</h1>
        <p className="lede">Page {pageNumber} of the latest articles.</p>
      </div>
      <div className="post-list">
        {pagination.posts.map((post) => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
      <PaginationNav currentPage={pagination.currentPage} totalPages={pagination.totalPages} firstPageHref="/" />
    </div>
  );
}
