import { describe, expect, it } from "vitest";

import { buildThemeStyle, resolveThemeConfig } from "@/lib/theme";

describe("theme", () => {
  it("resolves preset tokens and defaults", () => {
    const theme = resolveThemeConfig("dark");

    expect(theme.preset).toBe("dark");
    expect(theme.tokens.bg).toBe("#0b0d10");
    expect(theme.tokens.h2Size).toBe("clamp(1.5rem, 2.25vw, 1.9rem)");
    expect(theme.tokens.h3Size).toBe("clamp(1.35rem, 2.6vw, 1.65rem)");
    expect(theme.tokens.h4Size).toBe("clamp(1.2rem, 2.2vw, 1.4rem)");
    expect(theme.typography.sans).toContain("var(--font-sans-base)");
  });

  it("allows token and typography overrides", () => {
    const theme = resolveThemeConfig({
      preset: "earth",
      tokens: {
        accent: "#2563eb",
        pageTitleSize: "4rem",
      },
      typography: {
        serif: '"Fraunces", serif',
      },
    });

    expect(theme.tokens.accent).toBe("#2563eb");
    expect(theme.tokens.pageTitleSize).toBe("4rem");
    expect(theme.typography.serif).toBe('"Fraunces", serif');
  });

  it("builds CSS custom properties from the resolved theme", () => {
    const style = buildThemeStyle({
      preset: "forest",
      tokens: {
        link: "#123456",
      },
    }) as Record<string, string | undefined>;

    expect(style["--bg"]).toBe("#edf3ea");
    expect(style["--link"]).toBe("#123456");
    expect(style["--h2-size"]).toBe("clamp(1.5rem, 2.25vw, 1.9rem)");
    expect(style["--h3-size"]).toBe("clamp(1.35rem, 2.6vw, 1.65rem)");
    expect(style["--h4-size"]).toBe("clamp(1.2rem, 2.2vw, 1.4rem)");
    expect(style["--font-serif"]).toBeDefined();
  });
});
