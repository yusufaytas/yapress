import { describe, expect, it } from "vitest";

import { getAbsoluteUrl, siteConfig } from "@/lib/site";

describe("site", () => {
  it("builds absolute URLs from the configured site URL", () => {
    expect(getAbsoluteUrl("/tags/seo")).toBe(new URL("/tags/seo", siteConfig.siteUrl).toString());
  });

  it("defaults to the site root", () => {
    expect(getAbsoluteUrl()).toBe(new URL("/", siteConfig.siteUrl).toString());
  });
});
