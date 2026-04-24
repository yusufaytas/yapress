import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { mdxComponents } from "@/components/mdx-components";

describe("mdxComponents headings", () => {
  it("renders the heading anchor without leaking the hash into heading text", () => {
    const markup = renderToStaticMarkup(<mdxComponents.h3>The Hosting Move Was Only the Trigger</mdxComponents.h3>);

    expect(markup).toContain('id="the-hosting-move-was-only-the-trigger"');
    expect(markup).toContain('class="heading-anchor"');
    expect(markup).toContain('aria-label="Link to section: The Hosting Move Was Only the Trigger"');
    expect(markup).toContain('<span class="heading-anchor__text">The Hosting Move Was Only the Trigger</span>');
    expect(markup).not.toContain(">#<");
  });
});
