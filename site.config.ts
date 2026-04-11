import type { SiteConfig } from "@/types/siteConfig";

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
  logo: { src: "/yapress.jpg", alt: "Yapress", width: 400, height: 400 },
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
    github: "https://github.com/example/yapress",
    linkedin: "https://www.linkedin.com/in/example",
    mentorCruise: "https://mentorcruise.com/mentor/example",
    goodreadsAuthorPage: "https://www.goodreads.com/author/show/example",
    amazonAuthorPage: "https://www.amazon.com/author/example",
    x: "https://x.com/example",
    instagram: "https://www.instagram.com/example",
    facebook: "https://www.facebook.com/example",
    tikTok: "https://www.tiktok.com/@example",
    youtube: "https://www.youtube.com/@example",
    reddit: "https://www.reddit.com/user/example",
    researchGate: "https://www.researchgate.net/profile/Example"
  },
  sharing: {
    enabled: true,
    platforms: ["twitter", "linkedin", "reddit", "email", "copy"]
  }
};

export default siteConfig;
