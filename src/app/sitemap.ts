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
import { getIndexableTaxonomyBuckets } from "@/lib/taxonomyIndexing";
import type { DateArchiveBucket, TaxonomyBucket } from "@/types/content";

export const dynamic = "force-static";

function sortTaxonomyBucketsByPostCount(buckets: TaxonomyBucket[]) {
  return [...buckets].sort((left, right) => {
    if (left.posts.length !== right.posts.length) {
      return right.posts.length - left.posts.length;
    }

    return left.title.localeCompare(right.title);
  });
}

function sortArchiveBucketsByPostCount(buckets: DateArchiveBucket[]) {
  return [...buckets].sort((left, right) => {
    if (left.posts.length !== right.posts.length) {
      return right.posts.length - left.posts.length;
    }

    return right.year.localeCompare(left.year) || right.month.localeCompare(left.month);
  });
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((post) => ({
    url: getAbsoluteUrl(post.permalink),
    lastModified: post.dateModified ?? post.datePublished
  }));

  const pages = getAllPages().map((page) => ({
    url: getAbsoluteUrl(page.permalink)
  }));

  const categories = sortTaxonomyBucketsByPostCount(
    getIndexableTaxonomyBuckets("categories", getCategoryBuckets())
  ).map((bucket) => ({ url: getAbsoluteUrl(bucket.permalink) }));

  const series = sortTaxonomyBucketsByPostCount(
    getIndexableTaxonomyBuckets("series", getSeriesBuckets())
  ).map((bucket) => ({ url: getAbsoluteUrl(bucket.permalink) }));

  const tags = sortTaxonomyBucketsByPostCount(
    getIndexableTaxonomyBuckets("tags", getTagBuckets())
  ).map((bucket) => ({ url: getAbsoluteUrl(bucket.permalink) }));

  const archives = sortArchiveBucketsByPostCount(
    getDateArchiveBuckets()
    .filter((bucket) => bucket.posts.length > 0)
  )
    .map((bucket) => ({
      url: getAbsoluteUrl(bucket.permalink)
    }));

  const media = getMediaAssets()
    .filter((asset) => asset.references.length > 0)
    .map((asset) => ({
      url: getAbsoluteUrl(asset.pagePath)
    }));

  const paginatedRoutes = getPaginationParams(undefined, 2).map(({ page }) => ({
    url: getAbsoluteUrl(`/page/${page}`)
  }));

  const staticRoutes = ["/", "/pages", "/archives", "/categories", "/tags", "/series"].map((pathname) => ({
    url: getAbsoluteUrl(pathname)
  }));

  return [
    ...staticRoutes,
    ...pages,
    ...posts,
    ...categories,
    ...series,
    ...tags,
    ...archives,
    ...media,
    ...paginatedRoutes,
  ];
}
