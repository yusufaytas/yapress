import { afterEach, describe, expect, it } from "vitest";

import siteConfig from "@/site.config";
import {
  getArchivePath,
  getPostPermalink,
  getSearchPath,
  joinPath,
  normalizePathname,
} from "@/lib/urls";

const originalUrlConfig = JSON.parse(JSON.stringify(siteConfig.url ?? {}));

afterEach(() => {
  siteConfig.url = JSON.parse(JSON.stringify(originalUrlConfig));
});

describe("urls", () => {
  it("joins path segments safely", () => {
    expect(joinPath("/blog/", "/2026/", "04", "hello-world")).toBe("/blog/2026/04/hello-world");
  });

  it("normalizes empty and nested paths", () => {
    expect(normalizePathname("")).toBe("/");
    expect(normalizePathname("tags/seo")).toBe("/tags/seo");
  });

  it("builds slug permalinks by default", () => {
    expect(getPostPermalink({ slug: "hello-world", date: new Date("2026-04-10T00:00:00.000Z") })).toBe("/hello-world");
  });

  it("supports prefixed year-month permalinks", () => {
    siteConfig.url = {
      ...siteConfig.url,
      postPermalink: {
        style: "prefix-year-month-slug",
        prefix: "blog",
      },
    };

    expect(getPostPermalink({ slug: "hello-world", date: new Date("2026-04-10T00:00:00.000Z") })).toBe("/blog/2026/04/hello-world");
  });

  it("respects archive configuration", () => {
    siteConfig.url = {
      ...siteConfig.url,
      archives: {
        enabled: true,
        basePath: "",
      },
    };

    expect(getArchivePath("2026", "04")).toBe("/2026/04");
  });

  it("builds shareable search URLs", () => {
    expect(getSearchPath()).toBe("/search");
    expect(getSearchPath("static export")).toBe("/search?q=static%20export");
  });

  it("falls back to the home page when search is disabled", () => {
    siteConfig.url = {
      ...siteConfig.url,
      search: {
        enabled: false,
      },
    };

    expect(getSearchPath()).toBe("/");
    expect(getSearchPath("static export")).toBe("/");
  });
});
