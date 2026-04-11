import { describe, expect, it } from "vitest";

import { normalizeMdxSource } from "@/lib/mdx";

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
});
