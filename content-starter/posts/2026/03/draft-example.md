---
title: Draft Post Example
slug: draft-example
datePublished: 2026-03-25
draft: true
categories:
  - documentation
tags:
  - example
  - draft
series:
  - slug: getting-started
description: This is a draft post that won't be published in production.
---

This is a draft post. It will only be visible in development mode.

## Draft Behavior

When `draft: true` is set in the frontmatter:

- **Development**: Post is visible and has a "DRAFT" badge
- **Production**: Post is completely hidden from all listings and direct access

## Multiple Series

This post belongs to two series:
- Getting Started
- Tutorials

Posts can now belong to multiple series, allowing for better content organization and cross-referencing.

## Testing

To test this:

1. Run in development mode - you should see this post with a draft badge
2. Build for production - this post should not appear anywhere
3. Try accessing the URL directly in production - should return 404

## When to Use Drafts

Use the draft flag when:
- Working on a post that's not ready for publication
- Planning future content
- Collaborating on content before release
- Testing new features or layouts
