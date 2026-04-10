---
title: Content as Source of Truth
slug: content-as-source-of-truth
date: 2025-12-20
categories:
  - writing
tags:
  - workflow
  - version-control
series:
  - best-practices
description: The case for file-based publishing with deterministic builds.
---

Publishing systems get fragile when the content model is hidden behind a database or an opaque editor. When your content lives in a proprietary system, you're always one migration away from disaster.

## The Problem with Database-Driven CMS

Traditional content management systems store your content in databases:

- **Opaque**: You can't easily inspect or version control your content
- **Fragile**: Database corruption or migration issues can lose data
- **Locked-in**: Exporting content is often painful or incomplete
- **Complex**: Requires database management, backups, and maintenance

## File-Based Publishing

YaPress takes a different approach. Markdown and MDX files are the canonical source. From those files, it derives:

- HTML pages
- RSS feeds
- Taxonomy pages (categories, tags, series)
- Sitemaps
- Future formats (EPUB, PDF, etc.)

## Benefits of Source-Controlled Content

### Version Control

Every change is tracked in Git:

```bash
git log content/posts/my-post.md
```

You can see who changed what, when, and why. You can roll back mistakes. You can branch and experiment without fear.

### Deterministic Builds

The same input always produces the same output. No hidden state, no database drift, no surprises.

```bash
npm run build  # Always produces the same result from the same content
```

### Portability

Your content is just markdown files. You can:

- Edit with any text editor
- Process with standard Unix tools
- Move to another system anytime
- Archive forever in a readable format

### Collaboration

Multiple authors can work simultaneously using Git workflows:

- Feature branches for drafts
- Pull requests for review
- Merge conflicts are rare and easy to resolve

### Automation

Because content is files, you can automate everything:

```bash
# Validate all content
node scripts/validate-content.mjs

# Generate RSS feed
node scripts/generate-rss.mjs

# Deploy on push
git push origin main  # CI/CD takes over
```

## The Build Pipeline

YaPress transforms source files into a static site:

1. **Parse**: Read markdown files and extract frontmatter
2. **Validate**: Check for required fields and consistency
3. **Transform**: Convert markdown to HTML
4. **Generate**: Create taxonomy pages, feeds, and sitemaps
5. **Export**: Output static HTML/CSS/JS

Each step is inspectable and debuggable.

## Content as Code

Treating content like code brings software engineering practices to publishing:

- **Code review**: Pull requests for content changes
- **Testing**: Validate content before merging
- **CI/CD**: Automatic deployment on merge
- **Rollback**: Revert to any previous version instantly

## Future-Proof

Markdown has been around since 2004 and will be readable for decades. Your content won't be trapped in a proprietary format or obsolete database schema.

## Trade-offs

This approach isn't for everyone:

- **Technical**: Requires Git and command-line comfort
- **No GUI**: No visual editor (though you can use any markdown editor)
- **Build step**: Changes require rebuilding (though this is fast)

But for developers and technical writers, these trade-offs are worth it for the benefits of ownership and portability.

## Conclusion

When content is the source of truth, everything else becomes derivable and replaceable. The framework can evolve, hosting can change, but your content remains yours—portable, version-controlled, and future-proof.

That's the YaPress philosophy.

