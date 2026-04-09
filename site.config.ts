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
  };
  bannerImage?: {
    src: string;
    alt?: string;
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
    x?: string;
    newsletter?: string;
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

const siteConfig: SiteConfig = {
  title: "Yapress",
  tagline: "Markdown-first publishing engine",
  description: "A reusable static publishing engine for independent sites.",
  siteUrl: "https://example.com",
  language: "en",
  author: "Site Author",
  url: {
    postPermalink: {
      style: "slug",
      prefix: "blog",
    },
    archives: {
      enabled: true,
      basePath: "",
    },
    search: {
      enabled: true,
      basePath: "search",
      prettyUrls: true,
    },
    media: {
      enabled: true,
      basePath: "media",
    },
    feeds: {
      basePath: "feeds",
      categories: true,
      tags: true,
    },
    redirects: [
      // { from: "/old-path", to: "/new-path" },
    ],
    wordpress: {
      legacyCategoryBase: "category",
      legacyTagBase: "tag",
      generateLegacyDateAliases: true,
    },
  },
  theme: {
    preset: "dark",
    // typography: {
    //   sans: '"IBM Plex Sans", var(--font-sans-base), sans-serif',
    //   serif: '"Fraunces", var(--font-serif-base), serif',
    // },
    // customCssHref: "/theme.css",
    // tokens: {
    //   accent: "#f97316",
    //   link: "#c2410c",
    //   heroTitleSize: "clamp(3rem, 10vw, 7rem)",
    //   h4Size: "1.2rem",
    //   maxWidth: "78rem",
    // },
  },
  logo: { src: "yapress.jpg", "alt": "Yapress" },
  bannerImage: undefined,
  postsPerPage: 5,
  excerptLength: 180,
  keywords: [
    "markdown",
    "mdx",
    "static site",
    "publishing",
    "blog",
    "seo",
    "rss",
    "sitemap",
    "content ownership",
    "taxonomy",
    "categories",
    "tags",
    "series",
    "next.js",
    "yapress"
  ],
  headerLinks: [
    { href: "/", label: "home" },
    { href: "/about", label: "about" },
    { href: "/contact", label: "contact" },
  ],
  navigation: [
    { href: "/", label: "home" },
    { href: "/pages", label: "pages" },
    { href: "/archives", label: "archives" },
    { href: "/categories", label: "categories" },
    { href: "/tags", label: "tags" },
    { href: "/series", label: "series" },
    { href: "/search", label: "search" }
  ],
  footerColumns: [
    {
      title: "Browse",
      links: [
        { href: "/pages", label: "pages" },
        { href: "/archives", label: "archives" },
        { href: "/categories", label: "categories" },
        { href: "/tags", label: "tags" },
        { href: "/series", label: "series" },
        { href: "/search", label: "search" }
      ]
    },
    {
      title: "Links",
      links: [{ href: "https://yusufaytas.com", label: "yusufaytas.com" }]
    },
    {
      title: "Pages",
      links: [
        { href: "/privacy", label: "privacy policy" },
        { href: "/faq", label: "faq" },
        { href: "/contact", label: "contact" },
        { href: "/about", label: "about" }
      ]
    }
  ],
  externalLinks: [],
  social: {
    github: "https://github.com/example/yapress"
  },
  sharing: {
    enabled: true,
    platforms: ["twitter", "linkedin", "reddit", "facebook", "email", "copy"]
  }
};

export default siteConfig;
