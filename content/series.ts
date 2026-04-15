import type { SeriesDefinition } from "@/types/content";

/**
 * Series Registry
 * 
 * Optional: Define series to group related posts together.
 * Series must be registered here before being used in post frontmatter.
 * 
 * Example:
 * {
 *   slug: "getting-started",
 *   title: "Getting Started",
 *   description: "Introduction to the platform"
 * }
 */
const series: SeriesDefinition[] = [];

export default series;
