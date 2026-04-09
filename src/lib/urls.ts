import type { UrlConfig } from "@/site.config";
import siteConfig from "@/site.config";

type DatedEntry = {
  slug: string;
  date?: string;
  permalink?: string;
};

const defaultUrlConfig: Required<UrlConfig> = {
  postPermalink: {
    style: "slug",
    prefix: "blog",
  },
  archives: {
    enabled: true,
    basePath: "",
  },
  search: {
    enabled: true,
    basePath: "search",
    prettyUrls: true,
  },
  media: {
    enabled: true,
    basePath: "media",
  },
  feeds: {
    basePath: "feeds",
    categories: true,
    tags: true,
  },
  redirects: [],
  wordpress: {
    legacyCategoryBase: "category",
    legacyTagBase: "tag",
    generateLegacyDateAliases: true,
  },
};

export function trimSlashes(input: string) {
  return input.replace(/^\/+|\/+$/g, "");
}

export function normalizePathname(pathname = "/") {
  const trimmed = trimSlashes(pathname);
  return trimmed ? `/${trimmed}` : "/";
}

export function splitPathname(pathname = "/") {
  return trimSlashes(pathname).split("/").filter(Boolean);
}

export function joinPath(...segments: Array<string | undefined>) {
  const joined = segments
    .map((segment) => trimSlashes(segment ?? ""))
    .filter(Boolean)
    .join("/");

  return joined ? `/${joined}` : "/";
}

export function getUrlConfig() {
  return {
    ...defaultUrlConfig,
    ...siteConfig.url,
    postPermalink: {
      ...defaultUrlConfig.postPermalink,
      ...siteConfig.url?.postPermalink,
    },
    archives: {
      ...defaultUrlConfig.archives,
      ...siteConfig.url?.archives,
    },
    search: {
      ...defaultUrlConfig.search,
      ...siteConfig.url?.search,
    },
    media: {
      ...defaultUrlConfig.media,
      ...siteConfig.url?.media,
    },
    feeds: {
      ...defaultUrlConfig.feeds,
      ...siteConfig.url?.feeds,
    },
    wordpress: {
      ...defaultUrlConfig.wordpress,
      ...siteConfig.url?.wordpress,
    },
    redirects: siteConfig.url?.redirects ?? defaultUrlConfig.redirects,
  };
}

function formatYearMonth(date?: string) {
  if (!date) {
    return null;
  }

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return {
    year: String(value.getUTCFullYear()),
    month: String(value.getUTCMonth() + 1).padStart(2, "0"),
    day: String(value.getUTCDate()).padStart(2, "0"),
  };
}

export function getPostPermalink(entry: DatedEntry) {
  const config = getUrlConfig();
  const prefix = config.postPermalink.prefix;
  const dateParts = formatYearMonth(entry.date);

  switch (config.postPermalink.style) {
    case "prefix-slug":
      return joinPath(prefix, entry.slug);
    case "year-month-slug":
      return dateParts ? joinPath(dateParts.year, dateParts.month, entry.slug) : joinPath(entry.slug);
    case "prefix-year-month-slug":
      return dateParts ? joinPath(prefix, dateParts.year, dateParts.month, entry.slug) : joinPath(prefix, entry.slug);
    case "slug":
    default:
      return joinPath(entry.slug);
  }
}

export function getArchivePath(year: string, month?: string) {
  const config = getUrlConfig();
  if (!config.archives.enabled) {
    return null;
  }

  return joinPath(config.archives.basePath, year, month);
}

export function getSearchPath(query?: string) {
  const basePath = "/search";
  if (!query?.trim()) {
    return basePath;
  }

  return `${basePath}?q=${encodeURIComponent(query.trim())}`;
}

export function getSearchQueryFromSegments(segments?: string[]) {
  if (!segments || segments.length === 0) {
    return "";
  }

  return segments.map(decodeURIComponent).join(" ").trim();
}

export function getMediaPagePath(assetPath: string) {
  const config = getUrlConfig();
  return joinPath(config.media.basePath, trimSlashes(assetPath));
}

export function getCategoryFeedPath(slug: string) {
  const config = getUrlConfig();
  return joinPath(config.feeds.basePath, "categories", `${slug}.xml`);
}

export function getTagFeedPath(slug: string) {
  const config = getUrlConfig();
  return joinPath(config.feeds.basePath, "tags", `${slug}.xml`);
}

export function getLegacyDatePermalink(entry: DatedEntry) {
  const dateParts = formatYearMonth(entry.date);
  if (!dateParts) {
    return null;
  }

  return joinPath(dateParts.year, dateParts.month, dateParts.day, entry.slug);
}

export function isPageOnePath(pathname: string) {
  return normalizePathname(pathname) === "/page/1";
}
