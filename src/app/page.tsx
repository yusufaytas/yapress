import { ArticleCard } from "@/components/article-card";
import { PaginationNav } from "@/components/pagination-nav";
import { getPaginatedPosts } from "@/lib/content";
import { buildCollectionPageJsonLd, serializeJsonLd } from "@/lib/seo";

export default function HomePage() {
  const pagination = getPaginatedPosts(1);
  const posts = pagination.posts;
  const jsonLd = buildCollectionPageJsonLd(
    "Home",
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
