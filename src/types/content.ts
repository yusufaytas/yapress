/**
 * Content type definitions for YaPress
 * These types define the structure for categories, tags, and series registries
 */

export type FrontmatterBase = {
  title: string;
  slug: string;
  description?: string;
  aliases?: string[];
  language?: string;
  locale?: string;
  image?: string;
};

export type SeriesFrontmatterItem = {
  slug: string;
  order?: number;
};

export type PostFrontmatter = FrontmatterBase & {
  datePublished: string;
  dateModified?: string;
  draft?: boolean;
  categories: string[];
  tags?: string[];
  series?: SeriesFrontmatterItem[];
};

export type PageFrontmatter = FrontmatterBase & {
  datePublished?: string;
  dateModified?: string;
  draft?: boolean;
};

export type CategoryDefinition = {
  slug: string;
  title: string;
  description: string;
};

export type TagDefinition = {
  slug: string;
  title: string;
  description?: string;
};

export type SeriesDefinition = {
  slug: string;
  title: string;
  description: string;
};

export type TaxonomyItem = {
  slug: string;
  title: string;
  permalink: string;
  order?: number;
};

export type ContentReadingTime = {
  text: string;
  minutes: number;
  time: number;
  words: number;
};

export type ContentEntry = {
  kind: "post" | "page";
  title: string;
  slug: string;
  description?: string;
  image?: string;
  language: string;
  locale: string;
  datePublished?: Date;
  dateModified?: Date;
  draft?: boolean;
  content: string;
  excerpt: string;
  readingTime: ContentReadingTime;
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
  series: TaxonomyItem[];
  permalink: string;
  aliases: string[];
};

export type TaxonomyBucket = TaxonomyItem & {
  description?: string;
  posts: ContentEntry[];
  datePublished?: Date;
  dateModified?: Date;
};

export type DateArchiveBucket = {
  year: string;
  month: string;
  permalink: string;
  posts: ContentEntry[];
  datePublished?: Date;
  dateModified?: Date;
};
