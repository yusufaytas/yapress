import fs from "node:fs";
import path from "node:path";

import { getAllPages, getAllPosts } from "@/lib/content";
import { getMediaPagePath, getUrlConfig, normalizePathname } from "@/lib/urls";

type ContentRef = {
  title: string;
  permalink: string;
};

export type MediaAsset = {
  assetPath: string;
  pagePath: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
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

function readPngSize(buffer: Buffer) {
  if (buffer.length < 24 || buffer.toString("ascii", 1, 4) !== "PNG") {
    return undefined;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readGifSize(buffer: Buffer) {
  if (buffer.length < 10 || !buffer.toString("ascii", 0, 3).startsWith("GIF")) {
    return undefined;
  }

  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8),
  };
}

function readJpegSize(buffer: Buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return undefined;
  }

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (!marker || marker === 0xd9 || marker === 0xda) {
      break;
    }

    const length = buffer.readUInt16BE(offset + 2);
    const isSofMarker =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isSofMarker && offset + 8 < buffer.length) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5),
      };
    }

    if (!length || length < 2) {
      break;
    }

    offset += 2 + length;
  }

  return undefined;
}

function readWebpSize(buffer: Buffer) {
  if (buffer.length < 30 || buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return undefined;
  }

  const chunkType = buffer.toString("ascii", 12, 16);

  if (chunkType === "VP8X" && buffer.length >= 30) {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }

  if (chunkType === "VP8 " && buffer.length >= 30) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  if (chunkType === "VP8L" && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  return undefined;
}

function readSvgSize(buffer: Buffer) {
  const source = buffer.toString("utf8");
  const widthMatch = source.match(/\bwidth=["']([\d.]+)(px)?["']/i);
  const heightMatch = source.match(/\bheight=["']([\d.]+)(px)?["']/i);

  if (widthMatch && heightMatch) {
    return {
      width: Math.round(Number(widthMatch[1])),
      height: Math.round(Number(heightMatch[1])),
    };
  }

  const viewBoxMatch = source.match(/\bviewBox=["'][^"']*?(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)["']/i);
  if (!viewBoxMatch) {
    return undefined;
  }

  const viewBoxValues = source.match(/\bviewBox=["']([^"']+)["']/i)?.[1]
    ?.trim()
    .split(/\s+/)
    .map((value) => Number(value));

  if (!viewBoxValues || viewBoxValues.length !== 4 || viewBoxValues.some((value) => Number.isNaN(value))) {
    return undefined;
  }

  return {
    width: Math.round(viewBoxValues[2]),
    height: Math.round(viewBoxValues[3]),
  };
}

function readImageDimensions(absolutePath: string, contentType: string) {
  try {
    const buffer = fs.readFileSync(absolutePath);

    switch (contentType) {
      case "image/png":
        return readPngSize(buffer);
      case "image/gif":
        return readGifSize(buffer);
      case "image/jpeg":
        return readJpegSize(buffer);
      case "image/webp":
        return readWebpSize(buffer);
      case "image/svg+xml":
        return readSvgSize(buffer);
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
}

export function getMediaAssets() {
  if (!getUrlConfig().media.enabled) {
    return [];
  }

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
      const contentType = detectContentType(assetPath);
      const dimensions = readImageDimensions(absolutePath, contentType);
      const pagePath = getMediaPagePath(assetPath);
      if (!pagePath) {
        continue;
      }

      const existing = assets.get(assetPath) ?? {
        assetPath,
        pagePath,
        contentType,
        size: stat.size,
        width: dimensions?.width,
        height: dimensions?.height,
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
  if (!getUrlConfig().media.enabled) {
    return undefined;
  }

  const normalized = normalizePathname(pathname);
  return getMediaAssets().find((asset) => asset.pagePath === normalized);
}
