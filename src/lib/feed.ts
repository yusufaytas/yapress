import { getAllPosts } from "@/lib/content";
import { getAbsoluteUrl, siteConfig } from "@/lib/site";

function escapeXml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRssFeed() {
  const items = getAllPosts()
    .filter((post) => post.datePublished) // Only include posts with dates
    .map((post) => {
      const link = getAbsoluteUrl(post.permalink);
      const description = escapeXml(post.description ?? post.excerpt);

      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${link}</link>`,
        `<guid>${link}</guid>`,
        `<pubDate>${post.datePublished!.toUTCString()}</pubDate>`,
        `<description>${description}</description>`,
        "</item>"
      ].join("");
    })
    .join("");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    `<title>${escapeXml(siteConfig.title)}</title>`,
    `<link>${siteConfig.siteUrl}</link>`,
    `<description>${escapeXml(siteConfig.description)}</description>`,
    items,
    "</channel>",
    "</rss>"
  ].join("");
}

