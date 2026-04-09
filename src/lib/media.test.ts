import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
  default: {
    existsSync: vi.fn(() => true),
    statSync: vi.fn(() => ({ size: 2048 })),
  },
}));

vi.mock("@/lib/content", () => ({
  getAllPosts: vi.fn(),
  getAllPages: vi.fn(),
}));

import { getAllPages, getAllPosts } from "@/lib/content";
import { getMediaAssetByPagePath, getMediaAssets } from "@/lib/media";

describe("media", () => {
  beforeEach(() => {
    vi.mocked(getAllPosts).mockReturnValue([
      {
        title: "Post with image",
        permalink: "/post-with-image",
        content: "![Alt text](/images/post-image.png)",
      },
    ] as never[]);

    vi.mocked(getAllPages).mockReturnValue([
      {
        title: "FAQ",
        permalink: "/faq",
        content: "<img src=\"/images/post-image.png\" alt=\"FAQ\" />",
      },
    ] as never[]);
  });

  it("indexes referenced local media assets and their usage", () => {
    const assets = getMediaAssets();

    expect(assets).toHaveLength(1);
    expect(assets[0].assetPath).toBe("/images/post-image.png");
    expect(assets[0].pagePath).toBe("/media/images/post-image.png");
    expect(assets[0].references).toHaveLength(2);
  });

  it("finds a media asset by its attachment page path", () => {
    const asset = getMediaAssetByPagePath("/media/images/post-image.png");

    expect(asset?.contentType).toBe("image/png");
  });
});
