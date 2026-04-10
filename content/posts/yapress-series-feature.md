---
title: Organizing Content with Series in YaPress
slug: yapress-series-feature
date: 2026-02-22
categories:
  - writing
tags:
  - series
  - organization
  - content-structure
description: Learn how to use the series feature to organize related posts into cohesive multi-part content.
---

Series let you group related posts into sequential, multi-part content. Perfect for tutorials, guides, or any content that builds on previous posts.

## What Are Series?

A series is a collection of related posts that should be read in order. Think of it as chapters in a book or episodes in a show.

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
export const series = {
  'getting-started': {
    name: 'Getting Started with YaPress',
    description: 'Everything you need to know to start using YaPress',
    order: [
      'introducing-yapress',
      'getting-started-yapress',
      'markdown-best-practices',
      'deploying-yapress',
    ],
  },
  
  'advanced-features': {
    name: 'Advanced YaPress Features',
    description: 'Deep dive into advanced functionality',
    order: [
      'yapress-plugin-system',
      'theming-yapress',
      'custom-components',
      'performance-optimization',
    ],
  },
};
```

### Add Posts to Series

In your post frontmatter:

```markdown
---
title: Getting Started with YaPress
slug: getting-started-yapress
date: 2026-01-05
series:
  - getting-started
---
```

### Multiple Series

Posts can belong to multiple series:

```markdown
---
title: Advanced Theming
slug: advanced-theming
series:
  - getting-started
  - advanced-features
  - design-guide
---
```

## Series Configuration

### Basic Series

Minimal configuration:

```typescript
export const series = {
  'tutorial-series': {
    name: 'Tutorial Series',
    description: 'Learn the basics',
    order: ['part-1', 'part-2', 'part-3'],
  },
};
```

### Detailed Series

With more metadata:

```typescript
export const series = {
  'web-performance': {
    name: 'Web Performance Optimization',
    description: 'Complete guide to making your site blazing fast',
    
    // Post order (by slug)
    order: [
      'intro-to-performance',
      'measuring-performance',
      'optimizing-images',
      'code-splitting',
      'caching-strategies',
      'cdn-setup',
    ],
    
    // Optional metadata
    author: 'Jane Developer',
    startDate: '2026-01-01',
    endDate: '2026-03-01',
    difficulty: 'intermediate',
    estimatedTime: '6 hours',
  },
};
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
date: 2026-01-05
series:
  - series-slug
---
```

### Optional Fields

```markdown
---
title: Post Title
slug: post-slug
date: 2026-01-05
series:
  - series-slug
seriesOrder: 2  # Override automatic ordering
seriesNote: "Prerequisites: Basic JavaScript knowledge"
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
export const series = {
  'react-hooks': {
    name: 'Mastering React Hooks',
    description: 'Complete guide to React Hooks from basics to advanced patterns',
    order: [
      'intro-to-hooks',
      'usestate-hook',
      'useeffect-hook',
      'custom-hooks',
      'advanced-patterns',
    ],
    difficulty: 'beginner-to-advanced',
    estimatedTime: '4 hours',
  },
};
```

### Project Series

```typescript
export const series = {
  'building-saas': {
    name: 'Building a SaaS from Scratch',
    description: 'Follow along as we build a complete SaaS application',
    order: [
      'project-planning',
      'tech-stack-selection',
      'database-design',
      'authentication-setup',
      'payment-integration',
      'deployment',
      'scaling',
    ],
    author: 'John Developer',
    startDate: '2026-01-01',
  },
};
```

### Story Series

```typescript
export const series = {
  'startup-journey': {
    name: 'My Startup Journey',
    description: 'Lessons learned building a startup from zero to exit',
    order: [
      'the-idea',
      'first-customers',
      'raising-funding',
      'scaling-team',
      'product-market-fit',
      'the-exit',
    ],
  },
};
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

When adding posts to existing series:

```typescript
export const series = {
  'existing-series': {
    name: 'Existing Series',
    order: [
      'post-1',
      'post-2',
      'new-post',  // Add here
      'post-3',
    ],
  },
};
```

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
1. Post slug matches series order
2. Series slug in frontmatter is correct
3. Post is published (not draft)

### Wrong Order

Verify order in `series.ts`:

```typescript
order: [
  'first-post',   // Shows first
  'second-post',  // Shows second
  'third-post',   // Shows third
],
```

### Series Page 404

Ensure series exists in `series.ts` and matches URL slug.

## Advanced: Dynamic Series

Generate series programmatically:

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
          name: `${tag} Posts`,
          description: `All posts about ${tag}`,
          order: [],
        };
      }
      acc[tag].order.push(post.slug);
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
export const tutorialSeries = (name: string, posts: string[]) => ({
  name: `${name} Tutorial`,
  description: `Learn ${name} step by step`,
  order: posts,
  difficulty: 'beginner',
  type: 'tutorial',
});

// Use template
export const series = {
  'react-tutorial': tutorialSeries('React', [
    'react-basics',
    'react-components',
    'react-hooks',
  ]),
};
```

## Resources

- [Series Examples](https://github.com/yapress/yapress-examples/series)
- [Content Organization Guide](https://yapress.dev/docs/content-organization)

---

Series help you create cohesive, multi-part content that keeps readers engaged and coming back. Plan your series carefully and watch your content library grow into a comprehensive resource.
