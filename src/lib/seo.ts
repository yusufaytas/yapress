import type { Metadata } from "next";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";
import type { ContentEntry } from "@/types/content";
import type { MediaAsset } from "@/types/media";
import type {
  JsonLdArticle,
  JsonLdMediaObject,
  JsonLdWebPage,
  JsonLdWebSite,
  MetadataInput,
} from "@/types/seo";

function getSocialLinks() {
  return Object.values(siteConfig.social ?? {}).filter(
    (value): value is string => Boolean(value && value.trim())
  );
}

function getXHandle() {
  const xUrl = siteConfig.social?.x?.trim();
  if (!xUrl) {
    return undefined;
  }

  const patterns = [
    /^https?:\/\/(?:www\.)?x\.com\/([^/?#]+)/i,
    /^https?:\/\/(?:www\.)?twitter\.com\/([^/?#]+)/i,
  ];

  for (const pattern of patterns) {
    const match = xUrl.match(pattern);
    if (!match) {
      continue;
    }

    const handle = match[1].replace(/^@+/, "");
    return handle ? `@${handle}` : undefined;
  }

  return xUrl.startsWith("@") ? xUrl : undefined;
}

function getSocialImage(imageSrc?: string) {
  const resolvedImageSrc = imageSrc ?? siteConfig.siteImage?.src;

  if (!resolvedImageSrc) {
    return undefined;
  }

  return {
    url: /^https?:\/\//i.test(resolvedImageSrc) ? resolvedImageSrc : getAbsoluteUrl(resolvedImageSrc),
    alt: siteConfig.siteImage?.alt ?? siteConfig.title,
  };
}

export function buildMetadata({ 
  title, 
  description, 
  pathname = "/", 
  keywords = [],
  image,
  datePublished,
  dateModified,
  openGraphType = "website",
  noIndex = false,
  locale = siteConfig.language
}: MetadataInput): Metadata {
  const resolvedTitle = pathname === "/" ? title : `${title} | ${siteConfig.title}`;
  const resolvedDescription = description ?? siteConfig.description;
  const absoluteUrl = getAbsoluteUrl(pathname);
  const resolvedKeywords = keywords.length > 0 ? keywords : (siteConfig.keywords ?? []);
  const xHandle = getXHandle();
  const socialImage = getSocialImage(image);

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
      images: socialImage ? [socialImage] : undefined,
      locale,
      type: openGraphType,
      tags: resolvedKeywords,
      publishedTime: datePublished?.toISOString(),
      modifiedTime: dateModified?.toISOString()
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      images: socialImage ? [socialImage.url] : undefined,
      creator: xHandle,
      site: xHandle
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
    image: content.image,
    datePublished: content.datePublished,
    dateModified: content.dateModified ?? content.datePublished,
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
    image: getSocialImage(content.image)?.url,
    datePublished: content.datePublished,
    dateModified: content.dateModified ?? content.datePublished,
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
    image: getSocialImage(content.image)?.url,
    datePublished: content.datePublished,
    dateModified: content.dateModified ?? content.datePublished,
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
  const socialLinks = getSocialLinks();
  const isSearchEnabled = siteConfig.url?.search?.enabled ?? true;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.title,
    description: siteConfig.description,
    url: getAbsoluteUrl("/"),
    sameAs: socialLinks.length > 0 ? socialLinks : undefined,
    potentialAction: isSearchEnabled
      ? {
          "@type": "SearchAction",
          target: `${getAbsoluteUrl("/search")}?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      : undefined
  };
}

export function buildCollectionPageJsonLd(
  title: string,
  description: string,
  pathname: string,
  itemCount: number,
  datePublished?: Date,
  dateModified?: Date
): {
  "@context": "https://schema.org";
  "@type": "CollectionPage";
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
  datePublished?: Date;
  dateModified?: Date;
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
    datePublished,
    dateModified,
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

export function formatDisplayDate(value?: Date, locale = siteConfig.language) {
  if (!value) {
    return "Undated";
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC"
  }).format(value);
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value, (key, val) => {
    // Convert Date objects to ISO strings for JSON-LD
    if (val instanceof Date) {
      return val.toISOString();
    }
    return val;
  }).replace(/</g, "\\u003c");
}
