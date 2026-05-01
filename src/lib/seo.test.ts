import { describe, expect, it } from "vitest";

import type { ContentEntry } from "@/types/content";
import { buildArticleJsonLd, buildContentMetadata, buildContentJsonLd, buildMetadata, buildPostBreadcrumbJsonLd, buildSearchResultsJsonLd } from "@/lib/seo";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

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
      keywords: [],
      jsonLdType: undefined,
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
      author: {
        "@type": "Person",
        name: "Site Author",
        url: getAbsoluteUrl("/about")
      },
      publisher: {
        "@type": "Organization",
        name: "Yapress",
        url: getAbsoluteUrl("/"),
        logo: {
          "@type": "ImageObject",
          url: getAbsoluteUrl("/yapress.jpg")
        }
      },
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

  it("omits the author URL when the site does not define one", () => {
    const previousAuthorUrl = siteConfig.authorUrl;
    siteConfig.authorUrl = undefined;

    try {
      const content: ContentEntry = {
        kind: "post",
        title: "Post A",
        slug: "post-a",
        description: "Desc",
        image: "/cover.png",
        keywords: [],
        jsonLdType: undefined,
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
        categories: [],
        tags: [],
        series: [],
        permalink: "/post-a",
        aliases: []
      };

      const jsonLd = buildArticleJsonLd(content);

      expect(jsonLd.author).toEqual({
        "@type": "Person",
        name: "Site Author",
        url: undefined
      });
    } finally {
      siteConfig.authorUrl = previousAuthorUrl;
    }
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
      keywords: [],
      jsonLdType: undefined,
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
          name: "Post A",
          item: getAbsoluteUrl("/post-a")
        }
      ]
    });
  });
});

describe("buildContentJsonLd", () => {
  it("uses page keywords in metadata and WebPage JSON-LD", () => {
    const content: ContentEntry = {
      kind: "page",
      title: "Services",
      slug: "services",
      description: "Services overview.",
      image: "/services.jpg",
      keywords: ["consulting", "architecture", "fractional cto"],
      jsonLdType: "WebPage",
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
      categories: [],
      tags: [],
      series: [],
      permalink: "/services",
      aliases: []
    };

    const metadata = buildContentMetadata(content);
    const jsonLd = buildContentJsonLd(content);

    expect(metadata.keywords).toEqual(["consulting", "architecture", "fractional cto"]);
    expect(metadata.openGraph).toMatchObject({
      tags: ["consulting", "architecture", "fractional cto"]
    });
    expect(jsonLd).toMatchObject({
      "@type": "WebPage",
      url: getAbsoluteUrl("/services"),
      keywords: ["consulting", "architecture", "fractional cto"]
    });
  });

  it("supports ProfilePage JSON-LD for pages through content metadata", () => {
    const content: ContentEntry = {
      kind: "page",
      title: "About",
      slug: "about",
      description: "About the author.",
      image: "/portrait.jpg",
      keywords: ["author", "about", "engineering leadership"],
      jsonLdType: "ProfilePage",
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
      categories: [],
      tags: [],
      series: [],
      permalink: "/about",
      aliases: []
    };

    const jsonLd = buildContentJsonLd(content);

    expect(jsonLd).toMatchObject({
      "@type": "ProfilePage",
      url: getAbsoluteUrl("/about"),
      name: "About",
      mainEntity: {
        "@type": "Person",
        name: "Site Author",
        url: getAbsoluteUrl("/about"),
        image: getAbsoluteUrl("/portrait.jpg")
      }
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
