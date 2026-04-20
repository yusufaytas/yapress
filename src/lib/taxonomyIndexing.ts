import siteConfig from "@/site.config";
import type { TaxonomyBucket } from "@/types/content";

export type TaxonomyKind = "categories" | "tags" | "series";

function getTaxonomyMinPosts(kind: TaxonomyKind) {
  const config = siteConfig.seo?.taxonomyIndexing;

  switch (kind) {
    case "tags":
      return config?.tagsMinPosts ?? 1;
    case "series":
      return config?.seriesMinPosts ?? 1;
    case "categories":
    default:
      return config?.categoriesMinPosts ?? 1;
  }
}

export function isTaxonomyBucketIndexable(kind: TaxonomyKind, bucket: TaxonomyBucket) {
  return bucket.posts.length >= getTaxonomyMinPosts(kind);
}

export function getIndexableTaxonomyBuckets(kind: TaxonomyKind, buckets: TaxonomyBucket[]) {
  return buckets.filter((bucket) => isTaxonomyBucketIndexable(kind, bucket));
}
