---
title: Markdown Best Practices for YaPress
slug: markdown-best-practices
date: 2025-12-28
categories:
  - writing
tags:
  - markdown
  - workflow
  - documentation
series:
  - best-practices
description: Practical tips and conventions for writing clean, maintainable markdown content.
---

Writing in markdown is liberating, but a few conventions can make your content more maintainable and portable. Here's what actually matters in practice.

## Frontmatter Essentials

Every post needs these fields:

```yaml
---
title: Your Post Title
slug: url-friendly-slug
date: 2026-04-07
description: A concise summary for SEO and feeds
---
```

Optional but recommended:

```yaml
categories:
  - engineering
tags:
  - markdown
  - best-practices
series:
  - tutorial-series-name
```

## Heading Hierarchy

Start with `##` for your first heading (since the title is `h1`):

```markdown
## Main Section

Content here.

### Subsection

More content.
```

Avoid skipping levels (don't jump from `##` to `####`).

## Links and References

Use descriptive link text:

```markdown
<!-- Good -->
Check out the [YaPress documentation](https://github.com/yapress/yapress).

<!-- Avoid -->
Click [here](https://github.com/yapress/yapress) for docs.
```

For internal links, use relative paths:

```markdown
Read more in our [FAQ](/pages/faq).
```

## Code Blocks

Always specify the language for syntax highlighting:

````markdown
```typescript
const greeting: string = "Hello, YaPress!";
```
````

For inline code, use single backticks: `npm install`

## Images

Use descriptive alt text for accessibility:

```markdown
![YaPress dashboard showing post analytics](/images/dashboard.png)
```

Keep images in `public/images/` and optimize them before committing.

## Lists

Use consistent markers:

- Unordered lists with `-`
- Not with `*` or `+`

For ordered lists:

1. First item
2. Second item
3. Third item

## Emphasis

- Use `**bold**` for strong emphasis
- Use `*italic*` for subtle emphasis
- Use `~~strikethrough~~` sparingly

## Blockquotes

Great for highlighting key points:

> Content is the source of truth. Everything else is derived.

## Horizontal Rules

Use `---` for section breaks (not `***` or `___`).

## Line Length

Keep lines under 100 characters when possible. This makes diffs cleaner and content easier to review.

## Validation

Before committing, run:

```bash
node scripts/validate-content.mjs
```

This catches common issues like:

- Missing required frontmatter
- Invalid dates
- Broken internal links
- Duplicate slugs

## Version Control Tips

- One sentence per line for prose (makes diffs cleaner)
- Commit content separately from code changes
- Write meaningful commit messages: "Add post on markdown practices" not "Update content"

## MDX Considerations

YaPress supports MDX, allowing you to embed React components in your markdown:

- Import components at the top of your file
- Keep JSX simple and semantic
- Ensure content remains readable as plain markdown
- Test components render correctly in both dev and production

```mdx
import { Callout } from '@/components/callout'

## My Section

Regular markdown content here.

<Callout type="info">
  This is an MDX component embedded in markdown.
</Callout>

More markdown content.
```

**Note:** MDX files should use the `.mdx` extension, while regular markdown files use `.md`.

## Accessibility

- Use semantic HTML when needed
- Provide alt text for all images
- Ensure sufficient color contrast
- Test with a screen reader

## Performance

- Optimize images (use WebP when possible)
- Keep posts focused (split long content into series)
- Lazy-load heavy embeds

---

Following these conventions keeps your content clean, portable, and easy to maintain. Your future self will thank you.
