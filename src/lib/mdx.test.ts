import { describe, expect, it } from "vitest";

import { normalizeMdxSource } from "@/lib/mdx";
import { siteConfig } from "@/lib/site";

describe("normalizeMdxSource", () => {
  it("escapes bare less-than signs before digits in prose", () => {
    expect(normalizeMdxSource("Local dev in <10 minutes.")).toBe("Local dev in &lt;10 minutes.");
  });

  it("does not change fenced code blocks", () => {
    const source = "```bash\necho \"<10\"\n```";
    expect(normalizeMdxSource(source)).toBe(source);
  });

  it("does not change html tags", () => {
    const source = "<img src=\"/logo.png\" alt=\"logo\" />";
    expect(normalizeMdxSource(source)).toBe(source);
  });

  it("normalizes same-site absolute links to the canonical host and path shape", () => {
    const canonicalHost = new URL(siteConfig.siteUrl).hostname;
    const alternateHost = canonicalHost.startsWith("www.") ? canonicalHost.slice(4) : `www.${canonicalHost}`;
    const source =
      `[API](http://${alternateHost}/good-apis-age-slowly/) and [Roadmap](${siteConfig.siteUrl}//capacity-is-the-roadmap/)`;

    expect(normalizeMdxSource(source)).toBe(
      `[API](${new URL("/good-apis-age-slowly", siteConfig.siteUrl).toString()}) and [Roadmap](${new URL("/capacity-is-the-roadmap", siteConfig.siteUrl).toString()})`
    );
  });

  it("does not rewrite external absolute links", () => {
    const source = "[External](https://example.org/post/)";
    expect(normalizeMdxSource(source)).toBe(source);
  });
});
