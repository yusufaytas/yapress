---
title: Frequently Asked Questions
slug: faq
description: Common questions about YaPress and how to use it.
---

## General Questions

### What is YaPress?

YaPress is a markdown-first publishing engine built on Next.js. It's designed for developers who want full control over their content while maintaining clean separation between framework and site code.

### Is YaPress free?

Yes! YaPress is open source and free to use. You can host it anywhere that supports Next.js static exports.

### How is YaPress different from other static site generators?

YaPress maintains a strict boundary between framework code and your content. This means:

- Content stays portable
- Framework updates don't break your site
- You can run multiple independent sites on the same engine

## Getting Started

### What do I need to know to use YaPress?

Basic familiarity with:

- Markdown for writing content
- Git for version control
- Command line basics

You don't need to know React or Next.js to write content, but it helps if you want to customize components.

### How do I install YaPress?

```bash
git clone https://github.com/yapress/yapress.git
cd yapress
npm install
npm run dev
```

Check the [documentation](https://github.com/yapress/yapress) for detailed setup instructions.

## Content Management

### Where do I put my content?

- Blog posts go in `content/posts/`
- Static pages go in `content/pages/`
- Configure categories in `content/categories.ts`

### Can I use MDX?

Yes! YaPress supports both Markdown (.md) and MDX (.mdx) files. Use MDX when you need to embed React components in your content.

### How do I add images?

Place images in the `public/` directory and reference them in your markdown:

```markdown
![Alt text](/images/my-image.jpg)
```

### Can I organize posts in subdirectories?

Currently, posts should be placed directly in `content/posts/`. Subdirectory support is planned for a future release.

## Deployment

### Where can I deploy YaPress?

Anywhere that supports Next.js static exports:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- Your own server

### How do I build for production?

```bash
npm run build
```

This generates a static site in the `out/` directory.

## Customization

### Can I customize the design?

Absolutely! Edit the components in the `components/` directory and styles in `app/globals.css`.

### How do I change site metadata?

Edit `site.config.ts` to update your site title, description, author info, and social links.

### Can I add custom pages?

Yes! Create new routes in the `app/` directory following Next.js App Router conventions.

## Troubleshooting

### My changes aren't showing up

Try:

1. Stop the dev server
2. Delete `.next/` directory
3. Run `npm run dev` again

### Build fails with content errors

Run the validation script:

```bash
node scripts/validate-content.mjs
```

This checks for common content issues like missing frontmatter or invalid dates.

## Still Have Questions?

Check our [GitHub Discussions](https://github.com/yapress/yapress/discussions) or [contact us](/pages/contact) directly.
