# Yapress

Yapress is a markdown-first publishing engine scaffold built around a strict split between framework-owned code and site-owned content. Built with Next.js 15 and React 19, it provides a modern, type-safe foundation for content-driven websites.

## Quick Start

```bash
# Install dependencies
npm install

# Copy starter content (optional - provides example posts and pages)
cp -r content-starter/* content/

# Start development server
npm run dev

# Build for production
npm run build

# Validate content structure
npm run validate:content
```

The `content-starter/` directory contains example posts, pages, and taxonomy configurations to help you get started. Copy it to `content/` to see YaPress in action, then replace with your own content.

**Note:** The framework tests use `content-starter/` to ensure all features work correctly, so don't delete it if you plan to run tests or contribute to the project.

## Project Structure

### Framework-Owned (Don't modify)

- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - Reusable React components
- `src/lib/` - Core utilities (content loading, SEO, feeds)
- `scripts/` - Build and maintenance scripts

### Site-Owned (Customize freely)

- `content/posts/` - Blog posts in Markdown/MDX
- `content/pages/` - Static pages (about, contact, etc.)
- `content/categories.ts` - Category registry
- `content/tags.ts` - Tag registry (optional)
- `content/series.ts` - Series registry (optional)
- `content-starter/` - Example content for reference and testing (don't delete)
- `public/` - Static assets (images, fonts, etc.)
- `site.config.ts` - Site configuration and theming

## Features

### Content Management
- **Markdown/MDX Support** - Write content in Markdown with optional React components
- **Frontmatter Metadata** - Title, description, date, author, categories, tags, series
- **Draft Posts** - Mark posts as drafts to exclude from production builds
- **Related Posts** - Automatic discovery based on shared taxonomies

### Taxonomies
- **Categories** - Required, must be registered in `content/categories.ts`
- **Tags** - Optional, flexible tagging system
- **Tag Registry** - Optional metadata in `content/tags.ts` for custom titles and descriptions
- **Series** - Optional, must be registered in `content/series.ts` to group related posts

### SEO & Discovery
- **Canonical URLs** - Proper canonical link tags
- **Open Graph** - Social media preview cards
- **RSS Feed** - Auto-generated at `/rss.xml`
- **Taxonomy Feeds** - Auto-generated feeds for categories and tags under `/feeds/`
- **Sitemap** - Auto-generated sitemap.xml
- **Robots.txt** - Configurable robots.txt

### Design & UX
- **Theme Presets + Overrides** - Start from `dark`, `earth`, `ocean`, or `forest`, then override tokens, typography, or full CSS
- **Responsive Design** - Mobile-optimized layouts
- **Social Sharing** - Share buttons for Twitter, LinkedIn, Reddit, email, copy link, and native share where supported
- **Pagination** - Configurable posts per page
- **Search** - Client-side content search
- **Date Archives** - Month-based archive pages such as `/2026/04`
- **Media Pages** - Attachment-style pages for referenced local images

### Developer Experience
- **TypeScript** - Full type safety
- **Content Validation** - Validate frontmatter and category references
- **WordPress Import** - Migrate from WordPress XML exports
- **Clean Builds** - Automated cleanup scripts

## Configuration

Edit `site.config.ts` to customize your site:

```typescript
const siteConfig: SiteConfig = {
  title: "Your Site Name",
  tagline: "Your tagline",
  description: "Site description for SEO",
  siteUrl: "https://yourdomain.com",
  language: "en",
  author: "Your Name",
  url: {
    postPermalink: {
      style: "slug" // or "prefix-slug", "year-month-slug", "prefix-year-month-slug"
    },
    redirects: [
      { from: "/old-path", to: "/new-path" }
    ]
  },
  theme: {
    preset: "dark",
    typography: {
      sans: '"IBM Plex Sans", var(--font-sans-base), sans-serif',
      serif: '"Fraunces", var(--font-serif-base), serif'
    },
    tokens: {
      accent: "#f97316",
      link: "#c2410c",
      heroTitleSize: "clamp(3rem, 10vw, 7rem)",
      h4Size: "1.2rem",
      maxWidth: "78rem"
    },
    customCssHref: "/theme.css"
  },
  postsPerPage: 5,
  excerptLength: 180,
  // ... more options
};
```

### Theme Options

- `dark` - Clean dark theme with high contrast
- `earth` - Warm, earthy tones
- `ocean` - Cool blue palette
- `forest` - Natural green theme

### Theming Strategy

Use `site.config.ts` for structured overrides:

- `theme.preset` picks the starting palette
- `theme.tokens` overrides CSS variables such as colors, links, heading sizes, shadows, radius, width, and base type scale
- `theme.typography` overrides the body, heading, and monospace font stacks
- `theme.customCssHref` loads a site-owned stylesheet after the framework CSS so selectors can be fully overridden

Example `public/theme.css`:

```css
:root {
  --accent: #2563eb;
  --link: #1d4ed8;
  --radius-lg: 2rem;
  --hero-title-size: clamp(3rem, 8vw, 5.5rem);
}

.brand {
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.article h1 {
  font-size: clamp(3rem, 8vw, 5rem);
}
```

The practical split is:

- Use `theme.tokens` for system-level design values
- Use `theme.typography` for font families
- Use `public/theme.css` when you want full selector-level control without forking framework files

### URL Strategy

Use `site.config.ts` to control public URL behavior:

- `url.postPermalink.style` controls canonical post URLs
- `url.redirects` is deployment metadata you can use outside YaPress if your host supports redirects
- `aliases` can be used to record legacy URLs during migration, but YaPress does not serve redirects for them

Supported post permalink styles:

- `slug` -> `/<slug>`
- `prefix-slug` -> `/blog/<slug>` using `url.postPermalink.prefix`
- `year-month-slug` -> `/<year>/<month>/<slug>`
- `prefix-year-month-slug` -> `/blog/<year>/<month>/<slug>`

Other public URL features:

- Month archives are generated at `/<year>/<month>`
- Category feeds are generated at `/feeds/categories/<slug>.xml`
- Tag feeds are generated at `/feeds/tags/<slug>.xml`
- Search is available at `/search` with shareable query URLs like `/search?q=markdown`
- Referenced local images get attachment-style pages under `/media/...`

## Content Guidelines

### Post Frontmatter

```markdown
---
title: "Your Post Title"
description: "Brief description for SEO"
date: "2026-04-09"
author: "Author Name"
language: "tr"
locale: "tr"
categories: ["category-slug"]
tags: ["tag1", "tag2"]
series:
  - slug: series-name
aliases: ["/old-post-path"]
draft: false
---

Your content here...
```

Use `language` for the post's content language and `locale` when you need locale-specific casing, slug normalization, and date formatting. For example, Turkish posts should normally use `language: "tr"` and `locale: "tr"` so `I/İ` casing behaves correctly.

### Contact Form

Add a contact form to any page or MDX file:

```mdx
<ContactForm action="https://formspree.io/f/YOUR_FORM_ID" />
```

Features:
- Client-side validation with real-time error feedback
- Accessible with ARIA attributes and keyboard navigation
- Responsive design matching the YaPress theme
- Works with Formspree, Getform, or any JSON-accepting endpoint

The form includes name, email, subject, and message fields with proper validation. Configure your form service (like Formspree) and pass the endpoint URL via the `action` prop.

### Image Grids

Create responsive image galleries with built-in grid layouts:

```html
<!-- 3 columns (default) -->
<div className="image-grid">
  <img src="/image1.jpg" alt="Description" />
  <img src="/image2.jpg" alt="Description" />
  <img src="/image3.jpg" alt="Description" />
</div>

<!-- 2 columns -->
<div className="image-grid-2">
  <img src="/image1.jpg" alt="Description" />
  <img src="/image2.jpg" alt="Description" />
</div>

<!-- 4 or 5 columns also available -->
<div className="image-grid-4">...</div>
<div className="image-grid-5">...</div>
```

Features:
- Responsive (auto-fit on mobile, fixed columns on desktop 64rem+)
- Consistent styling with rounded corners and borders
- Equal height images with `object-fit: cover`
- Available classes: `image-grid` (3 col), `image-grid-2`, `image-grid-4`, `image-grid-5`

### Category Registration

Before using a category, register it in `content/categories.ts`:

```typescript
export const categories = [
  {
    slug: "tutorials",
    name: "Tutorials",
    description: "Step-by-step guides"
  }
];
```

### Series Registration

Before using a series, register it in `content/series.ts`:

```typescript
export const series = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "Introduction to YaPress and basic setup guides"
  }
];
```

## Available Scripts

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build static site for production
- `npm run start` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run validate:content` - Validate content structure and references
- `npm run import:wordpress` - Import content from WordPress XML export

## Updating from Upstream

YaPress is designed to be forked and customized. To pull framework updates while preserving your content:

### Setup Upstream Remote

```bash
# Add the original YaPress repo as upstream (one-time setup)
git remote add upstream https://github.com/yusufaytas/yapress.git

# Fetch upstream changes
git fetch upstream

# Merge upstream changes into your branch
git merge upstream/main
```

### Merge Strategy

The `.gitattributes` file automatically handles merge conflicts:

- **Site-owned files** (your content) - Always keeps your local version
  - `content/**` - Your posts, pages, categories, series
  - `site.config.ts` - Your site configuration
  - `public/**` - Your static assets

- **Framework-owned files** - Always takes upstream version
  - `src/**` - Framework code (app, components, lib)
  - `scripts/**` - Build and utility scripts
  - Config files - Next.js, TypeScript, PostCSS configs

**Note**: If you've added custom npm packages, remove the `package.json merge=theirs` line from `.gitattributes` to manually merge dependencies.

## Deployment

YaPress generates a static site that can be deployed to any static hosting provider:

1. Run `npm run build` to generate the static site
2. Deploy the `out/` directory to your hosting provider
3. Compatible with: Vercel, Netlify, GitHub Pages, Cloudflare Pages, AWS S3, etc.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Static Export)
- **UI**: React 19, Tailwind CSS 4
- **Content**: MDX, gray-matter, remark-gfm
- **Language**: TypeScript 5
- **Testing**: Vitest

## Plugins

YaPress supports a plugin system for extending functionality without modifying framework code.

### Available Official Plugins

- **[@yusufaytas/yapress-plugin-subscription](https://github.com/yusufaytas/yapress-plugin-subscription)** - Newsletter subscriptions (Mailchimp, ConvertKit, custom endpoints)
- **[@yusufaytas/yapress-plugin-comments](https://github.com/yusufaytas/yapress-plugin-comments)** - Comments (Giscus, Utterances, Disqus)
- **[@yusufaytas/yapress-plugin-analytics](https://github.com/yusufaytas/yapress-plugin-analytics)** - Analytics (Plausible, Google Analytics, custom)

### Installing a Plugin

```bash
# Quick install with configuration setup
npm run enable-plugin subscription

# Or manual install
npm install @yusufaytas/yapress-plugin-subscription
```

The `enable-plugin` script will:
1. Install the plugin package from npm
2. Create a configuration file at `plugins/<plugin-name>/config.ts`
3. Register the plugin in `plugins.config.ts`

### Configuring a Plugin

After installation, edit the plugin configuration file:

```typescript
// plugins/subscription/config.ts
import type { SubscriptionConfig } from '@yusufaytas/yapress-plugin-subscription';

export const config: SubscriptionConfig = {
  enabled: true,
  provider: 'mailchimp',
  apiKey: process.env.MAILCHIMP_API_KEY!,
  listId: process.env.MAILCHIMP_LIST_ID!,
  
  placement: {
    afterPost: true,  // Show after blog posts
    popup: false,     // Disable popup
    footer: true,     // Show in footer
  },
  
  ui: {
    title: "Subscribe to our newsletter",
    description: "Get the latest posts delivered right to your inbox.",
    buttonText: "Subscribe",
  }
};
```

Add any required environment variables to `.env.local`:

```bash
# .env.local
MAILCHIMP_API_KEY=your-api-key-here
MAILCHIMP_LIST_ID=your-list-id-here
```

### Plugin Architecture

Plugins are npm packages that integrate with YaPress through a standardized interface:

- **Components**: Inject UI at predefined slots (header, footer, before/after posts, etc.)
- **Configuration**: Type-safe, site-owned configuration with environment variable support
- **Static-First**: Plugins render to static HTML where possible, with optional client-side interactivity

When multiple plugins render into the same slot, YaPress sorts them by ascending `order`. Plugins with the same `order` keep their registration order from `plugins.config.ts`.

Plugin CSS should stay inside the plugin's own markup and inherit the host theme via CSS variables. Avoid relying on app-owned layout selectors or assumptions about surrounding containers beyond the slot you were given.

### Creating Custom Plugins

You can create your own plugins by following the plugin interface:

```typescript
// my-plugin/plugin.ts
import type { Plugin } from '@yusufaytas/yapress-core';

export function createMyPlugin(config: MyConfig): Plugin {
  return {
    name: 'my-plugin',
    version: '1.0.0',
    enabled: config.enabled,
    order: 0,
    components: {
      afterPost: [MyComponent],  // Inject after posts
      footerEnd: [MyFooter],     // Inject in footer
    },
  };
}
```

See the [Plugin Development Guide](https://github.com/yusufaytas/yapress/wiki/Plugin-Development) for more details.

## License

This project structure is designed to be forked and customized for your own site.
