---
title: Organizing Content with Series in YaPress
slug: yapress-series-feature
datePublished: 2026-02-22
categories:
  - writing
tags:
  - series
  - organization
  - content-structure
description: Learn how to use the series feature to organize related posts into cohesive multi-part content.
---

Series let you group related posts into multi-part content. Perfect for tutorials, guides, or any content that builds on previous posts.

## What Are Series?

A series is a collection of related posts. If you want a specific reading sequence, set that on each post inside its `series` frontmatter entry.

### Use Cases

- **Tutorials**: Multi-part how-to guides
- **Course Content**: Sequential learning material
- **Story Arcs**: Ongoing narratives
- **Project Logs**: Development diaries
- **Deep Dives**: Comprehensive topic exploration

## Creating a Series

### Define Your Series

Create or edit `content/series.ts`:

```typescript
const series = [
  {
    slug: "getting-started",
    title: "Getting Started with YaPress",
    description: "Everything you need to know to start using YaPress"
  },
  {
    slug: "advanced-features",
    title: "Advanced YaPress Features",
    description: "Deep dive into advanced functionality"
  }
];
```

### Add Posts to Series

In your post frontmatter:

```markdown
---
title: Getting Started with YaPress
slug: getting-started-yapress
datePublished: 2026-01-05
series:
  - slug: getting-started
    order: 2
---
```

### Multiple Series

Posts can belong to multiple series, and each series can have its own position:

```markdown
---
title: Advanced Theming
slug: advanced-theming
datePublished: 2026-02-10
series:
  - slug: getting-started
    order: 4
  - slug: advanced-features
    order: 1
  - slug: design-guide
---
```

## Series Configuration

### Basic Series Registry

Minimal configuration:

```typescript
const series = [
  {
    slug: "tutorial-series",
    title: "Tutorial Series",
    description: "Learn the basics"
  }
];
```

### Ordered Posts Within a Series

With more metadata:

```markdown
---
title: Measuring Performance
slug: measuring-performance
datePublished: 2026-01-12
series:
  - slug: web-performance
    order: 2
---
```

## Series Display

### Automatic Series Navigation

YaPress automatically adds series navigation to posts:

```
┌─────────────────────────────────────┐
│ Part 2 of 5 in Getting Started      │
│                                     │
│ ← Previous: Introducing YaPress     │
│ → Next: Markdown Best Practices     │
└─────────────────────────────────────┘
```

### Series Index Page

View all posts in a series:

```
/series/getting-started/
```

Shows:
- Series title and description
- All posts in order
- Progress indicator
- Estimated reading time

### Series List Page

Browse all series:

```
/series/
```

Displays:
- All available series
- Post count per series
- Series descriptions
- Progress for logged-in users (if tracking enabled)

## Series Frontmatter

### Required Fields

```markdown
---
title: Post Title
slug: post-slug
datePublished: 2026-01-05
series:
  - slug: series-slug
---
```

### Optional Fields

```markdown
---
title: Post Title
slug: post-slug
datePublished: 2026-01-05
series:
  - slug: series-slug
    order: 2
  - slug: another-series
    order: 5
---
```

## Series Navigation Component

The series navigation shows:

1. **Series Name**: Links to series index
2. **Position**: "Part X of Y"
3. **Previous Post**: Link to previous in series
4. **Next Post**: Link to next in series
5. **Progress Bar**: Visual progress indicator

### Customizing Navigation

Edit the series navigation component:

```typescript
// components/series-navigation.tsx
export function SeriesNavigation({ 
  series,
  currentPost,
  allPosts 
}: SeriesNavigationProps) {
  const currentIndex = allPosts.findIndex(p => p.slug === currentPost.slug);
  const previous = allPosts[currentIndex - 1];
  const next = allPosts[currentIndex + 1];
  
  return (
    <div className="series-navigation">
      <div className="series-header">
        <Link href={`/series/${series.slug}`}>
          {series.name}
        </Link>
        <span>Part {currentIndex + 1} of {allPosts.length}</span>
      </div>
      
      <div className="series-progress">
        <div 
          className="progress-bar"
          style={{ width: `${((currentIndex + 1) / allPosts.length) * 100}%` }}
        />
      </div>
      
      <div className="series-links">
        {previous && (
          <Link href={`/posts/${previous.slug}`}>
            ← {previous.title}
          </Link>
        )}
        {next && (
          <Link href={`/posts/${next.slug}`}>
            {next.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
```

## Series Examples

