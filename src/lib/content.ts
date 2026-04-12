import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import readingTime from "reading-time";

import categoryRegistry from "@/content/categories";
import seriesRegistry from "@/content/series";
import tagRegistry from "@/content/tags";
import siteConfig from "@/site.config";
import type { CategoryDefinition, SeriesDefinition, TagDefinition } from "@/types/content";
import { getArchivePath, getPostPermalink, getUrlConfig, normalizePathname, trimSlashes } from "@/lib/urls";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const POSTS_ROOT = path.join(CONTENT_ROOT, "posts");
const PAGES_ROOT = path.join(CONTENT_ROOT, "pages");

type FrontmatterBase = {
  title: string;
  slug: string;
  description?: string;
  aliases?: string[];
  language?: string;
  locale?: string;
};

type PostFrontmatter = FrontmatterBase & {
  datePublished: string;
  dateModified?: string;
  draft?: boolean;
  categories: string[];
  tags?: string[];
  series?: SeriesFrontmatterItem[];
};

type SeriesFrontmatterItem = {
  slug: string;
  order?: number;
};

type PageFrontmatter = FrontmatterBase & {
  datePublished?: string;
  dateModified?: string;
  draft?: boolean;
};

export type TaxonomyItem = {
  slug: string;
  title: string;
  permalink: string;
  order?: number;
};

export type ContentEntry = {
  kind: "post" | "page";
  title: string;
  slug: string;
  description?: string;
  language: string;
  locale: string;
  datePublished?: Date;
  dateModified?: Date;
  draft?: boolean;
  content: string;
  excerpt: string;
  readingTime: ReturnType<typeof readingTime>;
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
  series: TaxonomyItem[];
  permalink: string;
  aliases: string[];
};

export type TaxonomyBucket = TaxonomyItem & {
  description?: string;
  posts: ContentEntry[];
};

export const POSTS_PER_PAGE = siteConfig.postsPerPage ?? 5;

function normalizeSlug(input: string, locale = siteConfig.language) {

  if (!input || typeof input !== "string") {
    return "";
  }
  
  return input
    .trim()
    .normalize("NFKC")
    .toLocaleLowerCase(locale)
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePathSlug(input: string, locale = siteConfig.language) {
  return input
    .split("/")
    .map((segment) => normalizeSlug(segment, locale))
    .filter(Boolean)
    .join("/");
}

function normalizeAlias(input: string) {
  const normalized = normalizePathname(input);
  return normalized === "/" ? normalized : normalized.replace(/\/+$/, "");
}

function normalizeDate(input: string | Date) {
  return input instanceof Date ? input : new Date(input);
}

function normalizeTaxonomyInput(input: unknown) {
  if (typeof input === "string") {
    return input.trim();
  }

  if (typeof input === "number" || typeof input === "boolean") {
    return String(input);
  }

  return "";
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function ensureDirectory(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files: string[] = [];
  
  function scanDirectory(currentPath: string, relativePath = "") {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        scanDirectory(fullPath, relPath);
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        files.push(relPath);
      }
    }
  }
  
  scanDirectory(dirPath);
  return files.sort((left, right) => left.localeCompare(right));
}

function categoryMap() {
  return new Map(categoryRegistry.map((item) => [item.slug, item]));
}

function seriesMap() {
  return new Map(seriesRegistry.map((item) => [item.slug, item]));
}

function tagMap() {
  return new Map(tagRegistry.map((item) => [item.slug, item]));
}

