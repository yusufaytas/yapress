---
title: Migrating from WordPress to YaPress
slug: migrating-from-wordpress
datePublished: 2026-02-18
categories:
  - engineering
tags:
  - migration
  - wordpress
  - tools
description: Complete guide to migrating your WordPress blog to YaPress with automated tools and URL preservation.
---

Moving from WordPress to YaPress gives you full content ownership, better performance, and simpler maintenance. Here's how to migrate your entire site while preserving URLs and SEO.

## Why Migrate from WordPress?

### WordPress Challenges

- **Complexity**: Database, PHP, plugins, themes
- **Performance**: Slow page loads, caching complexity
- **Security**: Constant updates, vulnerability patches
- **Maintenance**: Hosting, backups, updates
- **Lock-in**: Content trapped in database

### YaPress Benefits

- **Simplicity**: Just markdown files
- **Performance**: Static HTML, instant loads
- **Security**: No server-side code to exploit
- **Portability**: Content is yours, in plain text
- **Version Control**: Git tracks every change

## Migration Overview

The process has four main steps:

1. **Export** WordPress content
2. **Import** to YaPress format
3. **Configure** URL redirects
4. **Deploy** and verify

## Step 1: Export from WordPress

### Using WordPress Export Tool

1. Log into WordPress admin
2. Go to Tools → Export
3. Select "All content"
4. Click "Download Export File"

This creates an XML file with all your posts, pages, and metadata.

### What Gets Exported

- Posts and pages
- Categories and tags
- Authors
- Comments
- Media attachments
- Custom fields

## Step 2: Import to YaPress

YaPress includes an automated import script:

```bash
npm run import-wordpress path/to/wordpress-export.xml
```

### What the Script Does

1. **Parses XML**: Reads WordPress export file
2. **Converts Content**: Transforms HTML to Markdown
3. **Extracts Metadata**: Pulls title, date, categories, tags
4. **Downloads Images**: Saves media to `public/images/`
5. **Creates Files**: Generates markdown files in `content/posts/`
6. **Preserves URLs**: Maintains original WordPress URLs

### Import Options

```bash
# Basic import
npm run import-wordpress export.xml

# Specify output directory
npm run import-wordpress export.xml --output content/posts

# Download images
npm run import-wordpress export.xml --download-images

# Preserve WordPress URL structure
npm run import-wordpress export.xml --preserve-urls

# Dry run (preview without creating files)
npm run import-wordpress export.xml --dry-run
```

## Step 3: Review Imported Content

### Check Generated Files

```bash
ls content/posts/
```

Each post becomes a markdown file:

```markdown
---
title: My WordPress Post
slug: my-wordpress-post
date: 2024-03-15
categories:
  - technology
tags:
  - web-development
  - wordpress
description: Original post excerpt
wordpress:
  id: 123
  url: /2024/03/my-wordpress-post/
---

# My WordPress Post

Post content converted to markdown...
```

### Manual Cleanup

Some content may need manual adjustment:

#### Code Blocks

WordPress code blocks might need formatting:

```markdown
<!-- Before -->
<pre><code class="language-javascript">
const x = 1;
</code></pre>

<!-- After -->
```javascript
const x = 1;
```
```

#### Shortcodes

WordPress shortcodes need manual conversion:

```markdown
<!-- Before -->
[gallery ids="1,2,3"]

<!-- After -->
<div className="image-grid">
  <img src="/images/image1.jpg" alt="Description" />
  <img src="/images/image2.jpg" alt="Description" />
  <img src="/images/image3.jpg" alt="Description" />
</div>
```

#### Embedded Content

Convert WordPress embeds:

```markdown
<!-- Before -->
[youtube https://www.youtube.com/watch?v=VIDEO_ID]

<!-- After -->
<iframe 
  width="560" 
  height="315" 
  src="https://www.youtube.com/embed/VIDEO_ID"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullscreen
></iframe>
```

## Step 4: Configure URL Redirects

