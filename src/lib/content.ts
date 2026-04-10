import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import readingTime from "reading-time";

import categoryRegistry from "@/content/categories";
import seriesRegistry from "@/content/series";
import tagRegistry from "@/content/tags";
import siteConfig from "@/site.config";
import type { CategoryDefinition, SeriesDefinition, TagDefinition } from "@/types/content";
import { getArchivePath, getLegacyDatePermalink, getPostPermalink, getUrlConfig, joinPath, normalizePathname, trimSlashes } from "@/lib/urls";

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
  date: string;
  lastUpdated?: string;
  draft?: boolean;
  categories: string[];
  tags?: string[];
  series?: string[];
};

type PageFrontmatter = FrontmatterBase & {
  draft?: boolean;
};

export type TaxonomyItem = {
  slug: string;
  title: string;
  permalink: string;
};

export type ContentEntry = {
  kind: "post" | "page";
  title: string;
  slug: string;
  description?: string;
  language: string;
  locale: string;
  date?: string;
  lastUpdated?: string;
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
  const date = input instanceof Date ? input : new Date(input);
  return date.toISOString();
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

  return fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .sort((left, right) => left.localeCompare(right));
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

function stripMarkdown(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[[^\]]+]\([^)]*\)/g, "")
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

  return rawCategories.map((categorySlug) => {
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

  return [...new Set(rawTags.map((tag) => normalizeSlug(tag, locale)))]
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

function resolveSeries(series?: string[], locale = siteConfig.language) {
  if (!series || series.length === 0) {
    return [];
  }

  const registry = seriesMap();
  const normalized = [...new Set(series.map((item) => normalizeSlug(item, locale)))].filter(Boolean);

  return normalized
    .map((seriesSlug) => {
      const match = registry.get(seriesSlug);
      if (!match) {
        throw new Error(`Unknown series "${seriesSlug}". Register it in content/series.ts.`);
      }

      return {
        slug: match.slug,
        title: match.title,
        permalink: `/series/${match.slug}`
      } satisfies TaxonomyItem;
    })
    .sort((left, right) => left.slug.localeCompare(right.slug));
}

function resolveAliases(rawAliases: string[] = []) {
  return [...new Set(rawAliases.map(normalizeAlias).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function sortPosts(posts: ContentEntry[]) {
  return [...posts].sort((left, right) => {
    const leftDate = left.date ? new Date(left.date).getTime() : 0;
    const rightDate = right.date ? new Date(right.date).getTime() : 0;
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
  const searchRoot = trimSlashes(config.search.basePath ?? "");
  const mediaRoot = trimSlashes(config.media.basePath ?? "");
  const feedsRoot = trimSlashes(config.feeds.basePath ?? "");
  const wpCategoryRoot = trimSlashes(config.wordpress.legacyCategoryBase ?? "");
  const wpTagRoot = trimSlashes(config.wordpress.legacyTagBase ?? "");

  for (const value of [prefixedPostRoot, archiveRoot, searchRoot, mediaRoot, feedsRoot, wpCategoryRoot, wpTagRoot]) {
    if (value) {
      reserved.add(value);
    }
  }

  return reserved;
}

function validatePostSlugConflicts(posts: ContentEntry[]) {
  const pageSlugs = new Set(getAllPages().map((page) => page.slug));
  const seen = new Set<string>();
  const reservedRootSlugs = getReservedRootSlugs();

  for (const post of posts) {
    if (reservedRootSlugs.has(post.slug)) {
      throw new Error(`Post slug "${post.slug}" conflicts with a reserved route.`);
    }

    if (pageSlugs.has(post.slug)) {
      throw new Error(`Post slug "${post.slug}" conflicts with a page slug.`);
    }

    if (seen.has(post.slug)) {
      throw new Error(`Duplicate post slug "${post.slug}".`);
    }

    seen.add(post.slug);
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

    if (!frontmatter.title || !frontmatter.slug || !frontmatter.date || !frontmatter.categories?.length) {
      throw new Error(`Post "${fileName}" is missing one of: title, slug, date, categories.`);
    }

    return {
      kind: "post",
      title: frontmatter.title,
      slug: normalizeSlug(frontmatter.slug, frontmatter.locale ?? frontmatter.language ?? siteConfig.language),
      description: frontmatter.description,
      language: frontmatter.language ?? siteConfig.language,
      locale: frontmatter.locale ?? frontmatter.language ?? siteConfig.language,
      date: normalizeDate(frontmatter.date),
      lastUpdated: frontmatter.lastUpdated ? normalizeDate(frontmatter.lastUpdated) : undefined,
      draft: frontmatter.draft ?? false,
      content,
      excerpt: buildExcerpt(content),
      readingTime: readingTime(content),
      categories: resolveCategories(frontmatter.categories),
      tags: resolveTags(frontmatter.tags, frontmatter.locale ?? frontmatter.language ?? siteConfig.language),
      series: resolveSeries(frontmatter.series, frontmatter.locale ?? frontmatter.language ?? siteConfig.language),
      permalink: getPostPermalink({
        slug: normalizeSlug(frontmatter.slug, frontmatter.locale ?? frontmatter.language ?? siteConfig.language),
        date: normalizeDate(frontmatter.date)
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
  return getAllPosts().filter((post) => post.series.some((s) => s.slug === slug));
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
  return collectBuckets(getAllPosts(), (post) => post.categories).map((bucket) => ({
    ...bucket,
    description: registry.get(bucket.slug)?.description
  }));
}

export function getTagBuckets() {
  const registry = new Map<string, TagDefinition>(tagRegistry.map((item) => [item.slug, item]));
  return collectBuckets(getAllPosts(), (post) => post.tags).map((bucket) => ({
    ...bucket,
    description: registry.get(bucket.slug)?.description
  }));
}

export function getSeriesBuckets() {
  const registry = new Map<string, SeriesDefinition>(seriesRegistry.map((item) => [item.slug, item]));
  return collectBuckets(
    getAllPosts().filter((post) => post.series.length > 0),
    (post) => post.series
  ).map((bucket) => ({
    ...bucket,
    description: registry.get(bucket.slug)?.description
  }));
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
    if (!post.date) {
      continue;
    }

    const date = new Date(post.date);
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

export function getContentRedirects() {
  const redirects = new Map<string, string>();
  const config = getUrlConfig();

  for (const post of getAllPosts()) {
    for (const alias of post.aliases) {
      redirects.set(alias, post.permalink);
    }

    if (config.wordpress.generateLegacyDateAliases) {
      const legacyPath = getLegacyDatePermalink(post);
      if (legacyPath && legacyPath !== post.permalink) {
        redirects.set(legacyPath, post.permalink);
      }
    }
  }

  for (const page of getAllPages()) {
    for (const alias of page.aliases) {
      redirects.set(alias, page.permalink);
    }
  }

  for (const category of getCategoryBuckets()) {
    redirects.set(joinPath(config.wordpress.legacyCategoryBase, category.slug), category.permalink);
  }

  for (const tag of getTagBuckets()) {
    redirects.set(joinPath(config.wordpress.legacyTagBase, tag.slug), tag.permalink);
  }

  for (const redirect of config.redirects) {
    redirects.set(normalizePathname(redirect.from), normalizePathname(redirect.to));
  }

  return [...redirects.entries()].map(([from, to]) => ({ from, to }));
}

export function getRedirectTarget(pathname: string) {
  const normalized = normalizePathname(pathname);
  
  // Handle WordPress uploads redirect pattern
  // /wp-content/uploads/YYYY/MM/filename.jpg -> /images/YYYY/MM/filename.jpg
  const wpUploadsMatch = normalized.match(/^\/wp-content\/uploads\/(\d{4}\/\d{2}\/.+)$/);
  if (wpUploadsMatch) {
    return `/images/${wpUploadsMatch[1]}`;
  }
  
  return getContentRedirects().find((redirect) => redirect.from === normalized)?.to;
}