export function stripMarkdown(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "") // Remove images ![alt](url)
    .replace(/<img[^>]*>/gi, "") // Remove HTML images
    .replace(/\[[^\]]*]\([^)]*\)/g, "") // Remove links [text](url) - including empty []
    .replace(/^#+\s+/gm, "")
    .replace(/[*_>~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildExcerpt(input: string, maxLength = siteConfig.excerptLength ?? 180) {
  const plain = stripMarkdown(input);
  if (plain.length <= maxLength) {
    return plain;
  }

  const clippedLength = Math.max(0, maxLength - 3);
  return `${plain.slice(0, clippedLength).trimEnd()}...`;
}

function readFileContent(root: string, fileName: string) {
  const fullPath = path.join(root, fileName);
  return fs.readFileSync(fullPath, "utf8");
}

function resolveCategories(rawCategories: string[]) {
  const registry = categoryMap();

  return rawCategories.map(normalizeTaxonomyInput).filter(Boolean).map((categorySlug) => {
    const match = registry.get(categorySlug);
    if (!match) {
      throw new Error(`Unknown category "${categorySlug}". Register it in content/categories.ts.`);
    }

    return {
      slug: match.slug,
      title: match.title,
      permalink: `/categories/${match.slug}`
    } satisfies TaxonomyItem;
  });
}

function resolveTags(rawTags: string[] = [], locale = siteConfig.language) {
  const registry = tagMap();

  return [...new Set(rawTags.map(normalizeTaxonomyInput).filter(Boolean).map((tag) => normalizeSlug(tag, locale)))]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right))
    .map((tagSlug) => {
      const match = registry.get(tagSlug);

      return {
        slug: tagSlug,
        title: match?.title ?? titleFromSlug(tagSlug),
        permalink: `/tags/${tagSlug}`
      };
    });
}

function resolveSeries(series?: SeriesFrontmatterItem[], locale = siteConfig.language) {
  if (!series || series.length === 0) {
    return [];
  }

  const registry = seriesMap();
  const normalized = new Map<string, SeriesFrontmatterItem>();

  for (const item of series) {
    const seriesSlug = normalizeSlug(item.slug, locale);

    if (!seriesSlug) {
      continue;
    }

    normalized.set(seriesSlug, {
      slug: seriesSlug,
      order: item.order
    });
  }

  return [...normalized.values()]
    .map((item) => {
      const match = registry.get(item.slug);
      if (!match) {
        throw new Error(`Unknown series "${item.slug}". Register it in content/series.ts.`);
      }

      return {
        slug: match.slug,
        title: match.title,
        permalink: `/series/${match.slug}`,
        order: item.order
      } satisfies TaxonomyItem;
    })
    .sort((left, right) => {
      if (left.order != null && right.order != null && left.order !== right.order) {
        return left.order - right.order;
      }

      if (left.order != null) {
        return -1;
      }

      if (right.order != null) {
        return 1;
      }

      return left.slug.localeCompare(right.slug);
    });
}

function resolveAliases(rawAliases: string[] = []) {
  return [...new Set(rawAliases.map(normalizeAlias).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function sortPosts(posts: ContentEntry[]) {
  return [...posts].sort((left, right) => {
    const leftDate = left.datePublished?.getTime() ?? 0;
    const rightDate = right.datePublished?.getTime() ?? 0;
    if (leftDate !== rightDate) {
      return rightDate - leftDate;
    }
    return left.slug.localeCompare(right.slug);
  });
}

function collectBuckets(
  posts: ContentEntry[],
  selector: (post: ContentEntry) => TaxonomyItem[]
): TaxonomyBucket[] {
  const buckets = new Map<string, TaxonomyBucket>();

  for (const post of posts) {
    for (const item of selector(post)) {
      const existing = buckets.get(item.slug) ?? {
        ...item,
        posts: []
      };
      existing.posts.push(post);
      buckets.set(item.slug, existing);
    }
  }

  return [...buckets.values()].sort((left, right) => left.title.localeCompare(right.title));
}

let cachedPosts: ContentEntry[] | undefined;
let cachedPages: ContentEntry[] | undefined;

function getReservedRootSlugs() {
  const config = getUrlConfig();
  const reserved = new Set(["posts", "page", "pages", "categories", "tags", "series", "robots.txt", "sitemap.xml"]);
  const prefixedPostRoot = trimSlashes(config.postPermalink.prefix ?? "");
  const archiveRoot = trimSlashes(config.archives.basePath ?? "");
  const mediaRoot = trimSlashes(config.media.basePath ?? "");
  const feedsRoot = trimSlashes(config.feeds.basePath ?? "");
  const wpCategoryRoot = trimSlashes(config.wordpress.legacyCategoryBase ?? "");
  const wpTagRoot = trimSlashes(config.wordpress.legacyTagBase ?? "");

  for (const value of [prefixedPostRoot, archiveRoot, mediaRoot, feedsRoot, wpCategoryRoot, wpTagRoot]) {
    if (value) {
      reserved.add(value);
    }
  }

  reserved.add("search");

  return reserved;
}

function validatePostSlugConflicts(posts: ContentEntry[]) {
  const pages = getAllPages();
  const pagePermalinks = new Set(pages.map((page) => page.permalink));
  const seen = new Set<string>();
  const reservedRootSlugs = getReservedRootSlugs();

  for (const post of posts) {
    if (reservedRootSlugs.has(post.slug)) {
      throw new Error(`Post slug "${post.slug}" conflicts with a reserved route.`);
    }

    if (pagePermalinks.has(post.permalink)) {
      throw new Error(`Post permalink "${post.permalink}" conflicts with a page permalink.`);
    }

    if (seen.has(post.slug)) {
      throw new Error(`Duplicate post slug "${post.slug}".`);
    }

    seen.add(post.slug);
  }
}

function validatePageSlugConflicts(pages: ContentEntry[]) {
  const seenSlugs = new Set<string>();
  const seenPermalinks = new Set<string>();
  const reservedRootSlugs = getReservedRootSlugs();

  for (const page of pages) {
    const rootSlug = page.slug.split("/")[0];

    if (rootSlug && reservedRootSlugs.has(rootSlug) && page.permalink !== "/") {
      throw new Error(`Page slug "${page.slug}" conflicts with a reserved route.`);
    }

    if (seenSlugs.has(page.slug)) {
      throw new Error(`Duplicate page slug "${page.slug}".`);
    }

    if (seenPermalinks.has(page.permalink)) {
      throw new Error(`Duplicate page permalink "${page.permalink}".`);
    }

    seenSlugs.add(page.slug);
    seenPermalinks.add(page.permalink);
  }
}

export function getAllPosts() {
  if (cachedPosts) {
    return cachedPosts;
  }

  const posts = ensureDirectory(POSTS_ROOT).map((fileName) => {
    const source = readFileContent(POSTS_ROOT, fileName);
    const { data, content } = matter(source);
    const frontmatter = data as PostFrontmatter;

    if (!frontmatter.title || !frontmatter.slug || !frontmatter.datePublished || !frontmatter.categories?.length) {
      throw new Error(`Post "${fileName}" is missing one of: title, slug, datePublished, categories.`);
    }

    return {
      kind: "post",
      title: frontmatter.title,
      slug: normalizeSlug(frontmatter.slug, frontmatter.locale ?? frontmatter.language ?? siteConfig.language),
      description: frontmatter.description,
      language: frontmatter.language ?? siteConfig.language,
      locale: frontmatter.locale ?? frontmatter.language ?? siteConfig.language,
      datePublished: normalizeDate(frontmatter.datePublished),
      dateModified: frontmatter.dateModified ? normalizeDate(frontmatter.dateModified) : undefined,
      draft: frontmatter.draft ?? false,
      content,
      excerpt: buildExcerpt(content),
      readingTime: readingTime(content),
      categories: resolveCategories(frontmatter.categories),
      tags: resolveTags(frontmatter.tags, frontmatter.locale ?? frontmatter.language ?? siteConfig.language),
      series: resolveSeries(frontmatter.series, frontmatter.locale ?? frontmatter.language ?? siteConfig.language),
      permalink: getPostPermalink({
        slug: normalizeSlug(frontmatter.slug, frontmatter.locale ?? frontmatter.language ?? siteConfig.language),
        date: normalizeDate(frontmatter.datePublished)
      }),
      aliases: resolveAliases(frontmatter.aliases)
    } satisfies ContentEntry;
  });

  validatePostSlugConflicts(posts);
  
  // Filter out drafts in production
  const isDevelopment = process.env.NODE_ENV === "development";
  const filteredPosts = isDevelopment ? posts : posts.filter((post) => !post.draft);
  
  cachedPosts = sortPosts(filteredPosts);
  return cachedPosts;
}

export function getAllPages() {
  if (cachedPages) {
    return cachedPages;
  }

  const pages = ensureDirectory(PAGES_ROOT).map((fileName) => {
    const source = readFileContent(PAGES_ROOT, fileName);
    const { data, content } = matter(source);
    const frontmatter = data as PageFrontmatter;

    if (!frontmatter.title || !frontmatter.slug) {
      throw new Error(`Page "${fileName}" is missing one of: title, slug.`);
    }

    const pageLocale = frontmatter.locale ?? frontmatter.language ?? siteConfig.language;
    const normalizedSlug = normalizePathSlug(frontmatter.slug, pageLocale);

    return {
      kind: "page",
      title: frontmatter.title,
      slug: normalizedSlug,
      description: frontmatter.description,
      language: frontmatter.language ?? siteConfig.language,
      locale: pageLocale,
      draft: frontmatter.draft ?? false,
      content,
      excerpt: buildExcerpt(content),
      readingTime: readingTime(content),
      categories: [],
      tags: [],
      series: [],
      permalink: normalizedSlug === "index" ? "/" : `/${normalizedSlug}`,
      aliases: resolveAliases(frontmatter.aliases)
    } satisfies ContentEntry;
  });

  validatePageSlugConflicts(pages);

  // Filter out drafts in production
  const isDevelopment = process.env.NODE_ENV === "development";
  cachedPages = isDevelopment ? pages : pages.filter((page) => !page.draft);
  
  return cachedPages;
}

export function getPostBySlug(slug: string) {
  return getAllPosts().find((post) => post.slug === normalizeSlug(slug, post.locale));
}

export function getPostByPermalink(pathname: string) {
  const normalized = normalizePathname(pathname);
  return getAllPosts().find((post) => post.permalink === normalized);
}

export function getPageBySlug(slugSegments: string[]) {
  const joinedSlug = slugSegments.join("/");
  const exactMatch = getAllPages().find((page) => page.slug === joinedSlug);
  if (exactMatch) {
    return exactMatch;
  }

  const slug = normalizePathSlug(joinedSlug);
  return getAllPages().find((page) => page.slug === slug);
}

export function getPageByPermalink(pathname: string) {
  const normalized = normalizePathname(pathname);
  return getAllPages().find((page) => page.permalink === normalized);
}

export function getPostsByCategory(slug: string) {
  return getAllPosts().filter((post) => post.categories.some((category) => category.slug === slug));
}

export function getPostsByTag(slug: string) {
  return getAllPosts().filter((post) => post.tags.some((tag) => tag.slug === slug));
}

export function getPostsBySeries(slug: string) {
  return getAllPosts()
    .filter((post) => post.series.some((s) => s.slug === slug))
    .sort((left, right) => {
      const leftSeries = left.series.find((item) => item.slug === slug);
      const rightSeries = right.series.find((item) => item.slug === slug);
      const leftOrder = leftSeries?.order;
      const rightOrder = rightSeries?.order;

      if (leftOrder != null && rightOrder != null && leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      if (leftOrder != null) {
        return -1;
      }

      if (rightOrder != null) {
        return 1;
      }

      const leftDate = left.datePublished?.getTime() ?? 0;
      const rightDate = right.datePublished?.getTime() ?? 0;
      if (leftDate !== rightDate) {
        return leftDate - rightDate;
      }

      return left.slug.localeCompare(right.slug);
    });
}

export function getRelatedPosts(post: ContentEntry, limit = 3) {
  const related = getAllPosts()
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      let score = 0;
      // Check if any series match
      const sharedSeries = candidate.series.filter((s) =>
        post.series.some((ps) => ps.slug === s.slug)
      );
      if (sharedSeries.length > 0) {
        score += 5 * sharedSeries.length;
      }
      score += candidate.categories.filter((category) =>
        post.categories.some((selected) => selected.slug === category.slug)
      ).length * 2;
      score += candidate.tags.filter((tag) => post.tags.some((selected) => selected.slug === tag.slug)).length;
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.candidate.slug.localeCompare(right.candidate.slug))
    .slice(0, limit)
    .map((entry) => entry.candidate);

  return related;
}

export function getPaginatedPosts(pageNumber: number, pageSize = POSTS_PER_PAGE) {
  const posts = getAllPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  return {
    posts: posts.slice(startIndex, startIndex + pageSize),
    currentPage,
    totalPages,
    pageSize,
    totalPosts: posts.length
  };
}

export function getPaginationParams(pageSize = POSTS_PER_PAGE, startPage = 1) {
  const totalPosts = getAllPosts().length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));

  return Array.from({ length: Math.max(0, totalPages - startPage + 1) }, (_, index) => ({
    page: String(index + startPage)
  }));
}

export function getCategoryBuckets() {
  const registry = new Map<string, CategoryDefinition>(categoryRegistry.map((item) => [item.slug, item]));
  const buckets = collectBuckets(getAllPosts(), (post) => post.categories);

  return categoryRegistry.map((category) => {
    const existing = buckets.find((b) => b.slug === category.slug);
    if (existing) {
      return { ...existing, description: category.description };
    }
    return {
      slug: category.slug,
      title: category.title,
      permalink: `/categories/${category.slug}`,
      posts: [],
      description: category.description
    };
  });
}

export function getTagBuckets() {
  const registry = new Map<string, TagDefinition>(tagRegistry.map((item) => [item.slug, item]));
  const buckets = collectBuckets(getAllPosts(), (post) => post.tags);

  // Return all buckets from actual posts, merging with registry data where available
  return buckets.map((bucket) => {
    const registryTag = registry.get(bucket.slug);
    if (registryTag) {
      return { ...bucket, description: registryTag.description };
    }
    return bucket;
  });
}

export function getSeriesBuckets() {
  const registry = new Map<string, SeriesDefinition>(seriesRegistry.map((item) => [item.slug, item]));
  const buckets = collectBuckets(
    getAllPosts().filter((post) => post.series.length > 0),
    (post) => post.series
  );

  return seriesRegistry.map((series) => {
    const existing = buckets.find((b) => b.slug === series.slug);
    if (existing) {
      return { ...existing, description: series.description };
    }
    return {
      slug: series.slug,
      title: series.title,
      permalink: `/series/${series.slug}`,
      posts: [],
      description: series.description,
      order: undefined
    };
  });
}

export type DateArchiveBucket = {
  year: string;
  month: string;
  permalink: string;
  posts: ContentEntry[];
};

export function getDateArchiveBuckets() {
  const buckets = new Map<string, DateArchiveBucket>();

  for (const post of getAllPosts()) {
    if (!post.datePublished) {
      continue;
    }

    const date = post.datePublished;
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const year = String(date.getUTCFullYear());
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const permalink = getArchivePath(year, month);

    if (!permalink) {
      continue;
    }

    const key = `${year}-${month}`;
    const existing = buckets.get(key) ?? {
      year,
      month,
      permalink,
      posts: [],
    };
    existing.posts.push(post);
    buckets.set(key, existing);
  }

  return [...buckets.values()].sort((left, right) =>
    right.year.localeCompare(left.year) || right.month.localeCompare(left.month)
  );
}

export function getPostsByDateArchive(year: string, month: string) {
  return getDateArchiveBuckets().find((bucket) => bucket.year === year && bucket.month === month)?.posts ?? [];
}
