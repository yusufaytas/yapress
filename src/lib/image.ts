import { getAbsoluteUrl, siteConfig } from "@/lib/site";

/**
 * Normalizes an image source to an absolute URL.
 * Handles relative paths (starting with /) and absolute URLs.
 * Returns undefined for invalid or empty sources.
 */
function normalizeImageSource(input: string): string | undefined {
  const trimmed = input.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return getAbsoluteUrl(trimmed);
  }

  return undefined;
}

/**
 * Extracts the first image source from markdown or HTML content.
 * Supports both markdown syntax ![alt](url) and HTML <img> tags.
 * Returns the first image found by position in the content.
 */
export function extractFirstImageFromContent(content: string): string | undefined {
  const patterns = [
    /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,  // Markdown: ![alt](url) or ![alt](url "title")
    /<img[^>]+src=["']([^"']+)["']/gi,          // HTML: <img src="url" />
  ];

  let firstMatch: { index: number; src: string } | undefined;

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const src = normalizeImageSource(match[1] ?? "");
      const index = match.index ?? Number.POSITIVE_INFINITY;

      if (!src) {
        continue;
      }

      if (!firstMatch || index < firstMatch.index) {
        firstMatch = { index, src };
      }
    }
  }

  return firstMatch?.src;
}

/**
 * Resolves the image for SEO purposes (Open Graph, Twitter cards, JSON-LD).
 * Priority: explicit image from frontmatter > first image in content > site default
 */
export function resolveContentImage(explicitImage: string | undefined, content: string): string | undefined {
  // Try explicit image from frontmatter
  if (explicitImage) {
    const normalized = normalizeImageSource(explicitImage);
    if (normalized) {
      return normalized;
    }
  }

  // Try extracting from content
  const extractedImage = extractFirstImageFromContent(content);
  if (extractedImage) {
    return extractedImage;
  }

  // Fall back to site default
  return siteConfig.siteImage?.src;
}
