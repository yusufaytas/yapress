/**
 * Plugin type definitions for YaPress
 * These types define the structure for creating and using plugins
 */

import type { ReactNode } from 'react';
import type { ContentEntry } from '@/lib/content';

/**
 * Plugin slot names where components can be injected
 */
export type PluginSlot =
  | "bodyStart"
  | "bodyEnd"
  | "headerStart"
  | "headerEnd"
  | "footerStart"
  | "footerEnd"
  | "beforePost"
  | "afterPost"
  | "popup";

/**
 * Context passed to plugin components
 */
export type PluginContext = {
  post?: ContentEntry;
  page?: ContentEntry;
  [key: string]: any;
};

/**
 * Plugin component type
 */
export type PluginComponent = React.ComponentType<PluginContext>;

/**
 * Plugin definition
 */
export interface Plugin {
  /**
   * Unique plugin identifier
   */
  name: string;
  
  /**
   * Plugin version
   */
  version: string;
  
  /**
   * Plugin description
   */
  description?: string;
  
  /**
   * Whether the plugin is active
   */
  enabled?: boolean;

  /**
   * Lower numbers render earlier within the same slot.
   * Plugins with the same order keep their registration order.
   */
  order?: number;

  components?: Partial<Record<PluginSlot, PluginComponent[]>>;
}

/**
 * Plugin factory function type
 */
export type PluginFactory<TConfig> = (config: TConfig) => Plugin;
