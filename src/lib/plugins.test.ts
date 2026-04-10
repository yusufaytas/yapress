import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ContentEntry } from "@/lib/content";
import type { Plugin } from "@/types/plugin";

vi.mock("server-only", () => ({}));

type PluginModule = typeof import("./plugins");

async function importPluginsModule(plugins: Plugin[]): Promise<PluginModule> {
  vi.resetModules();
  vi.doMock("@/plugins.config", () => ({ plugins }));
  return import("./plugins");
}

describe("plugins", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unmock("@/plugins.config");
  });

  it("filters disabled plugins", async () => {
    const { getPlugins, getPlugin } = await importPluginsModule([
      { name: "enabled-plugin", version: "1.0.0" },
      { name: "disabled-plugin", version: "1.0.0", enabled: false },
    ]);

    expect(getPlugins().map((plugin) => plugin.name)).toEqual(["enabled-plugin"]);
    expect(getPlugin("disabled-plugin")).toBeUndefined();
  });

  it("renders slot components in ascending plugin order", async () => {
    function Third() {
      return null;
    }

    function First() {
      return null;
    }

    function Second() {
      return null;
    }

    const { getPluginComponents } = await importPluginsModule([
      {
        name: "late-plugin",
        version: "1.0.0",
        order: 20,
        components: { footerEnd: [Third] },
      },
      {
        name: "early-plugin",
        version: "1.0.0",
        order: -10,
        components: { footerEnd: [First] },
      },
      {
        name: "middle-plugin",
        version: "1.0.0",
        order: 5,
        components: { footerEnd: [Second] },
      },
    ]);

    const components = getPluginComponents("footerEnd") as ReactElement[];

    expect(components.map((component) => component.type)).toEqual([First, Second, Third]);
  });

  it("keeps registration order for plugins with the same order and passes slot context", async () => {
    function FirstPluginComponent() {
      return null;
    }

    function SecondPluginComponent() {
      return null;
    }

    const { getPluginComponents } = await importPluginsModule([
      {
        name: "first-plugin",
        version: "1.0.0",
        order: 0,
        components: { beforePost: [FirstPluginComponent] },
      },
      {
        name: "second-plugin",
        version: "1.0.0",
        order: 0,
        components: { beforePost: [SecondPluginComponent] },
      },
    ]);

    const post = {
      kind: "post",
      title: "Post title",
    } as ContentEntry;

    const components = getPluginComponents("beforePost", { post }) as ReactElement[];
    const first = components[0] as ReactElement<{ post?: ContentEntry }>;
    const second = components[1] as ReactElement<{ post?: ContentEntry }>;

    expect(components.map((component) => component.type)).toEqual([
      FirstPluginComponent,
      SecondPluginComponent,
    ]);
    expect(first.props.post).toBe(post);
    expect(second.props.post).toBe(post);
  });
});
