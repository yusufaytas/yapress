import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/content", () => ({
  getAllPosts: vi.fn(),
}));

import { getAllPosts } from "@/lib/content";
import { buildRssFeed } from "@/lib/feed";

describe("feed", () => {
  beforeEach(() => {
    vi.mocked(getAllPosts).mockReturnValue([
      {
        title: "A & B",
        permalink: "/a-and-b",
        description: "Description with <xml>",
        excerpt: "Excerpt",
        datePublished: new Date("2026-04-10T00:00:00.000Z"),
      },
    ] as never[]);
  });

  it("builds escaped RSS XML from posts", () => {
    const feed = buildRssFeed();

    expect(feed).toContain("<rss version=\"2.0\">");
    expect(feed).toContain("<title>A &amp; B</title>");
    expect(feed).toContain("Description with &lt;xml&gt;");
    expect(feed).toContain("<guid>https://example.com/a-and-b</guid>");
  });
});
