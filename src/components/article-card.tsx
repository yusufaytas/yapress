import Link from "next/link";

import type { ContentEntry } from "@/types/content";
import { formatDisplayDate } from "@/lib/seo";

export function ArticleCard({ post }: { post: ContentEntry }) {
  return (
    <article className="post-preview">
      <div className="post-preview__meta">
        <span>{formatDisplayDate(post.datePublished)}</span>
        <span className="post-preview__dot" aria-hidden="true">
          ·
        </span>
        <span>{post.readingTime.text}</span>
      </div>
      <div className="post-preview__content">
        <h2 className="post-preview__title">
          <Link href={post.permalink}>{post.title}</Link>
        </h2>
        {post.excerpt ? <p className="lede">{post.excerpt}</p> : null}
      </div>
    </article>
  );
}
