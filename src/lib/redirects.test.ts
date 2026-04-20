import { describe, expect, it } from "vitest";

import { getAppRedirects } from "@/lib/redirects";

describe("redirects", () => {
  it("includes framework-level legacy redirects", () => {
    expect(getAppRedirects()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/feed",
          destination: "/rss.xml",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/feed/",
          destination: "/rss.xml",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/category/:slug",
          destination: "/categories/:slug",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/category/:slug/page/:page",
          destination: "/categories/:slug",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/tag/:slug",
          destination: "/tags/:slug",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/tag/:slug/page/:page",
          destination: "/tags/:slug",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/:slug/comment-page-:page",
          destination: "/:slug",
          permanent: true,
        }),
      ])
    );
  });

  it("includes site redirects from site config", () => {
    expect(getAppRedirects()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/wp-content/uploads/:path*",
          destination: "/images/:path*",
          permanent: true,
        }),
      ])
    );
  });

  it("marks redirects as permanent by default", () => {
    const redirects = getAppRedirects();
    expect(redirects.every((redirect) => redirect.permanent)).toBe(true);
  });
});