### Tutorial Series

```typescript
const series = [
  {
    slug: "react-hooks",
    title: "Mastering React Hooks",
    description: "Complete guide to React Hooks from basics to advanced patterns"
  }
];
```

### Project Series

```typescript
const series = [
  {
    slug: "building-saas",
    title: "Building a SaaS from Scratch",
    description: "Follow along as we build a complete SaaS application"
  }
];
```

### Story Series

```typescript
const series = [
  {
    slug: "startup-journey",
    title: "My Startup Journey",
    description: "Lessons learned building a startup from zero to exit"
  }
];
```

## Series SEO

### Structured Data

YaPress automatically adds structured data for series:

```json
{
  "@context": "https://schema.org",
  "@type": "Series",
  "name": "Getting Started with YaPress",
  "description": "Everything you need to know",
  "numberOfItems": 5,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "BlogPosting",
        "headline": "Introducing YaPress",
        "url": "https://example.com/posts/introducing-yapress"
      }
    }
  ]
}
```

### Series Sitemap

Series pages are included in sitemap:

```xml
<url>
  <loc>https://example.com/series/getting-started</loc>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

## Series RSS Feeds

Generate RSS feeds per series:

```typescript
// site.config.ts
export default {
  url: {
    feeds: {
      basePath: 'feeds',
      series: true,  // Enable series feeds
    },
  },
};
```

Access at:
```
/feeds/series/getting-started.xml
```

## Best Practices

### Planning Series

1. **Outline First**: Plan all posts before writing
2. **Consistent Length**: Keep posts similar in length
3. **Clear Progression**: Each post builds on previous
4. **Standalone Value**: Posts should work independently too

### Writing Series Posts

1. **Recap Previous**: Brief summary of previous post
2. **Clear Objectives**: State what this post covers
3. **Link Forward**: Tease next post
4. **Consistent Style**: Maintain voice across series

### Series Length

- **Short Series**: 3-5 posts (tutorials)
- **Medium Series**: 6-10 posts (guides)
- **Long Series**: 10+ posts (courses, projects)

### Updating Series

When adding posts to an existing series, update the post frontmatter and give the new post the intended `order` value for that series.

## Series Analytics

Track series engagement:

```typescript
// Track series completion
function trackSeriesProgress(seriesSlug: string, postSlug: string) {
  const series = getSeries(seriesSlug);
  const position = series.order.indexOf(postSlug);
  const progress = ((position + 1) / series.order.length) * 100;
  
  analytics.track('series_progress', {
    series: seriesSlug,
    post: postSlug,
    progress,
  });
}
```

## Series in Navigation

Add series to main navigation:

```typescript
// site.config.ts
export default {
  navigation: [
    { href: '/', label: 'home' },
    { href: '/series', label: 'series' },
    { href: '/archives', label: 'archives' },
  ],
};
```

## Troubleshooting

### Post Not Showing in Series

Check:
1. Series slug in frontmatter is correct
2. Per-post `series[].order` values are set the way you expect
3. Post is published (not draft)

### Wrong Order

Verify the post frontmatter instead:

```markdown
series:
  - slug: getting-started
    order: 1
```

### Series Page 404

Ensure series exists in `series.ts` and matches URL slug.

## Advanced: Dynamic Series

Generate the registry programmatically:

```typescript
// content/series.ts
import { getAllPosts } from '@/lib/content';

export async function generateSeries() {
  const posts = await getAllPosts();
  
  // Auto-generate series from tags
  const seriesByTag = posts.reduce((acc, post) => {
    post.tags?.forEach(tag => {
      if (!acc[tag]) {
        acc[tag] = {
          slug: tag,
          title: `${tag} Posts`,
          description: `All posts about ${tag}`,
        };
      }
    });
    return acc;
  }, {});
  
  return seriesByTag;
}
```

## Series Templates

Create reusable series templates:

```typescript
// Series template for tutorials
export const tutorialSeries = (name: string) => ({
  slug: `${name.toLowerCase()}-tutorial`,
  title: `${name} Tutorial`,
  description: `Learn ${name} step by step`,
});

// Use template
export const series = [
  tutorialSeries("React"),
];
```

## Resources

- [Series Examples](https://github.com/yapress/yapress-examples/series)
- [Content Organization Guide](https://yapress.dev/docs/content-organization)

---

Series help you create cohesive, multi-part content that keeps readers engaged and coming back. Plan your series carefully and watch your content library grow into a comprehensive resource.
