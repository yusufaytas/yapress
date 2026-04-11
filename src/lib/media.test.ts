import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs", () => ({
  default: {
    existsSync: vi.fn(() => true),
    statSync: vi.fn(() => ({ size: 2048 })),
    readFileSync: vi.fn(() =>
      Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x03, 0x20, 0x00, 0x00, 0x02, 0x58,
      ])
    ),
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
    expect(assets[0].width).toBe(800);
    expect(assets[0].height).toBe(600);
    expect(assets[0].references).toHaveLength(2);
  });

  it("finds a media asset by its attachment page path", () => {
    const asset = getMediaAssetByPagePath("/media/images/post-image.png");

    expect(asset?.contentType).toBe("image/png");
  });
});