### Preserve WordPress URLs

YaPress supports WordPress URL compatibility:

```typescript
// site.config.ts
export default {
  url: {
    postPermalink: {
      style: 'year-month-slug',  // Matches WordPress default
    },
    wordpress: {
      legacyCategoryBase: 'category',
      legacyTagBase: 'tag',
      generateLegacyDateAliases: true,
    },
  },
};
```

### URL Structure Options

#### WordPress Default

```
/2024/03/15/my-post/
```

Configure:

```typescript
postPermalink: {
  style: 'year-month-slug',
}
```

#### WordPress with Custom Base

```
/blog/my-post/
```

Configure:

```typescript
postPermalink: {
  style: 'prefix-slug',
  prefix: 'blog',
}
```

#### Simple Slug

```
/my-post/
```

Configure:

```typescript
postPermalink: {
  style: 'slug',
}
```

### Custom Redirects

For posts with changed URLs, add redirects:

```typescript
// site.config.ts
export default {
  url: {
    redirects: [
      { from: '/old-url/', to: '/new-url/' },
      { from: '/2024/03/old-post/', to: '/new-post/' },
    ],
  },
};
```

## Step 5: Migrate Images

### Download Images

The import script can download images:

```bash
npm run import-wordpress export.xml --download-images
```

This:
1. Finds all image URLs in content
2. Downloads images to `public/images/`
3. Updates markdown to reference local images

### Manual Image Migration

If you prefer manual control:

```bash
# Download WordPress uploads directory
scp -r user@server:/var/www/html/wp-content/uploads/ public/images/

# Or use rsync
rsync -avz user@server:/var/www/html/wp-content/uploads/ public/images/
```

### Optimize Images

Compress images before committing:

```bash
# Using ImageOptim (Mac)
imageoptim public/images/**/*.{jpg,png}

# Or use online tools
# - TinyPNG
# - Squoosh
```

## Step 6: Migrate Comments

### Export Comments

WordPress comments can be migrated to:

#### Giscus (GitHub Discussions)

```bash
npm run enable-plugin comments
```

Configure:

```typescript
// plugins/comments/config.ts
export const config = {
  enabled: true,
  provider: 'giscus',
  giscus: {
    repo: 'username/repo',
    repoId: 'R_...',
    category: 'Comments',
    categoryId: 'DIC_...',
  },
};
```

#### Disqus

Export WordPress comments to Disqus:

1. Install Disqus WordPress plugin
2. Export comments to Disqus
3. Configure YaPress Disqus plugin

```typescript
// plugins/comments/config.ts
export const config = {
  enabled: true,
  provider: 'disqus',
  disqus: {
    shortname: 'your-site',
  },
};
```

## Step 7: Configure Site Settings

Update site configuration:

```typescript
// site.config.ts
export default {
  title: 'My Blog',  // From WordPress site title
  description: 'My blog description',  // From WordPress tagline
  siteUrl: 'https://yourdomain.com',
  author: 'Your Name',
  
  // Match WordPress settings
  postsPerPage: 10,  // WordPress posts per page
  excerptLength: 180,
  
  // Social links
  social: {
    github: 'https://github.com/username',
    linkedin: 'https://linkedin.com/in/username',
    mentorCruise: 'https://mentorcruise.com/mentor/username',
    goodreadsAuthorPage: 'https://www.goodreads.com/author/show/author-id',
    amazonAuthorPage: 'https://www.amazon.com/author/username',
    x: 'https://x.com/username',
    instagram: 'https://www.instagram.com/username',
    facebook: 'https://www.facebook.com/yourpage',
    tikTok: 'https://www.tiktok.com/@username',
    youtube: 'https://www.youtube.com/@username',
    reddit: 'https://www.reddit.com/user/username',
    researchGate: 'https://www.researchgate.net/profile/Username',
  },
};
```

## Step 8: Test Locally

Build and preview:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit http://localhost:3000 and check:

