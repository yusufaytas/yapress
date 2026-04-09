import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const root = process.cwd();
const postsDir = path.join(root, "content", "posts");
const configPath = path.join(root, "site.config.ts");
const publicDir = path.join(root, "public");

function extractString(source, pattern, fallback = "") {
  return source.match(pattern)?.[1] ?? fallback;
}

function extractBoolean(source, pattern, fallback = false) {
  const value = source.match(pattern)?.[1];
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return fallback;
}

function escapeXml(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function joinPath(...segments) {
  const joined = segments
    .map((segment) => String(segment ?? "").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");

  return joined ? `/${joined}` : "/";
}

function getPostPath(post, config) {
  const date = new Date(post.date);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  switch (config.postPermalinkStyle) {
    case "prefix-slug":
      return joinPath(config.postPermalinkPrefix, post.slug);
    case "year-month-slug":
      return joinPath(year, month, post.slug);
    case "prefix-year-month-slug":
      return joinPath(config.postPermalinkPrefix, year, month, post.slug);
    case "slug":
    default:
      return joinPath(post.slug);
  }
}

function buildFeedXml({ siteTitle, siteUrl, siteDescription, items, feedPath }) {
  const xmlItems = items
    .map((post) => {
      const link = `${siteUrl}${post.path}`;
      const description = escapeXml(post.description || post.excerpt || "");

      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${link}</link>`,
        `<guid>${link}</guid>`,
        `<pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
        `<description>${description}</description>`,
        "</item>"
      ].join("");
    })
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    "<rss version=\"2.0\">",
    "<channel>",
    `<title>${escapeXml(siteTitle)}</title>`,
    `<link>${siteUrl}${feedPath}</link>`,
    `<description>${escapeXml(siteDescription)}</description>`,
    xmlItems,
    "</channel>",
    "</rss>"
  ].join("");
}

function writeXml(relativePath, xml) {
  const outputPath = path.join(publicDir, relativePath.replace(/^\//, ""));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, xml);
  return outputPath;
}

const configSource = fs.readFileSync(configPath, "utf8");
const config = {
  siteUrl: extractString(configSource, /siteUrl:\s*"([^"]+)"/),
  siteTitle: extractString(configSource, /title:\s*"([^"]+)"/),
  siteDescription: extractString(configSource, /description:\s*"([^"]+)"/),
  postPermalinkStyle: extractString(configSource, /postPermalink:\s*{[\s\S]*?style:\s*"([^"]+)"/, "slug"),
  postPermalinkPrefix: extractString(configSource, /postPermalink:\s*{[\s\S]*?prefix:\s*"([^"]+)"/, "blog"),
  feedsBasePath: extractString(configSource, /feeds:\s*{[\s\S]*?basePath:\s*"([^"]+)"/, "feeds"),
  categoryFeeds: extractBoolean(configSource, /feeds:\s*{[\s\S]*?categories:\s*(true|false)/, true),
  tagFeeds: extractBoolean(configSource, /feeds:\s*{[\s\S]*?tags:\s*(true|false)/, true),
};

const posts = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
  .map((file) => {
    const source = fs.readFileSync(path.join(postsDir, file), "utf8");
    const { data, content } = matter(source);

    if (!data.title || !data.slug || !data.date || data.draft) {
      return null;
    }

    const excerpt = String(data.description ?? content.replace(/\s+/g, " ").trim().slice(0, 180));

    return {
      title: String(data.title),
      slug: String(data.slug),
      date: String(data.date),
      description: excerpt,
      excerpt,
      categories: Array.isArray(data.categories) ? data.categories.map(String) : [],
      tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) : [],
    };
  })
  .filter(Boolean)
  .map((post) => ({
    ...post,
    path: getPostPath(post, config),
  }))
  .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

const baseFeed = buildFeedXml({
  siteTitle: config.siteTitle,
  siteUrl: config.siteUrl,
  siteDescription: config.siteDescription,
  items: posts,
  feedPath: "/rss.xml",
});

const written = [writeXml("/rss.xml", baseFeed)];

if (config.categoryFeeds) {
  const categoryMap = new Map();

  for (const post of posts) {
    for (const category of post.categories) {
      const existing = categoryMap.get(category) ?? [];
      existing.push(post);
      categoryMap.set(category, existing);
    }
  }

  for (const [slug, items] of categoryMap.entries()) {
    const xml = buildFeedXml({
      siteTitle: `${config.siteTitle} - Category: ${slug}`,
      siteUrl: config.siteUrl,
      siteDescription: `Posts in category ${slug}.`,
      items,
      feedPath: joinPath(config.feedsBasePath, "categories", `${slug}.xml`),
    });
    written.push(writeXml(joinPath(config.feedsBasePath, "categories", `${slug}.xml`), xml));
  }
}

if (config.tagFeeds) {
  const tagMap = new Map();

  for (const post of posts) {
    for (const tag of post.tags) {
      const existing = tagMap.get(tag) ?? [];
      existing.push(post);
      tagMap.set(tag, existing);
    }
  }

  for (const [slug, items] of tagMap.entries()) {
    const xml = buildFeedXml({
      siteTitle: `${config.siteTitle} - Tag: ${slug}`,
      siteUrl: config.siteUrl,
      siteDescription: `Posts tagged ${slug}.`,
      items,
      feedPath: joinPath(config.feedsBasePath, "tags", `${slug}.xml`),
    });
    written.push(writeXml(joinPath(config.feedsBasePath, "tags", `${slug}.xml`), xml));
  }
}

for (const outputPath of written) {
  console.log(`Generated ${outputPath}`);
}
