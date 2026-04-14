---
title: My Writing Workflow with YaPress
slug: writing-workflow-yapress
datePublished: 2026-01-10
categories:
  - writing
  - engineering
tags:
  - workflow
  - productivity
  - tools
description: A practical workflow for writing, editing, and publishing posts with YaPress.
---

Here's my actual workflow for writing blog posts with YaPress. This is what works for me—adapt it to your needs.

## Tools I Use

- **VS Code**: For writing and editing
- **Git**: For version control
- **Grammarly**: For grammar checking
- **Excalidraw**: For diagrams
- **ImageOptim**: For image compression

## The Writing Process

### 1. Capture Ideas (Ongoing)

I keep a running list in `content/drafts/ideas.md`:

```markdown
# Post Ideas

- [ ] How to optimize Next.js builds
- [ ] My favorite VS Code extensions
- [ ] Debugging React performance issues
- [x] Writing workflow with YaPress (this post!)
```

When inspiration hits, I add it here.

### 2. Create Draft (15 minutes)

When ready to write, I create a new file:

```bash
touch content/posts/my-new-post.md
```

Start with frontmatter and outline:

```markdown
---
title: My New Post
slug: my-new-post
date: 2026-04-04
categories:
  - engineering
tags:
  - tutorial
description: TODO
---

## Introduction

TODO

## Main Points

### Point 1

TODO

### Point 2

TODO

## Conclusion

TODO
```

### 3. Write First Draft (1-2 hours)

I write without editing. Just get ideas down:

- Don't worry about grammar
- Don't worry about structure
- Don't worry about perfection

The goal is to capture thoughts while they're fresh.

### 4. Let It Sit (1 day)

I commit the draft and move on:

```bash
git add content/posts/my-new-post.md
git commit -m "Draft: My new post"
```

Coming back with fresh eyes helps me see issues.

### 5. Edit and Refine (30-60 minutes)

Next day, I edit:

- Fix grammar and typos
- Improve structure
- Add examples and code snippets
- Write the description
- Add relevant tags

I use VS Code's markdown preview:

```
Cmd+Shift+V (Mac) or Ctrl+Shift+V (Windows)
```

### 6. Add Images (15 minutes)

If needed, I add images:

```bash
# Save images to public/images/
# Reference in markdown
![Alt text](/images/my-image.png)
```

I always optimize images first:

```bash
# Using ImageOptim or similar
imageoptim public/images/*.png
```

### 7. Validate (2 minutes)

Before publishing, I validate:

```bash
node scripts/validate-content.mjs
```

This catches:

- Missing frontmatter
- Invalid dates
- Broken internal links

### 8. Preview Locally (5 minutes)

Start the dev server:

```bash
npm run dev
```

Check:

- Post renders correctly
- Images load
- Links work
- Code blocks have syntax highlighting
- Mobile layout looks good

### 9. Publish (2 minutes)

Commit and push:

```bash
git add content/posts/my-new-post.md
git commit -m "Publish: My new post"
git push origin main
```

My CI/CD pipeline automatically:

1. Validates content
2. Builds the site
3. Deploys to production

### 10. Share (5 minutes)

After deployment, I share on:

- Twitter
- LinkedIn
- Dev.to (cross-post)
- Relevant communities

## VS Code Setup

### Extensions I Use

```json
{
  "recommendations": [
    "yzhang.markdown-all-in-one",
    "davidanson.vscode-markdownlint",
    "streetsidesoftware.code-spell-checker",
    "bierner.markdown-preview-github-styles"
  ]
}
```

### Snippets

I created snippets for common patterns. In VS Code, create `.vscode/markdown.code-snippets`:

```json
{
  "Blog Post": {
    "prefix": "post",
    "body": [
      "---",
      "title: ${1:Title}",
      "slug: ${2:slug}",
      "date: ${CURRENT_YEAR}-${CURRENT_MONTH}-${CURRENT_DATE}",
      "categories:",
      "  - ${3:engineering}",
      "tags:",
      "  - ${4:tag}",
      "description: ${5:Description}",
      "---",
      "",
      "$0"
    ]
  }
}
```

Type `post` and press Tab to insert the template.

## Git Workflow

### Branch Strategy

For major posts, I use branches:

```bash
git checkout -b post/my-new-post
# Write and commit
git push origin post/my-new-post
# Create PR for review
```

For quick posts, I commit directly to main.

### Commit Messages

I use prefixes:

- `Draft: Post title` - Initial draft
- `Edit: Post title` - Edits and improvements
- `Publish: Post title` - Ready to publish
- `Fix: Post title` - Corrections after publishing

## Batch Writing

Sometimes I write multiple posts in one session:

```bash
# Create multiple drafts
touch content/posts/post-1.md
touch content/posts/post-2.md
touch content/posts/post-3.md

# Write outlines for all
# Then flesh out one at a time
```

This helps maintain momentum.

## Content Calendar

I keep a simple calendar in `content/drafts/calendar.md`:

```markdown
# Content Calendar

## March 2026

- [x] 2026-03-05: Writing workflow
- [ ] 2026-03-12: VS Code tips
- [ ] 2026-03-19: React performance
- [ ] 2026-03-26: Next.js optimization

## April 2026

- [ ] 2026-04-02: TypeScript patterns
- [ ] 2026-04-09: Testing strategies
```

This keeps me consistent.

## Writing Tips

### Start with Why

Every post should answer: "Why should the reader care?"

### Use Examples

Code examples and screenshots make posts more useful.

### Keep It Scannable

Use:

- Short paragraphs
- Bullet points
- Headings
- Code blocks

### Edit Ruthlessly

Cut anything that doesn't add value.

### Write for Your Past Self

What would have helped you 6 months ago?

## Automation

### Pre-commit Hook

I use a Git hook to validate content before committing:

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Validating content..."
node scripts/validate-content.mjs

if [ $? -ne 0 ]; then
  echo "❌ Content validation failed. Fix errors before committing."
  exit 1
fi

echo "✅ Content validation passed"
exit 0
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

**Note:** This hook runs automatically before every commit. To skip it temporarily (not recommended), use `git commit --no-verify`.

### RSS Generation

After building, I regenerate RSS:

```bash
npm run build && node scripts/generate-rss.mjs
```

## Metrics I Track

I keep a simple log in `content/drafts/metrics.md`:

```markdown
# Metrics

## March 2026

- Posts published: 4
- Total words: 8,500
- Average words per post: 2,125
- Most popular: "Getting Started with YaPress"
```

This helps me understand what resonates.

## Common Issues

### Writer's Block

When stuck:

1. Write the outline first
2. Write the easiest section
3. Take a break and come back
4. Talk through the idea with someone

### Perfectionism

Remember: Published is better than perfect.

Ship it, then improve it based on feedback.

### Time Management

I time-box writing sessions:

- 25 minutes writing
- 5 minutes break
- Repeat

## Resources

- [Hemingway Editor](http://www.hemingwayapp.com/) - Simplify writing
- [Grammarly](https://www.grammarly.com/) - Grammar checking
- [Carbon](https://carbon.now.sh/) - Beautiful code screenshots
- [Excalidraw](https://excalidraw.com/) - Quick diagrams

---

This workflow keeps me productive and consistent. Find what works for you and stick with it.
