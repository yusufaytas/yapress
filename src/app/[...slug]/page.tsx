import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { ArticleOptions } from "@/components/article-options";
import { ContentRenderer } from "@/components/content-renderer";
import { ExpandableTaxonomyList } from "@/components/expandable-taxonomy-list";
import { SocialShare } from "@/components/social-share";
import { TaxonomyPill } from "@/components/taxonomy-pill";
import { TextHighlighter } from "@/components/text-highlighter";
import {
  getAllPages,
  getAllPosts,
  getDateArchiveBuckets,
  getPageByPermalink,
  getPostByPermalink,
  getPostsByDateArchive
} from "@/lib/content";
import { getMediaAssetByPagePath, getMediaAssets } from "@/lib/media";
import { getPluginComponents } from "@/lib/plugins";
import { buildCollectionPageJsonLd, buildMediaObjectJsonLd, buildMetadata, buildPostMetadata, buildPageMetadata, buildContentJsonLd, formatDisplayDate, serializeJsonLd } from "@/lib/seo";
import { getAbsoluteUrl } from "@/lib/site";
import { joinPath } from "@/lib/urls";

export const dynamicParams = false;

export async function generateStaticParams() {
  const params = [
    ...getAllPages()
      .filter((page) => page.permalink !== "/")
      .map((page) => ({ slug: page.permalink.split("/").filter(Boolean) })),
    ...getAllPosts().map((post) => ({ slug: post.permalink.split("/").filter(Boolean) })),
    ...getDateArchiveBuckets().map((bucket) => ({ slug: bucket.permalink.split("/").filter(Boolean) })),
    ...getMediaAssets().map((asset) => ({ slug: asset.pagePath.split("/").filter(Boolean) }))
  ];
  
  // Filter out any invalid params (empty slug arrays)
  const validParams = params.filter(p => p.slug && p.slug.length > 0);
  
  // For static export, Next.js requires at least one param even if it will 404
  if (validParams.length === 0) {
    return [{ slug: ['_empty'] }];
  }
  
  return validParams;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const pathname = joinPath(...slug);

  const post = getPostByPermalink(pathname);
  if (post) {
    return buildPostMetadata(post);
  }

  const mediaAsset = getMediaAssetByPagePath(pathname);
  if (mediaAsset) {
    return buildMetadata({
      title: mediaAsset.assetPath.split("/").pop() ?? "Media",
      description: `Media attachment for ${mediaAsset.assetPath}.`,
      pathname: mediaAsset.pagePath,
      image: mediaAsset.contentType.startsWith("image/") ? mediaAsset.assetPath : undefined,
      keywords: ["media", "attachment", mediaAsset.contentType]
    });
  }

  const archiveBucket = getDateArchiveBuckets().find((bucket) => bucket.permalink === pathname);
  if (archiveBucket) {
    return buildMetadata({
      title: `${archiveBucket.year}-${archiveBucket.month} Archive`,
      description: `Browse all posts published in ${archiveBucket.year}-${archiveBucket.month}.`,
      pathname: archiveBucket.permalink,
      keywords: ["archive", archiveBucket.year, archiveBucket.month],
      datePublished: archiveBucket.datePublished,
      dateModified: archiveBucket.dateModified
    });
  }

  const page = getPageByPermalink(pathname);
  if (page) {
    return buildPageMetadata(page);
  }

  return {
    title: "Page Not Found"
  };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const pathname = joinPath(...slug);

  const post = getPostByPermalink(pathname);
  if (post) {
    const postUrl = getAbsoluteUrl(post.permalink);
    const jsonLd = buildContentJsonLd(post);

    return (
      <div className="container section stack">
        <TextHighlighter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <article className="article">
          <header className="article-header stack">
            <div className="article-header-top">
              <div className="article-kicker">
                Post
                {post.draft && process.env.NODE_ENV === "development" && (
                  <span className="draft-badge">Draft</span>
                )}
              </div>
              <ArticleOptions />
            </div>
            <h2 className="article-title">{post.title}</h2>
            <div className="meta">
              Published {formatDisplayDate(post.datePublished, post.locale)} · {post.readingTime.text}
            </div>
            {getPluginComponents('beforePost', { post })}
          </header>
          <div lang={post.language}>
            <ContentRenderer source={post.content} />
          </div>
          <footer className="article-footer stack">
            {getPluginComponents('afterPost', { post })}
            <div className="article-meta-grid">
              {post.categories.length > 0 ? (
                <div className="article-meta-group">
                  <div className="article-taxonomy-label">Categories</div>
                  <ExpandableTaxonomyList items={post.categories} />
                </div>
              ) : null}
              {post.series.length > 0 ? (
                <div className="article-meta-group">
                  <div className="article-taxonomy-label">Series</div>
                  <ExpandableTaxonomyList items={post.series} />
                </div>
              ) : null}
              {post.tags.length > 0 ? (
                <div className="article-meta-group">
                  <div className="article-taxonomy-label">Tags</div>
                  <ExpandableTaxonomyList items={post.tags} labelPrefix="#" />
                </div>
              ) : null}
            </div>
            <SocialShare
              title={post.title}
              url={postUrl}
              description={post.description ?? post.excerpt}
            />
          </footer>
        </article>
      </div>
    );
  }

  const mediaAsset = getMediaAssetByPagePath(pathname);
  if (mediaAsset) {
    const jsonLd = buildMediaObjectJsonLd(mediaAsset);

    return (
      <div className="container section stack">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <article className="prose-wrap stack">
          <h1 className="page-title">{mediaAsset.assetPath.split("/").pop()}</h1>
          <p className="lede">
            <a href={mediaAsset.assetPath} className="muted-link">{mediaAsset.assetPath}</a>
            {" · "}
            {mediaAsset.contentType}
            {" · "}
            {Intl.NumberFormat("en").format(mediaAsset.size)} bytes
          </p>
          {mediaAsset.contentType.startsWith("image/") ? (
            <span
              className={`article-image${mediaAsset.contentType === "image/png" ? " article-image--png" : ""}`}
            >
              {mediaAsset.width && mediaAsset.height ? (
                <Image
                  src={mediaAsset.assetPath}
                  alt={mediaAsset.assetPath.split("/").pop() ?? "Media asset"}
                  width={mediaAsset.width}
                  height={mediaAsset.height}
                  sizes="(max-width: 48rem) 100vw, 48rem"
                  unoptimized={mediaAsset.contentType === "image/svg+xml"}
                  style={{ width: "100%", height: "auto", maxWidth: "100%" }}
                />
              ) : null}
            </span>
          ) : null}
          <div className="stack">
            <h2>Used In</h2>
            <div className="pill-row">
              {mediaAsset.references.map((reference) => (
                <TaxonomyPill
                  key={`${mediaAsset.assetPath}-${reference.permalink}`}
                  href={reference.permalink}
                  label={reference.title}
                />
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  const archiveBucket = getDateArchiveBuckets().find((bucket) => bucket.permalink === pathname);
  if (archiveBucket) {
    const posts = getPostsByDateArchive(archiveBucket.year, archiveBucket.month);
    const jsonLd = buildCollectionPageJsonLd(
      `${archiveBucket.year}-${archiveBucket.month} Archive`,
      `Browse all posts published in ${archiveBucket.year}-${archiveBucket.month}.`,
      archiveBucket.permalink,
      posts.length,
      archiveBucket.datePublished,
      archiveBucket.dateModified
    );

    return (
      <div className="container section stack">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <h1 className="page-title">{archiveBucket.year}-{archiveBucket.month}</h1>
        <p className="lede">Posts published in {archiveBucket.year}-{archiveBucket.month}.</p>
        <div className="post-list">
          {posts.map((entry) => (
            <ArticleCard key={entry.slug} post={entry} />
          ))}
        </div>
      </div>
    );
  }

  const page = getPageByPermalink(pathname);

  if (!page) {
    notFound();
  }

  const jsonLd = buildContentJsonLd(page);

  return (
    <div className="container section">
      <TextHighlighter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <article className="prose-wrap prose-wrap--editorial stack content-page" lang={page.language}>
        <h1 className="page-title">{page.title}</h1>
        {page.description ? <p className="lede">{page.description}</p> : null}
        <ContentRenderer source={page.content} />
        {page.datePublished && (
          <div className="meta" style={{ textAlign: 'right' }}>
            Published {formatDisplayDate(page.datePublished, page.locale)}
            {page.dateModified && page.dateModified.getTime() !== page.datePublished.getTime() && (
              <> · Updated {formatDisplayDate(page.dateModified, page.locale)}</>
            )}
          </div>
        )}
      </article>
    </div>
  );
}
