import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { PaginationNav } from "@/components/pagination-nav";
import { getPaginatedPosts, getPaginationParams } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getPaginationParams(undefined, 2);
}

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  const pageNumber = Number(page);

  return buildMetadata({
    title: `Page ${pageNumber}`,
    description: `Post archive page ${pageNumber}.`,
    pathname: `/page/${pageNumber}`
  });
}

export default async function PaginatedPostsPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const pageNumber = Number(page);

  if (!Number.isInteger(pageNumber) || pageNumber < 2) {
    notFound();
  }

  const pagination = getPaginatedPosts(pageNumber);

  if (pageNumber > pagination.totalPages) {
    notFound();
  }

  return (
    <div className="container section stack">
      <div className="post-list">
        {pagination.posts.map((post) => (
          <ArticleCard key={post.slug} post={post} />
        ))}
      </div>
      <PaginationNav currentPage={pagination.currentPage} totalPages={pagination.totalPages} firstPageHref="/" />
    </div>
  );
}
