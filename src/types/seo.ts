export type RobotsDirective = {
  index?: boolean;
  follow?: boolean;
  "max-snippet"?: number;
  "max-image-preview"?: "none" | "standard" | "large";
  "max-video-preview"?: number;
};

export type MetadataInput = {
  title: string;
  description?: string;
  pathname?: string;
  keywords?: string[];
  image?: string;
  datePublished?: Date;
  dateModified?: Date;
  openGraphType?: "article" | "website";
  noIndex?: boolean;
  locale?: string;
  canonical?: string;
  robots?: RobotsDirective;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  twitterSite?: string;
  twitterCreator?: string;
  author?: string;
  section?: string;
  alternates?: Array<{ hreflang: string; href: string }>;
};

export type JsonLdArticle = {
  "@context": "https://schema.org";
  "@type": "Article" | "BlogPosting";
  headline: string;
  description?: string;
  url: string;
  image?: string;
  datePublished?: Date;
  dateModified?: Date;
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
  articleSection?: string | string[];
  keywords?: string[];
  isPartOf?: Array<{
    "@type": "CreativeWorkSeries";
    name: string;
    url: string;
  }>;
  mainEntityOfPage?: {
    "@type": "WebPage";
    "@id": string;
  };
  wordCount?: number;
  about?: Array<{
    "@type": "Thing";
    name: string;
  }>;
  speakable?: {
    "@type": "SpeakableSpecification";
    cssSelector?: string[];
  };
};

export type JsonLdWebPage = {
  "@context": "https://schema.org";
  "@type": "WebPage";
  name: string;
  description?: string;
  url: string;
  image?: string;
  datePublished?: Date;
  dateModified?: Date;
  inLanguage?: string;
  publisher: {
    "@type": "Organization";
    name: string;
    url: string;
  };
};

export type JsonLdWebSite = {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  description: string;
  url: string;
  sameAs?: string[];
  potentialAction?: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
};

export type JsonLdMediaObject = {
  "@context": "https://schema.org";
  "@type": "ImageObject" | "MediaObject";
  name: string;
  description?: string;
  contentUrl: string;
  url: string;
  encodingFormat?: string;
};

export type JsonLdBreadcrumbList = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
};

export type JsonLdFAQPage = {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
};