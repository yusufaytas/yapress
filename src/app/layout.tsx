import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";

import "./globals.css";

import { SiteShell } from "@/components/site-shell";
import { getAllPosts } from "@/lib/content";
import { buildMetadata, buildWebSiteJsonLd, serializeJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { buildThemeStyle, resolveThemeConfig } from "@/lib/theme";

// Load fonts at module scope (required by Next.js)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-base",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif-base",
  display: "swap",
});

export const metadata: Metadata = buildMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  pathname: "/"
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = resolveThemeConfig(siteConfig.theme);

  // Prepare search data
  const posts = getAllPosts();
  const searchPosts = posts.map(post => ({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    date: post.date,
    categories: post.categories.map(c => c.title),
    permalink: post.permalink
  }));

  const jsonLd = buildWebSiteJsonLd();

  return (
    <html
      lang={siteConfig.language}
      data-theme={theme.preset}
      className={`${inter.variable} ${newsreader.variable}`}
      style={buildThemeStyle(siteConfig.theme)}
    >
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        {theme.customCssHref ? <link rel="stylesheet" href={theme.customCssHref} /> : null}
      </head>
      <body>
        <SiteShell searchPosts={searchPosts}>{children}</SiteShell>
      </body>
    </html>
  );
}
