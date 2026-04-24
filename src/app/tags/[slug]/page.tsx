import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { buildBreadcrumbJsonLd, buildMetadata, buildCollectionPageJsonLd, serializeJsonLd } from "@/lib/seo";
import { getPostsByTag, getTagBuckets } from "@/lib/content";
import { EMPTY_DYNAMIC_SEGMENT, ensureStaticParams } from "@/lib/staticParams";
import { isTaxonomyBucketIndexable } from "@/lib/taxonomyIndexing";

export const dynamicParams = false;

export async function generateStaticParams() {
  return ensureStaticParams(
    getTagBuckets()
    .filter((bucket) => bucket.posts.length > 0)
    .map((bucket) => ({ slug: bucket.slug })),
    { slug: EMPTY_DYNAMIC_SEGMENT }
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const bucket = getTagBuckets().find((item) => item.slug === slug);
  const pageTitle = bucket ? `Articles tagged with ${bucket.title}` : "Tag";
  return buildMetadata({
    title: pageTitle,
    description: bucket?.description ?? (bucket ? `Posts tagged with ${bucket.title}.` : "Posts grouped by tag."),
    pathname: `/tags/${slug}`,
    keywords: bucket ? [bucket.title, "tag"] : [],
    noIndex: bucket ? !isTaxonomyBucketIndexable("tags", bucket) : true,
    datePublished: bucket?.datePublished,
    dateModified: bucket?.dateModified
  });
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bucket = getTagBuckets().find((item) => item.slug === slug);

  if (!bucket) {
    notFound();
  }

  const posts = getPostsByTag(bucket.slug);
  const pageTitle = `Articles tagged with ${bucket.title}`;
  const jsonLd = buildCollectionPageJsonLd(
    pageTitle,
    bucket.description ?? `Posts tagged with ${bucket.title}.`,
    bucket.permalink,
    posts.length,
    bucket.datePublished,
    bucket.dateModified
  );
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Browse Articles by Tag", url: "/tags" },
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
