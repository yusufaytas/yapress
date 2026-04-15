# YaPress Starter Content

This directory contains example content to help you get started with YaPress and to ensure framework tests have content to work with.

## What's Included

- **posts/** - Example blog posts demonstrating various features:
  - Markdown and MDX syntax
  - Categories, tags, and series
  - Code highlighting
  - Image galleries
  - Draft posts
  - Multi-language content

- **pages/** - Example static pages:
  - About page
  - Contact page with form
  - FAQ page
  - Privacy policy

- **categories.ts** - Category registry with example categories
- **tags.ts** - Tag registry with example tags and descriptions
- **series.ts** - Series registry for grouping related posts

## Getting Started

To use this starter content in your site:

```bash
# Copy all starter content to your content directory
cp -r content-starter/* content/

# Or copy selectively
cp -r content-starter/posts/* content/posts/
cp -r content-starter/pages/* content/pages/
cp content-starter/categories.ts content/
cp content-starter/tags.ts content/
cp content-starter/series.ts content/
```

## Customizing

Once copied, you can:

1. **Delete example posts** - Remove posts you don't need
2. **Edit taxonomies** - Update categories, tags, and series to match your needs
3. **Modify pages** - Customize the example pages or create new ones
4. **Add your content** - Start writing your own posts and pages

## For Contributors

**Do not delete this directory!** The framework tests use `content-starter/` to validate that all features work correctly. Tests are configured to use this directory via the `CONTENT_DIR` environment variable in `vitest.config.ts`.

If you add new features that require content examples, add them here so tests can validate them.

## Directory Structure

```
content-starter/
├── posts/
│   ├── 2025/
│   │   └── 12/
│   │       ├── content-as-source-of-truth.md
│   │       ├── introducing-yapress.md
│   │       └── markdown-best-practices.md
│   └── 2026/
│       ├── 01/
│       ├── 02/
│       ├── 03/
│       └── 04/
├── pages/
│   ├── about.md
│   ├── contact.md
│   ├── faq.md
│   └── privacy.md
├── categories.ts
├── tags.ts
└── series.ts
```

## Learn More

- See the main [README.md](../README.md) for full documentation
- Check individual post files for frontmatter examples
- Review taxonomy files for registration patterns
