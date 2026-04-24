import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("SiteShell source", () => {
  it("renders the brand as non-heading text in the global header", () => {
    const source = readFileSync(path.join(process.cwd(), "src/components/site-shell.tsx"), "utf8");

    expect(source).toContain('<span className="brand">{siteConfig.title}</span>');
    expect(source).not.toContain('<h1 className="brand">{siteConfig.title}</h1>');
  });

  it("uses the article title as the post page h1", () => {
    const source = readFileSync(path.join(process.cwd(), "src/app/[...slug]/page.tsx"), "utf8");

    expect(source).toContain('<h1 className="article-title">{post.title}</h1>');
  });

  it("uses semantic time elements for published and updated dates", () => {
    const contentPageSource = readFileSync(path.join(process.cwd(), "src/app/[...slug]/page.tsx"), "utf8");
    const articleCardSource = readFileSync(path.join(process.cwd(), "src/components/article-card.tsx"), "utf8");

    expect(contentPageSource).toContain('<time dateTime={post.datePublished?.toISOString()}>');
    expect(contentPageSource).toContain('<time dateTime={page.datePublished.toISOString()}>');
    expect(contentPageSource).toContain('<time dateTime={page.dateModified.toISOString()}>');
    expect(articleCardSource).toContain('<time dateTime={post.datePublished?.toISOString()}>');
  });

  it("uses search-specific h1 text in the search view", () => {
    const source = readFileSync(path.join(process.cwd(), "src/components/search-view.tsx"), "utf8");

    expect(source).toContain('const heading = query ? `Search results for “${query}”` : "Search Articles";');
  });
});
