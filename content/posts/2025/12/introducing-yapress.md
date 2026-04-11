---
title: Introducing YaPress
slug: introducing-yapress
datePublished: 2025-12-15
categories:
  - engineering
tags:
  - static-sites
  - markdown
series:
  - best-practices
description: Why YaPress exists and how its framework/site split works.
---

YaPress is built around a simple rule: content belongs to the site author, while publishing infrastructure belongs to the framework.

That split keeps upgrades predictable and content portable. Let's explore why this matters and how it works.

## The Problem We're Solving

Most static site generators mix framework code with content. This creates problems:

- **Upgrade anxiety**: Framework updates might break your site
- **Vendor lock-in**: Content is tightly coupled to the framework
- **Complexity**: Hard to understand what's framework vs. what's yours
- **Maintenance burden**: Every site needs custom framework modifications

## The YaPress Approach

We maintain a strict boundary between framework and site:

### What the Framework Owns

The framework handles all the publishing infrastructure:

- **Rendering**: Converting markdown to HTML
- **SEO**: Meta tags, Open Graph, Twitter Cards
- **Taxonomy**: Categories, tags, series pages
- **Static export**: Building deployable HTML/CSS/JS
- **Feeds**: RSS and Atom generation
- **Sitemaps**: XML sitemaps for search engines

You never need to touch this code unless you want to contribute to the framework itself.

### What the Site Owns

Your site owns the content and configuration:

- **Posts**: Markdown files in `content/posts/`
- **Pages**: Static pages in `content/pages/`
- **Assets**: Images and files in `public/`
- **Configuration**: Site metadata in `site.config.ts`
- **Categories**: Taxonomy definitions in `content/categories.ts`

This is your domain. The framework never modifies these files.

## Benefits of This Split

### Predictable Upgrades

When the framework updates, your content stays untouched:

```bash
git pull upstream main  # Get framework updates
npm install             # Update dependencies
npm run build           # Your content still works
```

No migration scripts, no breaking changes to your content.

### Content Portability

Because content is separate from framework code, you can:

- Move to another framework anytime
- Run multiple sites on the same framework
- Share content between sites
- Archive content independently

### Clear Ownership

You always know what's yours:

```
content/     ← Your content
site.config.ts ← Your config
public/      ← Your assets

app/         ← Framework
components/  ← Framework
lib/         ← Framework
```

### Multiple Sites

Run multiple independent sites on the same framework:

```
yapress/           # Framework
├── sites/
│   ├── blog/      # Site 1
│   │   ├── content/
│   │   └── site.config.ts
│   ├── docs/      # Site 2
│   │   ├── content/
│   │   └── site.config.ts
│   └── portfolio/ # Site 3
│       ├── content/
│       └── site.config.ts
```

Each site has its own content but shares the framework code.

## How It Works

### Content Loading

The framework provides a content API:

```typescript
import { getAllPosts, getPostBySlug } from '@/lib/content'

// Framework handles parsing, validation, and caching
const posts = await getAllPosts()
```

You write markdown, the framework handles the rest.

### Configuration

Site configuration is declarative:

```typescript
// site.config.ts
export const siteConfig = {
  title: 'My Blog',
  description: 'Thoughts on code and design',
  author: {
    name: 'Jane Developer',
    email: 'jane@example.com',
  },
  // ... more config
}
```

The framework reads this and applies it everywhere.

### Customization

Need custom styling? Edit `src/app/globals.css`.

Need custom components? Edit files in `src/components/`.

Need custom pages? Add routes in `src/app/`.

The framework provides sensible defaults, but you can override anything.

## Technical Architecture

YaPress is built on:

- **Next.js 15**: App Router with static export
- **TypeScript**: Type-safe content and configuration
- **Tailwind CSS**: Utility-first styling
- **MDX**: Markdown with React components

### Build Process

1. **Content discovery**: Find all markdown files
2. **Parsing**: Extract frontmatter and content
3. **Validation**: Check required fields
4. **Transformation**: Convert markdown to HTML
5. **Generation**: Create pages, feeds, sitemaps
6. **Export**: Output static files

All of this happens in the framework. You just run `npm run build`.

## Comparison to Other Tools

### vs. Jekyll/Hugo

- **Similarity**: File-based content
- **Difference**: Modern React-based, better component reuse

### vs. Gatsby

- **Similarity**: React-based, static export
- **Difference**: Simpler, no GraphQL, clearer framework/site split

### vs. WordPress

- **Similarity**: Full-featured publishing
- **Difference**: No database, no PHP, version-controlled content

### vs. Ghost

- **Similarity**: Modern publishing platform
- **Difference**: Static export, no server required, content as files

## Getting Started

Install and run:

```bash
git clone https://github.com/yapress/yapress.git
cd yapress
npm install
npm run dev
```

Add your first post:

```bash
touch content/posts/hello-world.md
```

```markdown
---
title: Hello World
slug: hello-world
date: 2025-12-15
description: My first post
categories:
  - writing
tags:
  - first-post
---

This is my first post with YaPress!
```

Visit `http://localhost:3000` and see it live.

## What's Next

We're working on:

- **Themes**: Shareable design templates
- **Plugins**: Extend functionality without forking
- **Multi-language**: i18n support
- **Search**: Client-side full-text search
- **Comments**: Integration with comment systems

## Contributing

YaPress is open source. We welcome:

- Bug reports
- Feature requests
- Documentation improvements
- Code contributions

Check out the [GitHub repository](https://github.com/yusufaytascom/yapress) to get involved.

## Conclusion

YaPress exists to give you full control over your content while handling the complexity of modern web publishing. The framework/site split makes this possible.

Try it out and let us know what you think!

