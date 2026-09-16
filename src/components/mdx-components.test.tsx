import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { mdxComponents } from "@/components/mdx-components";

vi.mock("next/script", () => ({
  default: ({ children, ...props }: React.ComponentProps<"script">) => (
    <script {...props}>{children}</script>
  ),
}));

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

describe("MDX runtime assets", () => {
  it("renders Script contents as executable inline JavaScript", () => {
    const markup = renderToStaticMarkup(
      <mdxComponents.Script id="presentation-script">{'document.body.dataset.ready = "yes";'}</mdxComponents.Script>
    );

    expect(markup).toBe(
      '<script id="presentation-script">document.body.dataset.ready = "yes";</script>'
    );
  });

  it("renders Style contents as document CSS", () => {
    const markup = renderToStaticMarkup(
      <mdxComponents.Style>{`.slide { color: rebeccapurple; }`}</mdxComponents.Style>
    );

    expect(markup).toBe('<style>.slide { color: rebeccapurple; }</style>');
  });

  it("renders an external stylesheet from public", () => {
    const markup = renderToStaticMarkup(<mdxComponents.Stylesheet href="/code/presentation.css" />);

    expect(markup).toBe('<link rel="stylesheet" href="/code/presentation.css"/>');
  });

  it("rejects unsafe stylesheet URLs", () => {
    expect(mdxComponents.Stylesheet({ href: "javascript:alert(1)" })).toBeNull();
  });
});
