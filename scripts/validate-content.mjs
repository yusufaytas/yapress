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

const posts = listMarkdownFiles(postsDir);
const pages = listMarkdownFiles(pagesDir);

let hasErrors = false;

function fail(message) {
  hasErrors = true;
  console.error(message);
}

const seenPostSlugs = new Set();
const seenPageSlugs = new Set();
const seenAliases = new Map();

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

  const normalizedSlug = data.slug.trim();
  if (seenPostSlugs.has(normalizedSlug)) {
    fail(`Duplicate post slug "${normalizedSlug}" in ${file}.`);
  }
  seenPostSlugs.add(normalizedSlug);

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

  const normalizedSlug = data.slug.trim().replace(/^\/+|\/+$/g, "");
  if (seenPageSlugs.has(normalizedSlug)) {
    fail(`Duplicate page slug "${normalizedSlug}" in ${file}.`);
  }
  seenPageSlugs.add(normalizedSlug);

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

for (const slug of seenPostSlugs) {
  if (seenPageSlugs.has(slug)) {
    fail(`Slug conflict "${slug}" exists in both posts and pages.`);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Validated ${posts.length} posts and ${pages.length} pages.`);
