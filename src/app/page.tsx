import { ArticleCard } from "@/components/article-card";
import { PaginationNav } from "@/components/pagination-nav";
import { getAllPosts, getPaginatedPosts } from "@/lib/content";

export default function HomePage() {
  const pagination = getPaginatedPosts(1);
  const posts = pagination.posts;

  return (
    <div className="container">
      <section className="section stack">
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
