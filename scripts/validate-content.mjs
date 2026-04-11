import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const postsDir = path.join(contentRoot, "posts");
const pagesDir = path.join(contentRoot, "pages");
const categoriesPath = path.join(contentRoot, "categories.ts");
const seriesPath = path.join(contentRoot, "series.ts");
const tagsPath = path.join(contentRoot, "tags.ts");

function extractString(source, pattern, fallback = "") {
  return source.match(pattern)?.[1] ?? fallback;
}

function listMarkdownFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = [];

  function walk(currentPath, relativePath = "") {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      const nextRelativePath = relativePath ? path.join(relativePath, entry.name) : entry.name;

      if (entry.isDirectory()) {
        walk(fullPath, nextRelativePath);
        continue;
      }

      if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        files.push(nextRelativePath);
      }
    }
  }

  walk(dirPath);
  return files.sort((left, right) => left.localeCompare(right));
}

function readRegistry(pathname) {
  if (!fs.existsSync(pathname)) {
    return new Set();
  }

  const source = fs.readFileSync(pathname, "utf8");
  const matches = [...source.matchAll(/slug:\s*"([^"]+)"/g)];
  return new Set(matches.map((match) => match[1]));
}

function normalizeAlias(input) {
  if (typeof input !== "string") {
    return "";
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  const normalized = `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/index" ? "/" : normalized;
}

function normalizeTaxonomyValue(input) {
  if (typeof input === "string") {
    return input.trim();
  }

  if (typeof input === "number" || typeof input === "boolean") {
    return String(input);
  }

  return "";
}

function normalizeSlug(input, locale = "en") {
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

function normalizePathSlug(input, locale = "en") {
  return String(input ?? "")
    .split("/")
    .map((segment) => normalizeSlug(segment, locale))
    .filter(Boolean)
    .join("/");
}

function trimSlashes(input = "") {
  return String(input).replace(/^\/+|\/+$/g, "");
}

function joinPath(...segments) {
  const joined = segments
    .map((segment) => trimSlashes(segment ?? ""))
    .filter(Boolean)
    .join("/");

  return joined ? `/${joined}` : "/";
}

function getPostPermalink(entry, config) {
  const date = new Date(entry.datePublished);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  switch (config.postPermalinkStyle) {
    case "prefix-slug":
      return joinPath(config.postPermalinkPrefix, entry.slug);
    case "year-month-slug":
      return joinPath(year, month, entry.slug);
    case "prefix-year-month-slug":
      return joinPath(config.postPermalinkPrefix, year, month, entry.slug);
    case "slug":
    default:
      return joinPath(entry.slug);
  }
}

function getReservedRootSlugs(config) {
  const reserved = new Set(["posts", "page", "pages", "categories", "tags", "series", "robots.txt", "sitemap.xml"]);

  for (const value of [
    config.postPermalinkPrefix,
    config.archivesBasePath,
    config.searchBasePath,
    config.mediaBasePath,
    config.feedsBasePath,
    config.wpCategoryBase,
    config.wpTagBase,
  ]) {
    const normalized = trimSlashes(value);
    if (normalized) {
      reserved.add(normalized);
    }
  }

  return reserved;
}

function collectSeriesSlugs(series) {
  if (!Array.isArray(series)) {
    return [];
  }

  return series
    .map((entry) => {
      if (typeof entry === "string") {
        return entry.trim();
      }

      if (entry && typeof entry === "object" && typeof entry.slug === "string") {
        return entry.slug.trim();
      }

      return "";
    })
    .filter(Boolean);
}

const categories = readRegistry(categoriesPath);
const seriesRegistry = readRegistry(seriesPath);
const tagsRegistry = readRegistry(tagsPath);
const configSource = fs.readFileSync(path.join(root, "site.config.ts"), "utf8");
const config = {
  siteLanguage: extractString(configSource, /language:\s*"([^"]+)"/, "en"),
  postPermalinkStyle: extractString(configSource, /postPermalink:\s*{[\s\S]*?style:\s*"([^"]+)"/, "slug"),
  postPermalinkPrefix: extractString(configSource, /postPermalink:\s*{[\s\S]*?prefix:\s*"([^"]+)"/, "blog"),
  archivesBasePath: extractString(configSource, /archives:\s*{[\s\S]*?basePath:\s*"([^"]+)"/, ""),
  searchBasePath: extractString(configSource, /search:\s*{[\s\S]*?basePath:\s*"([^"]+)"/, "search"),
  mediaBasePath: extractString(configSource, /media:\s*{[\s\S]*?basePath:\s*"([^"]+)"/, "media"),
  feedsBasePath: extractString(configSource, /feeds:\s*{[\s\S]*?basePath:\s*"([^"]+)"/, "feeds"),
  wpCategoryBase: extractString(configSource, /legacyCategoryBase:\s*"([^"]+)"/, "category"),
  wpTagBase: extractString(configSource, /legacyTagBase:\s*"([^"]+)"/, "tag"),
};

const posts = listMarkdownFiles(postsDir);
const pages = listMarkdownFiles(pagesDir);

let hasErrors = false;

function fail(message) {
  hasErrors = true;
  console.error(message);
}

const seenPostSlugs = new Set();
const seenPageSlugs = new Set();
const seenPostPermalinks = new Set();
const seenPagePermalinks = new Set();
const seenAliases = new Map();
const reservedRootSlugs = getReservedRootSlugs(config);

for (const file of posts) {
  const source = fs.readFileSync(path.join(postsDir, file), "utf8");
  const { data } = matter(source);

  if (
    typeof data.title !== "string" ||
    typeof data.slug !== "string" ||
    !data.slug.trim() ||
    !data.datePublished ||
    !Array.isArray(data.categories) ||
    data.categories.length === 0
  ) {
    fail(`Invalid post frontmatter in ${file}. Required: title, slug, datePublished, categories.`);
    continue;
  }

  if (Number.isNaN(new Date(data.datePublished).getTime())) {
    fail(`Invalid datePublished "${String(data.datePublished)}" in ${file}.`);
  }

  const locale = data.locale ?? data.language ?? config.siteLanguage;
  const normalizedSlug = normalizeSlug(data.slug, locale);
  const permalink = getPostPermalink({
    slug: normalizedSlug,
    datePublished: data.datePublished,
  }, config);

  if (reservedRootSlugs.has(normalizedSlug)) {
    fail(`Post slug "${normalizedSlug}" conflicts with a reserved route in ${file}.`);
  }

  if (seenPostSlugs.has(normalizedSlug)) {
    fail(`Duplicate post slug "${normalizedSlug}" in ${file}.`);
  }
  seenPostSlugs.add(normalizedSlug);

  if (seenPostPermalinks.has(permalink)) {
    fail(`Duplicate post permalink "${permalink}" in ${file}.`);
  }
  seenPostPermalinks.add(permalink);

  for (const category of data.categories.map(normalizeTaxonomyValue).filter(Boolean)) {
    if (!categories.has(category)) {
      fail(`Unknown category "${String(category)}" in ${file}.`);
    }
  }

  for (const series of collectSeriesSlugs(data.series)) {
    if (!seriesRegistry.has(series)) {
      fail(`Unknown series "${series}" in ${file}.`);
    }
  }

  if (Array.isArray(data.tags)) {
    for (const tag of data.tags) {
      const normalizedTag = normalizeTaxonomyValue(tag);
      if (!normalizedTag) {
        fail(`Invalid tag entry "${String(tag)}" in ${file}.`);
        continue;
      }

      if (tagsRegistry.size > 0 && !tagsRegistry.has(normalizedTag) && !tagsRegistry.has(normalizedTag.toLowerCase())) {
        continue;
      }
    }
  }

  if (Array.isArray(data.aliases)) {
    for (const alias of data.aliases) {
      const normalizedAlias = normalizeAlias(alias);
      if (!normalizedAlias) {
        fail(`Invalid alias "${String(alias)}" in ${file}.`);
        continue;
      }

      const previousOwner = seenAliases.get(normalizedAlias);
      if (previousOwner) {
        fail(`Duplicate alias "${normalizedAlias}" in ${file} and ${previousOwner}.`);
        continue;
      }

      seenAliases.set(normalizedAlias, file);
    }
  }
}

for (const file of pages) {
  const source = fs.readFileSync(path.join(pagesDir, file), "utf8");
  const { data } = matter(source);

  if (typeof data.title !== "string" || typeof data.slug !== "string" || !data.slug.trim()) {
    fail(`Invalid page frontmatter in ${file}. Required: title, slug.`);
    continue;
  }

  const locale = data.locale ?? data.language ?? config.siteLanguage;
  const normalizedSlug = normalizePathSlug(data.slug, locale);
  const permalink = normalizedSlug === "index" ? "/" : `/${normalizedSlug}`;
  const rootSlug = normalizedSlug.split("/")[0];

  if (rootSlug && reservedRootSlugs.has(rootSlug) && permalink !== "/") {
    fail(`Page slug "${normalizedSlug}" conflicts with a reserved route in ${file}.`);
  }

  if (seenPageSlugs.has(normalizedSlug)) {
    fail(`Duplicate page slug "${normalizedSlug}" in ${file}.`);
  }
  seenPageSlugs.add(normalizedSlug);

  if (seenPagePermalinks.has(permalink)) {
    fail(`Duplicate page permalink "${permalink}" in ${file}.`);
  }
  seenPagePermalinks.add(permalink);

  if (Array.isArray(data.aliases)) {
    for (const alias of data.aliases) {
      const normalizedAlias = normalizeAlias(alias);
      if (!normalizedAlias) {
        fail(`Invalid alias "${String(alias)}" in ${file}.`);
        continue;
      }

      const previousOwner = seenAliases.get(normalizedAlias);
      if (previousOwner) {
        fail(`Duplicate alias "${normalizedAlias}" in ${file} and ${previousOwner}.`);
        continue;
      }

      seenAliases.set(normalizedAlias, file);
    }
  }
}

for (const permalink of seenPostPermalinks) {
  if (seenPagePermalinks.has(permalink)) {
    fail(`Permalink conflict "${permalink}" exists in both posts and pages.`);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Validated ${posts.length} posts and ${pages.length} pages.`);
