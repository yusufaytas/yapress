import type { Metadata } from "next";
import type { MediaAsset } from "@/lib/media";

import type { ContentEntry } from "@/lib/content";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

type MetadataInput = {
  title: string;
  description?: string;
  pathname?: string;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  openGraphType?: "article" | "website";
  noIndex?: boolean;
  locale?: string;
};

type JsonLdArticle = {
  "@context": "https://schema.org";
  "@type": "Article" | "BlogPosting";
  headline: string;
  description?: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  author: {
    "@type": "Person";
    name: string;
  };
  inLanguage?: string;
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
  };
  keywords?: string[];
};

type JsonLdWebPage = {
  "@context": "https://schema.org";
  "@type": "WebPage";
  name: string;
  description?: string;
  url: string;
  inLanguage?: string;
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
  };
};

type JsonLdWebSite = {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  description: string;
  url: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
};

type JsonLdMediaObject = {
  "@context": "https://schema.org";
  "@type": "ImageObject" | "MediaObject";
  name: string;
  description?: string;
  contentUrl: string;
  url: string;
  encodingFormat?: string;
};

export function buildMetadata({ 
  title, 
  description, 
  pathname = "/", 
  keywords = [],
  publishedTime,
  modifiedTime,
  openGraphType = "website",
  noIndex = false,
  locale = siteConfig.language
}: MetadataInput): Metadata {
  const resolvedTitle = pathname === "/" ? title : `${title} | ${siteConfig.title}`;
  const resolvedDescription = description ?? siteConfig.description;
  const absoluteUrl = getAbsoluteUrl(pathname);
  const resolvedKeywords = keywords.length > 0 ? keywords : (siteConfig.keywords ?? []);

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: resolvedKeywords,
    alternates: {
      canonical: absoluteUrl
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: absoluteUrl,
      siteName: siteConfig.title,
      locale,
      type: openGraphType,
      tags: resolvedKeywords,
      publishedTime,
      modifiedTime
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription
    },
    robots: {
      index: !noIndex,
      follow: true
    }
  };
}

export function buildContentMetadata(content: ContentEntry): Metadata {
  const keywords = content.kind === "post" 
    ? [
        ...content.categories.map((category) => category.title),
        ...content.tags.map((tag) => tag.title),
        ...content.series.map((s) => s.title)
      ]
    : [];

  return buildMetadata({
    title: content.title,
    description: content.description ?? content.excerpt,
    pathname: content.permalink,
    keywords,
    publishedTime: content.date,
    modifiedTime: content.lastUpdated,
    openGraphType: content.kind === "post" ? "article" : "website",
    locale: content.locale
  });
}

// Convenience aliases for clarity
export const buildPostMetadata = buildContentMetadata;
export const buildPageMetadata = buildContentMetadata;

export function buildArticleJsonLd(content: ContentEntry): JsonLdArticle {
  const keywords = content.kind === "post" 
    ? [
        ...content.categories.map((category) => category.title),
        ...content.tags.map((tag) => tag.title),
        ...content.series.map((s) => s.title)
      ]
    : [];

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: content.title,
    description: content.description ?? content.excerpt,
    url: getAbsoluteUrl(content.permalink),
    datePublished: content.date,
    dateModified: content.lastUpdated ?? content.date,
    author: {
      "@type": "Person",
      name: siteConfig.author
    },
    inLanguage: content.language,
    publisher: {
      "@type": "Organization",
      name: siteConfig.title,
      url: getAbsoluteUrl("/")
    },
    keywords: keywords.length > 0 ? keywords : undefined
  };
}

export function buildWebPageJsonLd(content: ContentEntry): JsonLdWebPage {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: content.title,
    description: content.description ?? content.excerpt,
    url: getAbsoluteUrl(content.permalink),
    inLanguage: content.language,
    publisher: {
      "@type": "Organization",
      name: siteConfig.title,
      url: getAbsoluteUrl("/")
    }
  };
}

export function buildContentJsonLd(content: ContentEntry): JsonLdArticle | JsonLdWebPage {
  return content.kind === "post" ? buildArticleJsonLd(content) : buildWebPageJsonLd(content);
}

export function buildWebSiteJsonLd(): JsonLdWebSite {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.title,
    description: siteConfig.description,
    url: getAbsoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: `${getAbsoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function buildCollectionPageJsonLd(
  title: string,
  description: string,
  pathname: string,
  itemCount: number
): {
  "@context": "https://schema.org";
  "@type": "CollectionPage";
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
  };
} {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: getAbsoluteUrl(pathname),
    numberOfItems: itemCount,
    publisher: {
      "@type": "Organization",
      name: siteConfig.title,
      url: getAbsoluteUrl("/")
    }
  };
}

export function buildItemListJsonLd(
  title: string,
  description: string,
  pathname: string,
  items: Array<{ name: string; url: string; description?: string }>
): {
  "@context": "https://schema.org";
  "@type": "ItemList";
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    url: string;
    description?: string;
  }>;
} {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    description,
    url: getAbsoluteUrl(pathname),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: getAbsoluteUrl(item.url),
      description: item.description
    }))
  };
}

export function buildSearchResultsJsonLd(
  query: string,
  pathname: string,
  items: Array<{ name: string; url: string; description?: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    name: query ? `Search results for ${query}` : "Search",
    description: query ? `Search results for ${query}.` : "Search the site archive.",
    url: getAbsoluteUrl(pathname),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: getAbsoluteUrl(item.url),
        description: item.description
      }))
    }
  };
}

export function buildMediaObjectJsonLd(asset: MediaAsset) {
  return {
    "@context": "https://schema.org",
    "@type": asset.contentType.startsWith("image/") ? "ImageObject" : "MediaObject",
    name: asset.assetPath.split("/").pop() ?? "Media asset",
    description: `Media attachment for ${asset.assetPath}.`,
    contentUrl: getAbsoluteUrl(asset.assetPath),
    url: getAbsoluteUrl(asset.pagePath),
    encodingFormat: asset.contentType
  } satisfies JsonLdMediaObject;
}

export function formatDisplayDate(value?: string, locale = siteConfig.language) {
  if (!value) {
    return "Undated";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC"
  }).format(new Date(value));
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
