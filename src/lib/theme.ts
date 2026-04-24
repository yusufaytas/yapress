import type { CSSProperties } from "react";

import type { ThemeConfig, ThemeName, ThemeTokens, ThemeTypography } from "@/types/siteConfig";

const themePresets: Record<ThemeName, ThemeTokens> = {
  dark: {
    bg: "#0b0d10",
    surface: "rgba(19, 22, 27, 0.92)",
    border: "rgba(255, 255, 255, 0.1)",
    text: "#f4f5f7",
    muted: "#b0b7c3",
    accent: "#ffffff",
    accentSoft: "rgba(255, 255, 255, 0.12)",
    heroGlow: "rgba(255, 255, 255, 0.05)",
    headerBg: "rgba(11, 13, 16, 0.88)",
    overlay: "rgba(0, 0, 0, 0.5)",
    link: "#f4f5f7",
    linkHover: "#ffffff",
    linkUnderline: "color-mix(in srgb, #ffffff 55%, transparent)",
  },
  earth: {
    bg: "#f4efe6",
    surface: "rgba(255, 252, 247, 0.8)",
    border: "rgba(43, 35, 27, 0.12)",
    text: "#1f1a15",
    muted: "#6a5d50",
    accent: "#b3541e",
    accentSoft: "#f3d2be",
    heroGlow: "rgba(179, 84, 30, 0.12)",
    headerBg: "rgba(244, 239, 230, 0.84)",
    overlay: "rgba(17, 18, 20, 0.38)",
    link: "#8f4217",
    linkHover: "#1f1a15",
    linkUnderline: "color-mix(in srgb, #b3541e 55%, transparent)",
  },
  ocean: {
    bg: "#eaf4f6",
    surface: "rgba(248, 253, 255, 0.84)",
    border: "rgba(18, 63, 77, 0.14)",
    text: "#10242c",
    muted: "#4f6870",
    accent: "#0d7286",
    accentSoft: "#c7e9ef",
    heroGlow: "rgba(13, 114, 134, 0.12)",
    headerBg: "rgba(234, 244, 246, 0.84)",
    overlay: "rgba(11, 36, 44, 0.28)",
    link: "#0d7286",
    linkHover: "#10242c",
    linkUnderline: "color-mix(in srgb, #0d7286 55%, transparent)",
  },
  forest: {
    bg: "#edf3ea",
    surface: "rgba(252, 255, 250, 0.84)",
    border: "rgba(40, 64, 39, 0.13)",
    text: "#172117",
    muted: "#536251",
    accent: "#486b35",
    accentSoft: "#d9e8ce",
    heroGlow: "rgba(72, 107, 53, 0.12)",
    headerBg: "rgba(237, 243, 234, 0.84)",
    overlay: "rgba(20, 29, 20, 0.3)",
    link: "#486b35",
    linkHover: "#172117",
    linkUnderline: "color-mix(in srgb, #486b35 55%, transparent)",
  },
};

const defaultTokens: ThemeTokens = {
  maxWidth: "72rem",
  fontSizeBase: "16px",
  lineHeightBase: "1.6",
  headingLetterSpacing: "-0.03em",
  headingLineHeight: "1.05",
  brandSize: "clamp(1.9rem, 6vw, 3rem)",
  heroTitleSize: "clamp(2.6rem, 11vw, 6rem)",
  pageTitleSize: "clamp(2rem, 7vw, 3rem)",
  articleTitleSize: "clamp(1.8rem, 4vw, 2.5rem)",
  cardTitleSize: "clamp(1.55rem, 4vw, 2.15rem)",
  taxonomyTitleSize: "1.25rem",
  h2Size: "clamp(1.5rem, 2.25vw, 1.9rem)",
  h3Size: "clamp(1.35rem, 2.6vw, 1.65rem)",
  h4Size: "clamp(1.2rem, 2.2vw, 1.4rem)",
  h5Size: "clamp(1.05rem, 1.8vw, 1.15rem)",
  radiusSm: "0.5rem",
  radiusMd: "1rem",
  radiusLg: "1.25rem",
  shadowSoft: "0 14px 50px rgba(0, 0, 0, 0.22)",
  shadowStrong: "0 24px 64px rgba(0, 0, 0, 0.3)",
  shadowHeader: "0 18px 44px rgba(0, 0, 0, 0.14)",
};

const defaultTypography: ThemeTypography = {
  sans: 'var(--font-sans-base), ui-sans-serif, system-ui, sans-serif',
  serif: 'var(--font-serif-base), Georgia, Cambria, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
};

export function resolveThemeConfig(theme?: ThemeName | ThemeConfig) {
  const themeConfig = typeof theme === "string" ? { preset: theme } : theme;
  const preset = themeConfig?.preset ?? "earth";

  return {
    preset,
    tokens: {
      ...themePresets[preset],
      ...defaultTokens,
      ...themeConfig?.tokens,
    },
    typography: {
      ...defaultTypography,
      ...themeConfig?.typography,
    },
    customCssHref: themeConfig?.customCssHref,
  };
}

export function buildThemeStyle(theme?: ThemeName | ThemeConfig): CSSProperties {
  const resolved = resolveThemeConfig(theme);

  return {
    "--bg": resolved.tokens.bg,
    "--surface": resolved.tokens.surface,
    "--border": resolved.tokens.border,
    "--text": resolved.tokens.text,
    "--muted": resolved.tokens.muted,
    "--accent": resolved.tokens.accent,
    "--accent-soft": resolved.tokens.accentSoft,
    "--hero-glow": resolved.tokens.heroGlow,
    "--header-bg": resolved.tokens.headerBg,
    "--overlay": resolved.tokens.overlay,
    "--link": resolved.tokens.link,
    "--link-hover": resolved.tokens.linkHover,
    "--link-underline": resolved.tokens.linkUnderline,
    "--max-width": resolved.tokens.maxWidth,
    "--font-size-base": resolved.tokens.fontSizeBase,
    "--line-height-base": resolved.tokens.lineHeightBase,
    "--heading-letter-spacing": resolved.tokens.headingLetterSpacing,
    "--heading-line-height": resolved.tokens.headingLineHeight,
    "--brand-size": resolved.tokens.brandSize,
    "--hero-title-size": resolved.tokens.heroTitleSize,
    "--page-title-size": resolved.tokens.pageTitleSize,
    "--article-title-size": resolved.tokens.articleTitleSize,
    "--card-title-size": resolved.tokens.cardTitleSize,
    "--taxonomy-title-size": resolved.tokens.taxonomyTitleSize,
    "--h2-size": resolved.tokens.h2Size,
    "--h3-size": resolved.tokens.h3Size,
    "--h4-size": resolved.tokens.h4Size,
    "--h5-size": resolved.tokens.h5Size,
    "--radius-sm": resolved.tokens.radiusSm,
    "--radius-md": resolved.tokens.radiusMd,
    "--radius-lg": resolved.tokens.radiusLg,
    "--shadow-soft": resolved.tokens.shadowSoft,
    "--shadow-strong": resolved.tokens.shadowStrong,
    "--shadow-header": resolved.tokens.shadowHeader,
    "--font-sans": resolved.typography.sans,
    "--font-serif": resolved.typography.serif,
    "--font-mono": resolved.typography.mono,
  } as CSSProperties;
}
