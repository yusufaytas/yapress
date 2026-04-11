import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { buildMetadata, buildCollectionPageJsonLd, serializeJsonLd } from "@/lib/seo";
import { getCategoryBuckets, getPostsByCategory } from "@/lib/content";

export async function generateStaticParams() {
  return getCategoryBuckets().map((bucket) => ({ slug: bucket.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const bucket = getCategoryBuckets().find((item) => item.slug === slug);
  return buildMetadata({
    title: bucket?.title ?? "Category",
    description: bucket?.description ?? "Posts in this category.",
    pathname: `/categories/${slug}`,
    keywords: bucket ? [bucket.title, "category"] : []
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bucket = getCategoryBuckets().find((item) => item.slug === slug);

  if (!bucket) {
    notFound();
  }

  const posts = getPostsByCategory(bucket.slug);
  const jsonLd = buildCollectionPageJsonLd(
    bucket.title,
    bucket.description ?? `Posts in the ${bucket.title} category.`,
    bucket.permalink,
    posts.length
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="container section stack">
        <h1 className="page-title">{bucket.title}</h1>
        {bucket.description ? <p className="lede">{bucket.description}</p> : null}
        <div className="post-list">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </>
  );
}
