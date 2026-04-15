import type { CategoryDefinition } from "@/types/content";

/**
 * Category Registry
 * 
 * Required: All categories used in posts must be registered here.
 * Categories provide the primary taxonomy for organizing content.
 * 
 * Example:
 * {
 *   slug: "tutorials",
 *   title: "Tutorials",
 *   description: "Step-by-step guides and how-tos"
 * }
 */
const categories: CategoryDefinition[] = [];

export default categories;

