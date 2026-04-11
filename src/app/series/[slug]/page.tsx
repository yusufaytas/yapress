import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { buildMetadata, buildCollectionPageJsonLd, serializeJsonLd } from "@/lib/seo";
import { getPostsBySeries, getSeriesBuckets } from "@/lib/content";

import seriesRegistry from "@/content/series";

export const dynamicParams = false;

export async function generateStaticParams() {
  return seriesRegistry.map((series) => ({ slug: series.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const bucket = getSeriesBuckets().find((item) => item.slug === slug);
  return buildMetadata({
    title: bucket?.title ?? "Series",
    description: bucket?.description ?? "Posts in this series.",
    pathname: `/series/${slug}`,
    keywords: bucket ? [bucket.title, "series"] : ["series"]
  });
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bucket = getSeriesBuckets().find((item) => item.slug === slug);

  if (!bucket) {
    notFound();
  }

  const posts = getPostsBySeries(bucket.slug);
  const jsonLd = buildCollectionPageJsonLd(
    bucket.title,
    bucket.description ?? `Posts in the ${bucket.title} series.`,
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
