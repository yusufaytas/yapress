import { describe, expect, it } from "vitest";

import type { ContentEntry } from "@/types/content";
import { buildArticleJsonLd, buildMetadata, buildPostBreadcrumbJsonLd, buildSearchResultsJsonLd } from "@/lib/seo";
import { getAbsoluteUrl } from "@/lib/site";

describe("buildSearchResultsJsonLd", () => {
  it("uses the query in the search results page name and URL", () => {
    const jsonLd = buildSearchResultsJsonLd("branding", "/search?q=branding", [
      { name: "Post A", url: "/post-a", description: "Result" }
    ]);

    expect(jsonLd).toMatchObject({
      "@type": "SearchResultsPage",
      name: "Search results for branding",
      description: "Search results for branding.",
      url: getAbsoluteUrl("/search?q=branding"),
    });
    expect(jsonLd.mainEntity).toMatchObject({
      "@type": "ItemList",
      numberOfItems: 1,
      itemListElement: [
        expect.objectContaining({
          "@type": "ListItem",
          position: 1,
          name: "Post A",
          url: getAbsoluteUrl("/post-a"),
        })
      ]
    });
  });
});

describe("buildArticleJsonLd", () => {
  it("maps categories, tags, and series to schema-specific fields", () => {
    const content: ContentEntry = {
      kind: "post",
      title: "Post A",
      slug: "post-a",
      description: "Desc",
      image: "/cover.png",
      language: "en",
      locale: "en",
      datePublished: new Date("2026-03-01T00:00:00.000Z"),
      dateModified: new Date("2026-03-02T00:00:00.000Z"),
      draft: false,
      content: "Body",
      excerpt: "Excerpt",
      readingTime: {
        text: "1 min read",
        minutes: 1,
        time: 60000,
        words: 200
      },
      categories: [
        { slug: "engineering", title: "Engineering", permalink: "/categories/engineering" }
      ],
      tags: [
        { slug: "branding", title: "Branding", permalink: "/tags/branding" }
      ],
      series: [
        { slug: "migration", title: "Migration", permalink: "/series/migration", order: 1 }
      ],
      permalink: "/post-a",
      aliases: []
    };

    const jsonLd = buildArticleJsonLd(content);

    expect(jsonLd).toMatchObject({
      "@type": "BlogPosting",
      articleSection: "Engineering",
      keywords: ["Branding"],
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": getAbsoluteUrl("/post-a")
      },
      wordCount: 200,
      about: [
        { "@type": "Thing", name: "Engineering" },
        { "@type": "Thing", name: "Branding" }
      ],
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".article-title", ".article-body p"]
      },
      isPartOf: [
        {
          "@type": "CreativeWorkSeries",
          name: "Migration",
          url: getAbsoluteUrl("/series/migration")
        }
      ]
    });
  });
});

describe("buildPostBreadcrumbJsonLd", () => {
  it("prefers series over categories and tags for the canonical post breadcrumb path", () => {
    const content: ContentEntry = {
      kind: "post",
      title: "Post A",
      slug: "post-a",
      description: "Desc",
      image: "/cover.png",
      language: "en",
      locale: "en",
      datePublished: new Date("2026-03-01T00:00:00.000Z"),
      dateModified: new Date("2026-03-02T00:00:00.000Z"),
      draft: false,
      content: "Body",
      excerpt: "Excerpt",
      readingTime: {
        text: "1 min read",
        minutes: 1,
        time: 60000,
        words: 200
      },
      categories: [
        { slug: "engineering", title: "Engineering", permalink: "/categories/engineering" }
      ],
      tags: [
        { slug: "branding", title: "Branding", permalink: "/tags/branding" }
      ],
      series: [
        { slug: "migration", title: "Migration", permalink: "/series/migration", order: 1 }
      ],
      permalink: "/post-a",
      aliases: []
    };

    const jsonLd = buildPostBreadcrumbJsonLd(content);

    expect(jsonLd).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: getAbsoluteUrl("/")
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Migration Series",
          item: getAbsoluteUrl("/series/migration")
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Post A"
        }
      ]
    });
  });
});

describe("buildMetadata", () => {
  it("supports canonical, robots, twitter, author, section, and alternates overrides", () => {
    const metadata = buildMetadata({
      title: "Example",
      pathname: "/example",
      canonical: "/canonical-example",
      author: "Site Author",
      section: "Engineering",
      robots: {
        index: true,
        follow: true,
        "max-snippet": 120,
        "max-image-preview": "large",
        "max-video-preview": 30,
      },
      twitterCard: "summary",
      twitterSite: "@site",
      twitterCreator: "@author",
      alternates: [
        { hreflang: "en", href: "https://example.com/example" },
        { hreflang: "tr", href: "https://example.com/tr/example" }
      ]
    });

    expect(metadata.alternates).toMatchObject({
      canonical: getAbsoluteUrl("/canonical-example"),
      languages: {
        en: "https://example.com/example",
        tr: "https://example.com/tr/example"
      }
    });
    expect(metadata.openGraph).toMatchObject({
      url: getAbsoluteUrl("/canonical-example"),
      authors: ["Site Author"],
      section: "Engineering",
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary",
      site: "@site",
      creator: "@author",
    });
    expect(metadata.authors).toEqual([{ name: "Site Author" }]);
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": 120,
        "max-image-preview": "large",
        "max-video-preview": 30,
      }
    });
  });
});