- [ ] All posts render correctly
- [ ] Images load
- [ ] Categories and tags work
- [ ] URLs match WordPress structure
- [ ] Code blocks have syntax highlighting
- [ ] Internal links work

## Step 9: Deploy

### Choose Hosting

Deploy to:
- **Vercel**: `vercel`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Push to GitHub
- **Cloudflare Pages**: Connect repository

### Update DNS

Point your domain to new hosting:

```
# Example for Vercel
CNAME: yourdomain.com → cname.vercel-dns.com
```

### SSL Certificate

Most platforms provide automatic SSL:
- Vercel: Automatic
- Netlify: Automatic
- Cloudflare: Automatic

## Step 10: Verify Migration

### Check URLs

Test old WordPress URLs:

```bash
# Should redirect or work
curl -I https://yourdomain.com/2024/03/my-post/
```

### Verify SEO

- [ ] Sitemap: `/sitemap.xml`
- [ ] RSS feed: `/rss.xml`
- [ ] Meta tags on all pages
- [ ] Open Graph images

### Test Performance

Run Lighthouse audit:

```bash
npx lighthouse https://yourdomain.com
```

Target scores:
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

## Troubleshooting

### Images Not Loading

Check image paths:

```markdown
<!-- Absolute path (wrong) -->
![Image](/wp-content/uploads/image.jpg)

<!-- Relative path (correct) -->
![Image](/images/image.jpg)
```

### Broken Internal Links

Update WordPress links:

```bash
# Find WordPress links
grep -r "yourdomain.com" content/posts/

# Replace with relative links
# /2024/03/post/ → /posts/post/
```

### Missing Metadata

Add missing frontmatter:

```markdown
---
title: Post Title
slug: post-slug
date: 2024-03-15
categories:
  - uncategorized
tags:
  - general
description: Add a description
---
```

### Build Errors

Validate content:

```bash
node scripts/validate-content.mjs
```

Fix reported errors before deploying.

## Post-Migration Checklist

- [ ] All posts imported
- [ ] Images migrated and optimized
- [ ] URLs preserved or redirected
- [ ] Comments migrated
- [ ] Site settings configured
- [ ] Local testing complete
- [ ] Deployed to production
- [ ] DNS updated
- [ ] SSL certificate active
- [ ] Old WordPress site backed up
- [ ] Sitemap submitted to search engines
- [ ] Analytics configured
- [ ] Social sharing tested

## Maintaining Both Sites

During transition, you can run both:

1. Keep WordPress at old domain
2. Deploy YaPress to new domain
3. Test thoroughly
4. Switch DNS when ready

Or use a subdomain:

- WordPress: `old.yourdomain.com`
- YaPress: `yourdomain.com`

## WordPress Export Script

For custom exports, use WP-CLI:

```bash
# Export all posts
wp export --post_type=post --dir=./export

# Export specific category
wp export --post_type=post --category=technology

# Export date range
wp export --start_date=2024-01-01 --end_date=2024-12-31
```

## Advanced: Custom Import Script

For complex migrations, customize the import:

```javascript
// scripts/custom-import.mjs
import { parseWordPressXML } from './import-wordpress.mjs';

const posts = await parseWordPressXML('export.xml');

for (const post of posts) {
  // Custom transformations
  post.content = post.content
    .replace(/\[custom-shortcode\]/g, '<CustomComponent />')
    .replace(/old-domain\.com/g, 'new-domain.com');
  
  // Custom frontmatter
  post.customField = post.meta.custom_field;
  
  // Save post
  await savePost(post);
}
```

## Resources

- [WordPress Export Documentation](https://wordpress.org/support/article/tools-export-screen/)
- [WP-CLI](https://wp-cli.org/)
- [HTML to Markdown Converter](https://www.browserling.com/tools/html-to-markdown)

---

Migrating from WordPress to YaPress gives you full control over your content and a faster, more maintainable site. Take your time with the migration and test thoroughly before switching.
