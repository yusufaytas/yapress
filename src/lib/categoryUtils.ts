import categoryRegistry from "@/content/categories";

/**
 * Get the canonical order for category slugs based on post count.
 * Categories with more posts have higher priority and appear first.
 * 
 * @param slugs - Array of category slugs to sort
 * @param postCounts - Map of category slug to post count
 * @returns Sorted array with categories in canonical order (most posts first)
 */
export function getCanonicalCategoryOrder(slugs: string[], postCounts?: Map<string, number>): string[] {
  // If no post counts provided, fall back to registry order
  if (!postCounts) {
    const priorityMap = new Map(
      categoryRegistry.map((cat, index) => [cat.slug, index])
    );
    
    return [...slugs].sort((a, b) => {
      const priorityA = priorityMap.get(a) ?? Number.MAX_SAFE_INTEGER;
      const priorityB = priorityMap.get(b) ?? Number.MAX_SAFE_INTEGER;
      return priorityA - priorityB;
    });
  }
  
  // Sort by post count (descending), then by slug alphabetically for ties
  return [...slugs].sort((a, b) => {
    const countA = postCounts.get(a) ?? 0;
    const countB = postCounts.get(b) ?? 0;
    
    if (countA !== countB) {
      return countB - countA; // Higher count first
    }
    
    // Tie-breaker: alphabetical
    return a.localeCompare(b);
  });
}

/**
 * Check if category slugs are in canonical order.
 * 
 * @param slugs - Array of category slugs to check
 * @param postCounts - Map of category slug to post count
 * @returns true if slugs are in canonical order
 */
export function isCanonicalOrder(slugs: string[], postCounts?: Map<string, number>): boolean {
  const canonical = getCanonicalCategoryOrder(slugs, postCounts);
  return slugs.every((slug, index) => slug === canonical[index]);
}
