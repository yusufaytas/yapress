import type { MetadataRoute } from "next";

import {
  getAllPages,
  getAllPosts,
  getCategoryBuckets,
  getDateArchiveBuckets,
  getPaginationParams,
  getSeriesBuckets,
  getTagBuckets
} from "@/lib/content";
import { getMediaAssets } from "@/lib/media";
import { getAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((post) => ({
    url: getAbsoluteUrl(post.permalink),
    lastModified: post.date
  }));

  const pages = getAllPages().map((page) => ({
    url: getAbsoluteUrl(page.permalink)
  }));

  const taxonomies = [
    ...getCategoryBuckets().map((bucket) => ({ url: getAbsoluteUrl(bucket.permalink) })),
    ...getTagBuckets().map((bucket) => ({ url: getAbsoluteUrl(bucket.permalink) })),
    ...getSeriesBuckets().map((bucket) => ({ url: getAbsoluteUrl(bucket.permalink) }))
  ];

  const archives = getDateArchiveBuckets().map((bucket) => ({
    url: getAbsoluteUrl(bucket.permalink)
  }));

  const media = getMediaAssets().map((asset) => ({
    url: getAbsoluteUrl(asset.pagePath)
  }));

  const paginatedRoutes = getPaginationParams().map(({ page }) => ({
    url: getAbsoluteUrl(`/page/${page}`)
  }));

  const staticRoutes = ["/", "/pages", "/archives", "/search", "/categories", "/tags", "/series"].map((pathname) => ({
    url: getAbsoluteUrl(pathname)
  }));

  return [...staticRoutes, ...pages, ...posts, ...taxonomies, ...archives, ...media, ...paginatedRoutes];
}
