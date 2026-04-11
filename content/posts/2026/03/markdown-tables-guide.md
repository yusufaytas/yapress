---
title: Markdown Tables Guide
slug: markdown-tables-guide
datePublished: 2026-03-05
dateModified: 2026-03-05
categories:
  - documentation
tags:
  - markdown
  - tables
  - formatting
  - guide
description: A comprehensive guide to creating and formatting tables in Markdown with various examples and use cases.
---

Tables are a powerful way to organize and present data in a structured format. This guide demonstrates various table styles and use cases in Markdown.

## Basic Table

Here's a simple table with three columns:

| Feature | Status | Priority |
|---------|--------|----------|
| Search functionality | Complete | High |
| Social sharing | Complete | Medium |
| Image optimization | Complete | High |
| Table rendering | In Progress | Medium |

## Alignment Options

You can control text alignment in columns using colons in the separator row:

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Default | Centered | Numbers |
| Text | Content | 1,234 |
| More text | More content | 5,678 |

## Technology Comparison

| Framework | Language | Performance | Learning Curve | Ecosystem |
|-----------|----------|-------------|----------------|-----------|
| Next.js | JavaScript/TypeScript | Excellent | Moderate | Large |
| Gatsby | JavaScript/TypeScript | Very Good | Steep | Medium |
| Hugo | Go Templates | Excellent | Moderate | Small |
| Jekyll | Ruby/Liquid | Good | Easy | Medium |
| Astro | JavaScript/TypeScript | Excellent | Easy | Growing |

## API Response Codes

| Code | Status | Description | Common Use Case |
|------|--------|-------------|-----------------|
| 200 | OK | Request succeeded | Successful GET request |
| 201 | Created | Resource created successfully | Successful POST request |
| 204 | No Content | Success with no response body | Successful DELETE request |
| 400 | Bad Request | Invalid request syntax | Validation error |
| 401 | Unauthorized | Authentication required | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions | Access denied |
| 404 | Not Found | Resource doesn't exist | Invalid endpoint or ID |
| 500 | Internal Server Error | Server-side error | Unexpected server failure |

## Performance Metrics

This table shows performance benchmarks across different configurations:

| Configuration | Load Time (ms) | Time to Interactive (ms) | Lighthouse Score | Bundle Size (KB) |
|---------------|----------------|--------------------------|------------------|------------------|
| Baseline | 1,250 | 2,100 | 78 | 245 |
| With Code Splitting | 890 | 1,650 | 85 | 180 |
| With Image Optimization | 720 | 1,400 | 89 | 175 |
| Fully Optimized | 580 | 1,150 | 94 | 145 |

## Feature Matrix

| Feature | Free | Pro | Enterprise |
|---------|:----:|:---:|:----------:|
| Basic posts | ✓ | ✓ | ✓ |
| Custom themes | ✗ | ✓ | ✓ |
| Analytics | ✗ | ✓ | ✓ |
| Custom domain | ✗ | ✓ | ✓ |
| Priority support | ✗ | ✗ | ✓ |
| SLA guarantee | ✗ | ✗ | ✓ |
| Dedicated hosting | ✗ | ✗ | ✓ |

## Database Schema

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | INTEGER | NO | AUTO_INCREMENT | Primary key |
| title | VARCHAR(255) | NO | - | Post title |
| slug | VARCHAR(255) | NO | - | URL-friendly identifier |
| content | TEXT | YES | NULL | Post content |
| published_at | TIMESTAMP | YES | NULL | Publication date |
| created_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | NO | CURRENT_TIMESTAMP | Last update timestamp |

## Browser Support

| Browser | Minimum Version | Full Support | Notes |
|---------|----------------|--------------|-------|
| Chrome | 90+ | ✓ | All features supported |
| Firefox | 88+ | ✓ | All features supported |
| Safari | 14+ | ✓ | Some CSS features require prefixes |
| Edge | 90+ | ✓ | Chromium-based versions |
| Opera | 76+ | ✓ | All features supported |
| IE 11 | - | ✗ | Not supported |

## Pricing Table

| Plan | Monthly | Annual | Users | Storage | Support |
|------|---------|--------|-------|---------|---------|
| Starter | $9 | $90 (save $18) | 1 | 10 GB | Email |
| Professional | $29 | $290 (save $58) | 5 | 100 GB | Priority Email |
| Team | $99 | $990 (save $198) | 25 | 500 GB | Phone + Email |
| Enterprise | Custom | Custom | Unlimited | Unlimited | Dedicated Account Manager |

## Keyboard Shortcuts

| Action | Windows/Linux | macOS | Description |
|--------|---------------|-------|-------------|
| Save | Ctrl + S | ⌘ + S | Save current document |
| Search | Ctrl + F | ⌘ + F | Open search dialog |
| New Post | Ctrl + N | ⌘ + N | Create new post |
| Bold | Ctrl + B | ⌘ + B | Make text bold |
| Italic | Ctrl + I | ⌘ + I | Make text italic |
| Link | Ctrl + K | ⌘ + K | Insert link |
| Preview | Ctrl + P | ⌘ + P | Toggle preview mode |

## Table Best Practices

When creating tables in Markdown:

1. **Keep it simple** - Tables work best with concise data
2. **Use alignment** - Right-align numbers, center-align status indicators
3. **Consider mobile** - Wide tables will scroll horizontally on small screens
4. **Add context** - Include a caption or description above the table
5. **Test responsiveness** - Verify tables are readable on all devices

## Narrow Table

Sometimes you need a simple two-column table:

| Setting | Value |
|---------|-------|
| Theme | Dark |
| Language | English |
| Timezone | UTC |
| Format | Markdown |

## Wide Table with Many Columns

This table demonstrates horizontal scrolling on smaller screens:

| ID | Name | Email | Role | Department | Location | Start Date | Status | Manager | Phone | Extension |
|----|------|-------|------|------------|----------|------------|--------|---------|-------|-----------|
| 001 | Alice Johnson | alice@example.com | Engineer | Development | New York | 2024-01-15 | Active | Bob Smith | +1-555-0101 | 1001 |
| 002 | Bob Smith | bob@example.com | Manager | Development | New York | 2023-06-01 | Active | Carol White | +1-555-0102 | 1002 |
| 003 | Carol White | carol@example.com | Director | Engineering | San Francisco | 2022-03-10 | Active | David Brown | +1-555-0103 | 1003 |

Tables are an essential tool for presenting structured data. With proper formatting and responsive design, they enhance readability and user experience across all devices.
