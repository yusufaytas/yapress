import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { ContentRenderer } from "@/components/content-renderer";
import { RedirectPage } from "@/components/redirect-page";
import { SocialShare } from "@/components/social-share";
import { TaxonomyPill } from "@/components/taxonomy-pill";
import {
  getAllPages,
  getAllPosts,
  getContentRedirects,
  getDateArchiveBuckets,
  getPageByPermalink,
  getPostByPermalink,
  getPostsByDateArchive,
  getRedirectTarget
} from "@/lib/content";
import { getMediaAssetByPagePath, getMediaAssets } from "@/lib/media";
import { buildCollectionPageJsonLd, buildMediaObjectJsonLd, buildMetadata, buildPostMetadata, buildPageMetadata, buildContentJsonLd, formatDisplayDate, serializeJsonLd } from "@/lib/seo";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";
import { joinPath } from "@/lib/urls";

export function generateStaticParams() {
  return [
    ...getAllPages()
      .filter((page) => page.permalink !== "/")
      .map((page) => ({ slug: page.permalink.split("/").filter(Boolean) })),
    ...getAllPosts().map((post) => ({ slug: post.permalink.split("/").filter(Boolean) })),
    ...getDateArchiveBuckets().map((bucket) => ({ slug: bucket.permalink.split("/").filter(Boolean) })),
    ...getMediaAssets().map((asset) => ({ slug: asset.pagePath.split("/").filter(Boolean) })),
    ...getContentRedirects().map((redirect) => ({ slug: redirect.from.split("/").filter(Boolean) }))
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const pathname = joinPath(...slug);
  const redirectTarget = getRedirectTarget(pathname);

  if (redirectTarget) {
    return {
      title: "Redirecting",
      alternates: {
        canonical: getAbsoluteUrl(redirectTarget)
      },
      robots: {
        index: false,
        follow: true
      }
    };
  }

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
      keywords: ["media", "attachment", mediaAsset.contentType]
    });
  }

  const archiveBucket = getDateArchiveBuckets().find((bucket) => bucket.permalink === pathname);
  if (archiveBucket) {
    return buildMetadata({
      title: `${archiveBucket.year}-${archiveBucket.month} Archive`,
      description: `Browse all posts published in ${archiveBucket.year}-${archiveBucket.month}.`,
      pathname: archiveBucket.permalink,
      keywords: ["archive", archiveBucket.year, archiveBucket.month]
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
  const redirectTarget = getRedirectTarget(pathname);

  if (redirectTarget) {
    return <RedirectPage to={redirectTarget} />;
  }

  const post = getPostByPermalink(pathname);
  if (post) {
    const postUrl = getAbsoluteUrl(post.permalink);
    const jsonLd = buildContentJsonLd(post);
    
    return (
      <div className="container section stack">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        <article className="article">
          <header className="article-header stack">
            <div className="article-kicker">
              Post
              {post.draft && process.env.NODE_ENV === "development" && (
                <span className="draft-badge">Draft</span>
              )}
            </div>
            <h2 className="article-title">{post.title}</h2>
            <div className="meta">
              Published {formatDisplayDate(post.date, post.locale)} · {post.readingTime.text}
              {post.lastUpdated && post.lastUpdated !== post.date && (
                <> · Updated {formatDisplayDate(post.lastUpdated, post.locale)}</>
              )}
            </div>
          </header>
          <div lang={post.language}>
            <ContentRenderer source={post.content} />
          </div>
          <footer className="article-footer stack">
            <div className="article-meta-grid">
              {post.categories.length > 0 ? (
                <div className="article-meta-group">
                  <div className="article-taxonomy-label">Categories</div>
                  <div className="pill-row">
                    {post.categories.map((category) => (
                      <TaxonomyPill key={category.slug} href={category.permalink} label={category.title} />
                    ))}
                  </div>
                </div>
              ) : null}
              {post.series.length > 0 ? (
                <div className="article-meta-group">
                  <div className="article-taxonomy-label">Series</div>
                  <div className="pill-row">
                    {post.series.map((s) => (
                      <TaxonomyPill key={s.slug} href={s.permalink} label={s.title} />
                    ))}
                  </div>
                </div>
              ) : null}
              {post.tags.length > 0 ? (
                <div className="article-meta-group">
                  <div className="article-taxonomy-label">Tags</div>
                  <div className="pill-row">
                    {post.tags.map((tag) => (
                      <TaxonomyPill key={tag.slug} href={tag.permalink} label={`#${tag.title}`} />
                    ))}
                  </div>
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
            <span className="article-image">
              <img src={mediaAsset.assetPath} alt={mediaAsset.assetPath.split("/").pop() ?? "Media asset"} />
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
      posts.length
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <article className="prose-wrap stack" lang={page.language}>
        <h1 className="page-title">{page.title}</h1>
        {page.description ? <p className="lede">{page.description}</p> : null}
        <ContentRenderer source={page.content} />
      </article>
    </div>
  );
}
