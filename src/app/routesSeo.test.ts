import { readFileSync } from "node:fs";
import path from "node:path";

import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import CategoryPage, { generateMetadata as generateCategoryMetadata } from "@/app/categories/[slug]/page";
import { generateStaticParams as generateCategoryStaticParams } from "@/app/categories/[slug]/page";
import SeriesDetailPage, { generateMetadata as generateSeriesMetadata } from "@/app/series/[slug]/page";
import { generateStaticParams as generateSeriesStaticParams } from "@/app/series/[slug]/page";
import TagPage, { generateMetadata as generateTagMetadata } from "@/app/tags/[slug]/page";
import { generateStaticParams as generateTagStaticParams } from "@/app/tags/[slug]/page";
import HomePage from "@/app/page";
import NotFoundPage, { metadata as notFoundMetadata } from "@/app/not-found";
import PaginatedPostsPage from "@/app/page/[page]/page";
import { generateStaticParams as generatePaginationStaticParams } from "@/app/page/[page]/page";
import PagesIndexPage from "@/app/pages/page";
import robots from "@/app/robots";
import { generateStaticParams as generateCatchAllStaticParams } from "@/app/[...slug]/page";
import sitemap from "@/app/sitemap";
import { getCategoryBuckets, getDateArchiveBuckets, getSeriesBuckets, getTagBuckets, getPaginationParams } from "@/lib/content";
import { getMediaAssets } from "@/lib/media";
import { getAppRedirects } from "@/lib/redirects";
import { getAbsoluteUrl } from "@/lib/site";
import { EMPTY_DYNAMIC_SEGMENT } from "@/lib/staticParams";
import { getIndexableTaxonomyBuckets, isTaxonomyBucketIndexable } from "@/lib/taxonomyIndexing";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function extractJsonLd(markup: string) {
  return [...markup.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) =>
    JSON.parse(match[1]) as { "@type"?: string }
  );
}

function expectCollectionDates(jsonLd: Array<Record<string, unknown>>, expectedName: string, datePublished?: Date, dateModified?: Date) {
  const expected: Record<string, unknown> = {
    "@type": "CollectionPage",
    name: expectedName,
  };

  if (datePublished) {
    expected.datePublished = datePublished.toISOString();
  }

  if (dateModified) {
    expected.dateModified = dateModified.toISOString();
  }

  expect(jsonLd).toEqual(
    expect.arrayContaining([
      expect.objectContaining(expected),
    ])
  );
}

