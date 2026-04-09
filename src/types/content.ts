/**
 * Content type definitions for YaPress
 * These types define the structure for categories, tags, and series registries
 */

export type CategoryDefinition = {
  slug: string;
  title: string;
  description: string;
};

export type TagDefinition = {
  slug: string;
  title: string;
  description?: string;
};

export type SeriesDefinition = {
  slug: string;
  title: string;
  description: string;
};
