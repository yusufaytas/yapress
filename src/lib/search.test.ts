import { describe, expect, it } from "vitest";

import { scoreSearchEntry } from "@/lib/search";

describe("scoreSearchEntry", () => {
  it("weights title matches above category and excerpt matches", () => {
    const score = scoreSearchEntry(["markdown"], {
      title: "markdown guide",
      slug: "guide",
      excerpt: "markdown in the excerpt",
      categories: ["markdown"],
      permalink: "/guide",
    });

    expect(score).toBe(17);
  });

  it("returns zero when there are no matches", () => {
    const score = scoreSearchEntry(["react"], {
      title: "markdown guide",
      slug: "guide",
      excerpt: "plain text only",
      categories: ["writing"],
      permalink: "/guide",
    });

    expect(score).toBe(0);
  });
});
