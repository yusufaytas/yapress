export type SiteConfig = {
  title: string;
  tagline?: string;
  description: string;
  siteUrl: string;
  language: string;
  author: string;
  url?: UrlConfig;
  theme?: ThemeName | ThemeConfig;
  logo?: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  bannerImage?: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  postsPerPage?: number;
  excerptLength?: number;
  keywords?: string[];
  headerLinks?: Array<{ href: string; label: string }>;
  navigation: Array<{ href: string; label: string }>;
  footerColumns?: Array<{
    title: string;
    links: Array<{ href: string; label: string }>;
  }>;
  externalLinks?: Array<{ href: string; label: string }>;
  social?: {
    github?: string;
    linkedin?: string;
    mentorCruise?: string;
    goodreadsAuthorPage?: string;
    amazonAuthorPage?: string;
    x?: string;
    instagram?: string;
    facebook?: string;
    tikTok?: string;
    youtube?: string;
    reddit?: string;
    researchGate?: string;
  };
  sharing?: {
    enabled?: boolean;
    platforms?: Array<"twitter" | "linkedin" | "reddit" | "facebook" | "email" | "copy">;
  };
};

export type ThemeName = "dark" | "earth" | "ocean" | "forest";

export type ThemeTokens = Partial<{
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  heroGlow: string;
  headerBg: string;
  overlay: string;
  link: string;
  linkHover: string;
  linkUnderline: string;
  maxWidth: string;
  fontSizeBase: string;
  lineHeightBase: string;
  headingLetterSpacing: string;
  headingLineHeight: string;
  brandSize: string;
  heroTitleSize: string;
  pageTitleSize: string;
  articleTitleSize: string;
  cardTitleSize: string;
  taxonomyTitleSize: string;
  h2Size: string;
  h3Size: string;
  h4Size: string;
  h5Size: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  shadowSoft: string;
  shadowStrong: string;
  shadowHeader: string;
}>;

export type ThemeTypography = Partial<{
  sans: string;
  serif: string;
  mono: string;
}>;

export type ThemeConfig = {
  preset?: ThemeName;
  tokens?: ThemeTokens;
  typography?: ThemeTypography;
  customCssHref?: string;
};

export type PostPermalinkStyle =
  | "slug"
  | "prefix-slug"
  | "year-month-slug"
  | "prefix-year-month-slug";

export type UrlRedirect = {
  from: string;
  to: string;
};

export type UrlConfig = {
  postPermalink?: {
    style?: PostPermalinkStyle;
    prefix?: string;
  };
  archives?: {
    enabled?: boolean;
    basePath?: string;
  };
  search?: {
    enabled?: boolean;
    basePath?: string;
    prettyUrls?: boolean;
  };
  media?: {
    enabled?: boolean;
    basePath?: string;
  };
  feeds?: {
    basePath?: string;
    categories?: boolean;
    tags?: boolean;
  };
  redirects?: UrlRedirect[];
  wordpress?: {
    legacyCategoryBase?: string;
    legacyTagBase?: string;
    generateLegacyDateAliases?: boolean;
  };
};
