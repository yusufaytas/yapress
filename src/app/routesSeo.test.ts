import { readFileSync } from "node:fs";
import path from "node:path";

import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import HomePage from "@/app/page";
import NotFoundPage, { metadata as notFoundMetadata } from "@/app/not-found";
import PaginatedPostsPage from "@/app/page/[page]/page";
import PagesIndexPage from "@/app/pages/page";

(globalThis as typeof globalThis & { React: typeof React }).React = React;

function extractJsonLd(markup: string) {
  return [...markup.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) =>
    JSON.parse(match[1]) as { "@type"?: string }
  );
}

describe("route SEO", () => {
  it("marks the 404 page as noindex", () => {
    expect(notFoundMetadata.robots).toMatchObject({
      index: false,
      follow: true,
    });
    expect(notFoundMetadata.alternates?.canonical?.toString()).toContain("/404");
  });

  it("emits collection JSON-LD on the home page", () => {
    const markup = renderToStaticMarkup(HomePage());
    const jsonLd = extractJsonLd(markup);

    expect(jsonLd).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "CollectionPage",
          name: "Home",
        }),
      ])
    );
  });

  it("emits collection JSON-LD on paginated archive pages", async () => {
    const page = await PaginatedPostsPage({ params: Promise.resolve({ page: "2" }) });
    const markup = renderToStaticMarkup(page);
    const jsonLd = extractJsonLd(markup);

    expect(jsonLd).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "CollectionPage",
          name: "Page 2",
          url: "https://example.com/page/2",
        }),
      ])
    );
  });

  it("serializes pages index JSON-LD as a valid item list", () => {
    const markup = renderToStaticMarkup(PagesIndexPage());
    const jsonLd = extractJsonLd(markup);

    expect(jsonLd).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "ItemList",
          name: "Pages",
        }),
      ])
    );
  });

  it("renders the not-found page without route-level JSON-LD", () => {
    const markup = renderToStaticMarkup(NotFoundPage());
    const jsonLd = extractJsonLd(markup);

    expect(jsonLd).toHaveLength(0);
  });

  it("links the not-found page to the configured search route", () => {
    const markup = renderToStaticMarkup(NotFoundPage());

    expect(markup).toContain(`href="/search"`);
  });
});

describe("redirect config", () => {
  it("keeps the host-level wordpress migration redirects", async () => {
    const nextConfigPath = path.join(process.cwd(), "next.config.ts");
    const nextConfigContent = readFileSync(nextConfigPath, "utf8");
    
    // Check that redirects are defined in next.config.ts
    expect(nextConfigContent).toContain("async redirects()");
    expect(nextConfigContent).toContain('source: "/category/:slug"');
    expect(nextConfigContent).toContain('destination: "/categories/:slug"');
    expect(nextConfigContent).toContain('source: "/tag/:slug"');
    expect(nextConfigContent).toContain('destination: "/tags/:slug"');
    expect(nextConfigContent).toContain('source: "/wp-content/uploads/:path*"');
    expect(nextConfigContent).toContain('destination: "/images/:path*"');
  });
});
