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
});

describe("redirect config", () => {
  it("keeps the host-level wordpress migration redirects", () => {
    const vercelConfigPath = path.join(process.cwd(), "vercel.json");
    const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, "utf8")) as {
      redirects?: Array<{ source: string; destination: string; permanent: boolean }>;
    };

    expect(vercelConfig.redirects).toEqual(
      expect.arrayContaining([
        {
          source: "/category/:slug",
          destination: "/categories/:slug",
          permanent: true,
        },
        {
          source: "/tag/:slug",
          destination: "/tags/:slug",
          permanent: true,
        },
        {
          source: "/wp-content/uploads/:path*",
          destination: "/images/:path*",
          permanent: true,
        },
      ])
    );
  });
});
