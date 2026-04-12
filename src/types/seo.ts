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
  keywords?: string[];
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
