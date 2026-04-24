import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { buildBreadcrumbJsonLd, buildMetadata, buildCollectionPageJsonLd, serializeJsonLd } from "@/lib/seo";
import { getCategoryBuckets, getPostsByCategory } from "@/lib/content";
import { EMPTY_DYNAMIC_SEGMENT, ensureStaticParams } from "@/lib/staticParams";
import { isTaxonomyBucketIndexable } from "@/lib/taxonomyIndexing";

export const dynamicParams = false;

export async function generateStaticParams() {
  return ensureStaticParams(
    getCategoryBuckets()
    .filter((bucket) => bucket.posts.length > 0)
    .map((bucket) => ({ slug: bucket.slug })),
    { slug: EMPTY_DYNAMIC_SEGMENT }
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const bucket = getCategoryBuckets().find((item) => item.slug === slug);
  const pageTitle = bucket ? `${bucket.title} Articles` : "Category";
  return buildMetadata({
    title: pageTitle,
    description: bucket?.description ?? "Posts in this category.",
    pathname: `/categories/${slug}`,
    keywords: bucket ? [bucket.title, "category"] : [],
    noIndex: bucket ? !isTaxonomyBucketIndexable("categories", bucket) : true,
    datePublished: bucket?.datePublished,
    dateModified: bucket?.dateModified
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bucket = getCategoryBuckets().find((item) => item.slug === slug);

  if (!bucket) {
    notFound();
  }

  const posts = getPostsByCategory(bucket.slug);
  const pageTitle = `${bucket.title} Articles`;
  const jsonLd = buildCollectionPageJsonLd(
    pageTitle,
    bucket.description ?? `Posts in the ${bucket.title} category.`,
    bucket.permalink,
    posts.length,
    bucket.datePublished,
    bucket.dateModified
  );
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Browse Articles by Category", url: "/categories" },
    { name: pageTitle }
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
        <h1 className="page-title">{pageTitle}</h1>
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
