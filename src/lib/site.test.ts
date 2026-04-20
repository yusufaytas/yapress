import { describe, expect, it } from "vitest";

import { getAbsoluteUrl, normalizeCanonicalPath, normalizeInternalAbsoluteUrl, siteConfig } from "@/lib/site";

describe("site", () => {
  it("builds absolute URLs from the configured site URL", () => {
    expect(getAbsoluteUrl("/tags/seo")).toBe(new URL("/tags/seo", siteConfig.siteUrl).toString());
  });

  it("defaults to the site root", () => {
    expect(getAbsoluteUrl()).toBe(new URL("/", siteConfig.siteUrl).toString());
  });

  it("normalizes canonical paths for HTML pages", () => {
    expect(normalizeCanonicalPath("//good-apis-age-slowly/")).toBe("/good-apis-age-slowly");
    expect(normalizeCanonicalPath("/capacity-is-the-roadmap/?ref=test")).toBe("/capacity-is-the-roadmap?ref=test");
  });

  it("keeps file-like paths intact while normalizing duplicates", () => {
    expect(normalizeCanonicalPath("//feeds//engineering.xml")).toBe("/feeds/engineering.xml");
  });

  it("normalizes same-site absolute URLs to the canonical host and path shape", () => {
    const canonicalHost = new URL(siteConfig.siteUrl).hostname;
    const alternateHost = canonicalHost.startsWith("www.") ? canonicalHost.slice(4) : `www.${canonicalHost}`;

    expect(normalizeInternalAbsoluteUrl(`http://${alternateHost}/good-apis-age-slowly/`)).toBe(
      new URL("/good-apis-age-slowly", siteConfig.siteUrl).toString()
    );
  });

  it("leaves external absolute URLs unchanged", () => {
    expect(normalizeInternalAbsoluteUrl("https://example.org/good-apis-age-slowly/")).toBe(
      "https://example.org/good-apis-age-slowly/"
    );
  });

  it("preserves query strings and hashes while normalizing same-site absolute URLs", () => {
    const canonicalHost = new URL(siteConfig.siteUrl).hostname;

    expect(
      normalizeInternalAbsoluteUrl(`https://${canonicalHost}/capacity-is-the-roadmap/?ref=test#section-2`)
    ).toBe(new URL("/capacity-is-the-roadmap?ref=test#section-2", siteConfig.siteUrl).toString());
  });
});
