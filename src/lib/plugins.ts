/**
 * Plugin system core
 * Handles plugin loading and component injection
 */

import "server-only";

import { createElement } from "react";

import { plugins as configuredPlugins } from "@/plugins.config";
import type { Plugin, PluginContext, PluginSlot } from "@/types/plugin";

/**
 * Load all configured plugins
 */
export function loadPlugins(): Plugin[] {
  return configuredPlugins
    .map((plugin, index) => ({ plugin, index }))
    .filter(({ plugin }) => plugin.enabled !== false)
    .sort((left, right) => {
      const leftOrder = left.plugin.order ?? 0;
      const rightOrder = right.plugin.order ?? 0;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.index - right.index;
    })
    .map(({ plugin }) => plugin);
}

/**
 * Get plugin components for a specific slot
 * @param slot - The slot name to get components for
 * @param context - Context to pass to components (e.g., post data)
 * @returns Array of React elements to render
 */
export function getPluginComponents(slot: PluginSlot, context?: PluginContext) {
  const plugins = loadPlugins();
  const components: React.ReactNode[] = [];

  for (const plugin of plugins) {
    if (!plugin.components?.[slot]) continue;

    const slotComponents = plugin.components[slot];

    for (let i = 0; i < slotComponents.length; i++) {
      const Component = slotComponents[i];
      components.push(
        createElement(Component, {
          key: `${plugin.name}-${slot}-${i}`,
          ...context,
        })
      );
    }
  }
  
  return components;
}

/**
 * Get a specific plugin by name
 */
export function getPlugin(name: string): Plugin | undefined {
  const plugins = loadPlugins();
  return plugins.find((plugin) => plugin.name === name);
}

/**
 * Get all loaded plugins
 */
export function getPlugins(): Plugin[] {
  return loadPlugins();
}
