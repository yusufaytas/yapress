import fs from "node:fs";
import path from "node:path";

import { getAllPages, getAllPosts } from "@/lib/content";
import { getMediaPagePath, normalizePathname } from "@/lib/urls";

type ContentRef = {
  title: string;
  permalink: string;
};

export type MediaAsset = {
  assetPath: string;
  pagePath: string;
  contentType: string;
  size: number;
  references: ContentRef[];
};

const PUBLIC_ROOT = path.join(process.cwd(), "public");

function extractLocalImagePaths(source: string) {
  const results = new Set<string>();
  const markdownMatches = source.matchAll(/!\[[^\]]*]\((\/[^)\s]+)(?:\s+"[^"]*")?\)/g);
  const htmlMatches = source.matchAll(/<img[^>]+src=["'](\/[^"']+)["']/g);

  for (const match of [...markdownMatches, ...htmlMatches]) {
    const assetPath = normalizePathname(match[1]);
    if (!assetPath.startsWith("/http")) {
      results.add(assetPath);
    }
  }

  return [...results];
}

function detectContentType(assetPath: string) {
  const extension = path.extname(assetPath).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

export function getMediaAssets() {
  const assets = new Map<string, MediaAsset>();
  const entries = [...getAllPosts(), ...getAllPages()];

  for (const entry of entries) {
    const imagePaths = extractLocalImagePaths(entry.content);

    for (const assetPath of imagePaths) {
      const absolutePath = path.join(PUBLIC_ROOT, assetPath.replace(/^\//, ""));
      if (!fs.existsSync(absolutePath)) {
        continue;
      }

      const stat = fs.statSync(absolutePath);
      const existing = assets.get(assetPath) ?? {
        assetPath,
        pagePath: getMediaPagePath(assetPath),
        contentType: detectContentType(assetPath),
        size: stat.size,
        references: [],
      };

      existing.references.push({
        title: entry.title,
        permalink: entry.permalink,
      });

      assets.set(assetPath, existing);
    }
  }

  return [...assets.values()].sort((left, right) => left.assetPath.localeCompare(right.assetPath));
}

export function getMediaAssetByPagePath(pathname: string) {
  const normalized = normalizePathname(pathname);
  return getMediaAssets().find((asset) => asset.pagePath === normalized);
}
