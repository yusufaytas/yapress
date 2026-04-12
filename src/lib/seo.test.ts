import { afterEach, describe, expect, it } from "vitest";

import {
  buildArticleJsonLd,
  buildContentMetadata,
  buildWebPageJsonLd,
  buildMediaObjectJsonLd,
  buildMetadata,
  buildSearchResultsJsonLd,
  buildWebSiteJsonLd,
  serializeJsonLd,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const originalUrlConfig = JSON.parse(JSON.stringify(siteConfig.url ?? {}));

afterEach(() => {
  siteConfig.url = JSON.parse(JSON.stringify(originalUrlConfig));
});

describe("seo", () => {
  it("builds metadata with canonical URL and website open graph by default", () => {
    const metadata = buildMetadata({
      title: "Archives",
      description: "Browse monthly archives.",
      pathname: "/archives",
      keywords: ["archives"],
    });

    expect(metadata.alternates?.canonical?.toString()).toContain("/archives");
    expect(metadata.openGraph).toMatchObject({ type: "website" });
    expect(metadata.keywords).toEqual(["archives"]);
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://example.com/yapress.jpg",
        alt: "Yapress",
      },
    ]);
    expect(metadata.twitter).toMatchObject({
      images: ["https://example.com/yapress.jpg"],
      creator: siteConfig.social?.x ? "@example" : undefined,
      site: siteConfig.social?.x ? "@example" : undefined,
    });
  });

  it("includes a SearchAction and social profiles on the website JSON-LD", () => {
    const jsonLd = buildWebSiteJsonLd();

    expect(jsonLd["@type"]).toBe("WebSite");
    expect(jsonLd.potentialAction?.["@type"]).toBe("SearchAction");
    expect(jsonLd.potentialAction?.target).toContain("/search?q={search_term_string}");
    expect(jsonLd.sameAs).toEqual(Object.values(siteConfig.social ?? {}));
  });

  it("omits the SearchAction when search is disabled", () => {
    siteConfig.url = {
      ...siteConfig.url,
      search: {
        enabled: false,
      },
    };

    const jsonLd = buildWebSiteJsonLd();

    expect(jsonLd.potentialAction).toBeUndefined();
  });

  it("builds search results structured data", () => {
    const jsonLd = buildSearchResultsJsonLd("markdown", "/search", [
      { name: "Markdown Guide", url: "/markdown-guide", description: "Formatting tips" },
    ]);

    expect(jsonLd["@type"]).toBe("SearchResultsPage");
    expect(jsonLd.mainEntity.itemListElement).toHaveLength(1);
  });

  it("builds media object structured data", () => {
    const jsonLd = buildMediaObjectJsonLd({
      assetPath: "/images/hero.png",
      pagePath: "/media/images/hero.png",
      contentType: "image/png",
      size: 1024,
      references: [],
    });

    expect(jsonLd["@type"]).toBe("ImageObject");
    expect(jsonLd.contentUrl).toContain("/images/hero.png");
  });

  it("serializes JSON-LD safely", () => {
    expect(serializeJsonLd({ value: "</script>" })).toContain("\\u003c/script>");
  });

  it("uses the content OG image when provided", () => {
    const metadata = buildContentMetadata({
      kind: "post",
      title: "Post",
      slug: "post",
      description: "Desc",
      image: "/images/post-card.png",
      language: "en",
      locale: "en",
      datePublished: new Date("2026-04-10T00:00:00.000Z"),
      dateModified: new Date("2026-04-10T00:00:00.000Z"),
      draft: false,
      content: "Hello",
      excerpt: "Hello",
      readingTime: { text: "1 min read", minutes: 1, time: 60000, words: 10 },
      categories: [],
      tags: [],
      series: [],
      permalink: "/post",
      aliases: [],
    });

    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://example.com/images/post-card.png",
        alt: "Yapress",
      },
    ]);
    expect(metadata.twitter).toMatchObject({
      images: ["https://example.com/images/post-card.png"],
    });
  });

  it("adds the content image to article JSON-LD", () => {
    const jsonLd = buildArticleJsonLd({
      kind: "post",
      title: "Post",
      slug: "post",
      description: "Desc",
      image: "/images/post-card.png",
      language: "en",
      locale: "en",
      datePublished: new Date("2026-04-10T00:00:00.000Z"),
      dateModified: new Date("2026-04-10T00:00:00.000Z"),
      draft: false,
      content: "Hello",
      excerpt: "Hello",
      readingTime: { text: "1 min read", minutes: 1, time: 60000, words: 10 },
      categories: [],
      tags: [],
      series: [],
      permalink: "/post",
      aliases: [],
    });

    expect(jsonLd.image).toBe("https://example.com/images/post-card.png");
  });

  it("adds the content image to page JSON-LD", () => {
    const jsonLd = buildWebPageJsonLd({
      kind: "page",
      title: "Page",
      slug: "page",
      description: "Desc",
      image: "/images/page-card.png",
      language: "en",
      locale: "en",
      datePublished: undefined,
      dateModified: undefined,
      draft: false,
      content: "Hello",
      excerpt: "Hello",
      readingTime: { text: "1 min read", minutes: 1, time: 60000, words: 10 },
      categories: [],
      tags: [],
      series: [],
      permalink: "/page",
      aliases: [],
    });

    expect(jsonLd.image).toBe("https://example.com/images/page-card.png");
  });

  it("falls back to the site image in JSON-LD when content has no image", () => {
    const articleJsonLd = buildArticleJsonLd({
      kind: "post",
      title: "Post",
      slug: "post",
      description: "Desc",
      image: undefined,
      language: "en",
      locale: "en",
      datePublished: new Date("2026-04-10T00:00:00.000Z"),
      dateModified: new Date("2026-04-10T00:00:00.000Z"),
      draft: false,
      content: "Hello",
      excerpt: "Hello",
      readingTime: { text: "1 min read", minutes: 1, time: 60000, words: 10 },
      categories: [],
      tags: [],
      series: [],
      permalink: "/post",
      aliases: [],
    });

    const pageJsonLd = buildWebPageJsonLd({
      kind: "page",
      title: "Page",
      slug: "page",
      description: "Desc",
      image: undefined,
      language: "en",
      locale: "en",
      datePublished: undefined,
      dateModified: undefined,
      draft: false,
      content: "Hello",
      excerpt: "Hello",
      readingTime: { text: "1 min read", minutes: 1, time: 60000, words: 10 },
      categories: [],
      tags: [],
      series: [],
      permalink: "/page",
      aliases: [],
    });

    expect(articleJsonLd.image).toBe("https://example.com/yapress.jpg");
    expect(pageJsonLd.image).toBe("https://example.com/yapress.jpg");
  });

  it("formats dates using the provided locale", () => {
    const english = new Intl.DateTimeFormat("en", { dateStyle: "long", timeZone: "UTC" }).format(new Date("2026-04-10T00:00:00.000Z"));
    const turkish = new Intl.DateTimeFormat("tr", { dateStyle: "long", timeZone: "UTC" }).format(new Date("2026-04-10T00:00:00.000Z"));

    expect(english).not.toBe(turkish);
  });
});