describe("route SEO", () => {
  it("marks the 404 page as noindex", () => {
    expect(notFoundMetadata.robots).toMatchObject({
      index: false,
      follow: true,
    });
    expect(notFoundMetadata.alternates?.canonical?.toString()).toContain("/404");
  });

  it("emits collection JSON-LD on the home page", () => {
    const markup = renderToStaticMarkup(HomePage());
    const jsonLd = extractJsonLd(markup);

    expect(jsonLd).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "CollectionPage",
          name: "Home",
        }),
      ])
    );
  });

  it("emits collection JSON-LD on paginated archive pages", async () => {
    const page = await PaginatedPostsPage({ params: Promise.resolve({ page: "2" }) });
    const markup = renderToStaticMarkup(page);
    const jsonLd = extractJsonLd(markup);

    expect(jsonLd).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "CollectionPage",
          name: "Page 2",
          url: getAbsoluteUrl("/page/2"),
        }),
      ])
    );
  });

  it("serializes pages index JSON-LD as a valid item list", () => {
    const markup = renderToStaticMarkup(PagesIndexPage());
    const jsonLd = extractJsonLd(markup);

    expect(jsonLd).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "ItemList",
          name: "Pages",
        }),
      ])
    );
  });

  it("renders the not-found page without route-level JSON-LD", () => {
    const markup = renderToStaticMarkup(NotFoundPage());
    const jsonLd = extractJsonLd(markup);

    expect(jsonLd).toHaveLength(0);
  });

  it("links the not-found page to the configured search route", () => {
    const markup = renderToStaticMarkup(NotFoundPage());

    expect(markup).toContain(`href="/search"`);
  });

  it("emits taxonomy dates on category detail pages", async () => {
    const bucket = getCategoryBuckets().find((entry) => entry.posts.length > 0);
    expect(bucket).toBeDefined();

    const metadata = await generateCategoryMetadata({ params: Promise.resolve({ slug: bucket!.slug }) });
    expect(metadata.openGraph).toMatchObject({
      publishedTime: bucket!.datePublished?.toISOString(),
      modifiedTime: bucket!.dateModified?.toISOString(),
    });

    const page = await CategoryPage({ params: Promise.resolve({ slug: bucket!.slug }) });
    const markup = renderToStaticMarkup(page);
    const jsonLd = extractJsonLd(markup);

    expectCollectionDates(jsonLd, bucket!.title, bucket!.datePublished, bucket!.dateModified);
  });

  it("emits taxonomy dates on tag detail pages", async () => {
    const bucket = getTagBuckets().find((entry) => entry.posts.length > 0);
    expect(bucket).toBeDefined();

    const metadata = await generateTagMetadata({ params: Promise.resolve({ slug: bucket!.slug }) });
    expect(metadata.openGraph).toMatchObject({
      publishedTime: bucket!.datePublished?.toISOString(),
      modifiedTime: bucket!.dateModified?.toISOString(),
    });
    expect(typeof metadata.robots).toBe("object");
    expect(metadata.robots && typeof metadata.robots === "object" ? metadata.robots.index : undefined).toBe(
      isTaxonomyBucketIndexable("tags", bucket!)
    );

    const page = await TagPage({ params: Promise.resolve({ slug: bucket!.slug }) });
    const markup = renderToStaticMarkup(page);
    const jsonLd = extractJsonLd(markup);

    expectCollectionDates(jsonLd, `#${bucket!.title}`, bucket!.datePublished, bucket!.dateModified);
  });

  it("emits taxonomy dates on series detail pages", async () => {
    const bucket = getSeriesBuckets().find((entry) => entry.posts.length > 0);
    expect(bucket).toBeDefined();

    const metadata = await generateSeriesMetadata({ params: Promise.resolve({ slug: bucket!.slug }) });
    expect(metadata.openGraph).toMatchObject({
      publishedTime: bucket!.datePublished?.toISOString(),
      modifiedTime: bucket!.dateModified?.toISOString(),
    });

    const page = await SeriesDetailPage({ params: Promise.resolve({ slug: bucket!.slug }) });
    const markup = renderToStaticMarkup(page);
    const jsonLd = extractJsonLd(markup);

    expectCollectionDates(jsonLd, bucket!.title, bucket!.datePublished, bucket!.dateModified);
  });

  it("only generates static params for populated taxonomy buckets", async () => {
    const categoryParams = await generateCategoryStaticParams();
    const tagParams = await generateTagStaticParams();
    const seriesParams = await generateSeriesStaticParams();
    const expectedCategoryParams = getCategoryBuckets()
      .filter((bucket) => bucket.posts.length > 0)
      .map((bucket) => ({ slug: bucket.slug }));
    const expectedTagParams = getTagBuckets()
      .filter((bucket) => bucket.posts.length > 0)
      .map((bucket) => ({ slug: bucket.slug }));
    const expectedSeriesParams = getSeriesBuckets()
      .filter((bucket) => bucket.posts.length > 0)
      .map((bucket) => ({ slug: bucket.slug }));

    expect(categoryParams).toHaveLength(expectedCategoryParams.length);
    expect(categoryParams).toEqual(expect.arrayContaining(expectedCategoryParams));
    expect(tagParams).toHaveLength(expectedTagParams.length);
    expect(tagParams).toEqual(expect.arrayContaining(expectedTagParams));
    expect(seriesParams).toHaveLength(expectedSeriesParams.length);
    expect(seriesParams).toEqual(expect.arrayContaining(expectedSeriesParams));
  });

  it("marks placeholder taxonomy pages as noindex", async () => {
    const categoryMetadata = await generateCategoryMetadata({ params: Promise.resolve({ slug: EMPTY_DYNAMIC_SEGMENT }) });
    const tagMetadata = await generateTagMetadata({ params: Promise.resolve({ slug: EMPTY_DYNAMIC_SEGMENT }) });
    const seriesMetadata = await generateSeriesMetadata({ params: Promise.resolve({ slug: EMPTY_DYNAMIC_SEGMENT }) });

    expect(categoryMetadata.robots).toMatchObject({ index: false, follow: true });
    expect(tagMetadata.robots).toMatchObject({ index: false, follow: true });
    expect(seriesMetadata.robots).toMatchObject({ index: false, follow: true });
  });

  it("generates only real pagination params", () => {
    const params = generatePaginationStaticParams();

    if (params.some((entry) => entry.page === EMPTY_DYNAMIC_SEGMENT)) {
      expect(params).toEqual([{ page: EMPTY_DYNAMIC_SEGMENT }]);
      return;
    }

    expect(params).toEqual(getPaginationParams(undefined, 2));
  });

  it("only generates catch-all static params for populated archives and referenced media", async () => {
    const params = await generateCatchAllStaticParams();
    const archiveParams = params.filter((entry) =>
      entry.slug.length === 2 && /^\d{4}$/.test(entry.slug[0]) && /^\d{2}$/.test(entry.slug[1])
    );
    const mediaParams = params.filter((entry) => entry.slug[0] === "media");
    const expectedArchiveParams = getDateArchiveBuckets()
      .filter((bucket) => bucket.posts.length > 0)
      .map((bucket) => ({ slug: bucket.permalink.split("/").filter(Boolean) }));
    const expectedMediaParams = getMediaAssets()
      .filter((asset) => asset.references.length > 0)
      .map((asset) => ({ slug: asset.pagePath.split("/").filter(Boolean) }));

    expect(archiveParams).toHaveLength(expectedArchiveParams.length);
    expect(archiveParams).toEqual(expect.arrayContaining(expectedArchiveParams));
    expect(mediaParams).toHaveLength(expectedMediaParams.length);
    expect(mediaParams).toEqual(expect.arrayContaining(expectedMediaParams));
    if (params.some((entry) => entry.slug[0] === EMPTY_DYNAMIC_SEGMENT)) {
      expect(params).toEqual([{ slug: [EMPTY_DYNAMIC_SEGMENT] }]);
      return;
    }
  });

  it("keeps empty taxonomy and archive detail pages out of the sitemap", () => {
    const entries = sitemap().map((entry) => entry.url.toString());

    for (const bucket of getCategoryBuckets().filter((entry) => entry.posts.length === 0)) {
      expect(entries).not.toContain(getAbsoluteUrl(bucket.permalink));
    }

    for (const bucket of getSeriesBuckets().filter((entry) => entry.posts.length === 0)) {
      expect(entries).not.toContain(getAbsoluteUrl(bucket.permalink));
    }
  });

  it("only includes indexable taxonomy pages in the sitemap", () => {
    const entries = sitemap().map((entry) => entry.url.toString());

    for (const bucket of getTagBuckets()) {
      const url = getAbsoluteUrl(bucket.permalink);

      if (isTaxonomyBucketIndexable("tags", bucket)) {
        expect(entries).toContain(url);
      } else {
        expect(entries).not.toContain(url);
      }
    }
  });

  it("orders sitemap taxonomy sections by configured priority and post count", () => {
    const entries = sitemap().map((entry) => entry.url.toString());
    const indexableCategoryUrls = getIndexableTaxonomyBuckets("categories", getCategoryBuckets()).map((bucket) => getAbsoluteUrl(bucket.permalink));
    const indexableSeriesUrls = getIndexableTaxonomyBuckets("series", getSeriesBuckets()).map((bucket) => getAbsoluteUrl(bucket.permalink));
    const indexableTagUrls = getIndexableTaxonomyBuckets("tags", getTagBuckets()).map((bucket) => getAbsoluteUrl(bucket.permalink));

    if (indexableCategoryUrls.length > 0 && indexableSeriesUrls.length > 0) {
      expect(entries.indexOf(indexableCategoryUrls[0])).toBeLessThan(entries.indexOf(indexableSeriesUrls[0]));
    }

    if (indexableSeriesUrls.length > 0 && indexableTagUrls.length > 0) {
      expect(entries.indexOf(indexableSeriesUrls[0])).toBeLessThan(entries.indexOf(indexableTagUrls[0]));
    }
  });

  it("disallows legacy crawl-noise paths and parameter variants in robots.txt", () => {
    expect(robots()).toMatchObject({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: expect.arrayContaining([
          "/wp-admin/",
          "/wp-includes/",
          "/xmlrpc.php",
          "/*?p=*",
          "/*?replytocom=*",
          "/*?utm_*",
          "/*&utm_*",
          "/*?fbclid=*",
          "/*?ref=*",
          "/*?cmid=*",
          "/*comment-page-*",
        ]),
      },
      sitemap: getAbsoluteUrl("/sitemap.xml"),
    });
  });
});

describe("redirect config", () => {
  it("includes framework and site redirects", async () => {
    const nextConfigPath = path.join(process.cwd(), "next.config.ts");
    const nextConfigContent = readFileSync(nextConfigPath, "utf8");
    
    expect(getAppRedirects()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "/feed", destination: "/rss.xml", permanent: true }),
        expect.objectContaining({ source: "/feed/", destination: "/rss.xml", permanent: true }),
        expect.objectContaining({ source: "/category/:slug", destination: "/categories/:slug", permanent: true }),
        expect.objectContaining({ source: "/category/:slug/page/:page", destination: "/categories/:slug", permanent: true }),
        expect.objectContaining({ source: "/tag/:slug", destination: "/tags/:slug", permanent: true }),
        expect.objectContaining({ source: "/tag/:slug/page/:page", destination: "/tags/:slug", permanent: true }),
        expect.objectContaining({ source: "/:slug/comment-page-:page", destination: "/:slug", permanent: true }),
        expect.objectContaining({ source: "/wp-content/uploads/:path*", destination: "/images/:path*", permanent: true }),
      ])
    );

    expect(nextConfigContent).toContain("async redirects()");
    expect(nextConfigContent).toContain("return getAppRedirects()");
  });
});
