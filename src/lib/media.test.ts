import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
import siteConfig from "@/site.config";

const originalUrlConfig = JSON.parse(JSON.stringify(siteConfig.url ?? {}));

describe("media", () => {
  afterEach(() => {
    siteConfig.url = JSON.parse(JSON.stringify(originalUrlConfig));
  });

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

  it("uses the SVG viewBox width and height for image dimensions", async () => {
    const { default: fs } = await import("node:fs");

    vi.mocked(getAllPosts).mockReturnValue([
      {
        title: "Post with svg",
        permalink: "/post-with-svg",
        content: "![Alt text](/images/icon.svg)",
      },
    ] as never[]);
    vi.mocked(getAllPages).mockReturnValue([] as never[]);
    vi.mocked(fs.readFileSync).mockReturnValue(Buffer.from('<svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"></svg>'));

    const assets = getMediaAssets();

    expect(assets[0].width).toBe(24);
    expect(assets[0].height).toBe(32);
  });

  it("returns no media assets when media pages are disabled", () => {
    siteConfig.url = {
      ...siteConfig.url,
      media: {
        enabled: false,
        basePath: "media",
      },
    };

    expect(getMediaAssets()).toEqual([]);
    expect(getMediaAssetByPagePath("/media/images/post-image.png")).toBeUndefined();
  });
});
