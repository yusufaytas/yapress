/**
 * Global constants for the application
 */

/**
 * Maximum number of categories that can be combined in a single category filter.
 * This limits the depth of multi-category filtering URLs.
 * 
 * Example with MAX_CATEGORY_FILTER_DEPTH = 5:
 * - /categories/engineering ✅
 * - /categories/engineering/documentation ✅
 * - /categories/engineering/documentation/writing ✅
 * - /categories/engineering/documentation/writing/cat4 ✅
 * - /categories/engineering/documentation/writing/cat4/cat5 ✅
 * - /categories/engineering/documentation/writing/cat4/cat5/cat6 ❌ (exceeds limit)
 * 
 * Note: With permutations, n categories generate n! × (2^n - 1) routes
 * - 2 categories: 4 routes
 * - 3 categories: 15 routes
 * - 4 categories: 64 routes
 * - 5 categories: 325 routes
 */
export const MAX_CATEGORY_FILTER_DEPTH = 5;
