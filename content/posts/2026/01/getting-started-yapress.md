---
title: Getting Started with YaPress in 10 Minutes
slug: getting-started-yapress
date: 2026-01-05
categories:
  - engineering
tags:
  - tutorial
  - getting-started
description: A practical, step-by-step guide to setting up your first YaPress site.
---

Let's get your YaPress site running in 10 minutes. This is a hands-on tutorial—open your terminal and follow along.

## Prerequisites

You need:

- Node.js 18 or higher
- Git
- A code editor (VS Code recommended)

Check your Node version:

```bash
node --version  # Should be 18.0.0 or higher
```

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yusufaytascom/yapress.git my-blog
cd my-blog

# Install dependencies
npm install
```

## Step 2: Start the Dev Server (30 seconds)

```bash
npm run dev
```

Open http://localhost:3000 in your browser. You should see the default YaPress site.

## Step 3: Configure Your Site (2 minutes)

Edit `site.config.ts`:

```typescript
export const siteConfig = {
  title: 'My Developer Blog',
  description: 'Thoughts on code, design, and technology',
  url: 'https://yourdomain.com',
  
  author: {
    name: 'Your Name',
    email: 'you@example.com',
    twitter: '@yourhandle',
  },
  
  social: {
    github: 'https://github.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourprofile',
    mentorCruise: 'https://mentorcruise.com/mentor/yourusername',
    goodreadsAuthorPage: 'https://www.goodreads.com/author/show/your-author-id',
    amazonAuthorPage: 'https://www.amazon.com/author/yourname',
    x: 'https://x.com/yourhandle',
    instagram: 'https://www.instagram.com/yourhandle',
    facebook: 'https://www.facebook.com/yourpage',
    tikTok: 'https://www.tiktok.com/@yourhandle',
    youtube: 'https://www.youtube.com/@yourchannel',
    reddit: 'https://www.reddit.com/user/yourusername',
    researchGate: 'https://www.researchgate.net/profile/Your_Name',
  },
}
```

Save the file. The dev server will reload automatically.

## Step 4: Write Your First Post (3 minutes)

Create `content/posts/hello-world.md`:

```markdown
---
title: Hello World
slug: hello-world
date: 2026-01-05
categories:
  - writing
tags:
  - first-post
description: My first post on my new YaPress blog.
---

This is my first post! I'm excited to start writing.

## Why I Started This Blog

I wanted a simple, fast blog where I own my content. YaPress gives me:

- Full control over my content
- Version control with Git
- Fast static site generation
- Easy deployment

## What's Next

I plan to write about:

- Web development
- Open source projects
- Technical tutorials

Stay tuned!
```

Visit http://localhost:3000/posts/hello-world to see your post.

## Step 5: Customize the About Page (2 minutes)

Edit `content/pages/about.md`:

```markdown
---
title: About
slug: about
description: About me and this blog.
---

Hi, I'm [Your Name], a [your role] based in [your location].

I write about web development, open source, and technology.

## What I Do

- Build web applications
- Contribute to open source
- Share what I learn

## Get in Touch

- Email: you@example.com
- Twitter: @yourhandle
- GitHub: github.com/yourusername
```

## Step 6: Add Categories (1 minute)

Edit `content/categories.ts`:

```typescript
export const categories = {
  engineering: {
    name: 'Engineering',
    description: 'Technical posts about software development',
  },
  writing: {
    name: 'Writing',
    description: 'Thoughts on writing and communication',
  },
  tutorials: {
    name: 'Tutorials',
    description: 'Step-by-step guides and how-tos',
  },
}
```

## Quick Tips

### Validate Your Content

Before committing, check for errors:

```bash
node scripts/validate-content.mjs
```

### Generate RSS Feed

```bash
node scripts/generate-rss.mjs
```

The feed will be available at `/rss.xml`.

### Build for Production

```bash
npm run build
```

Static files will be in the `out/` directory.

### Preview Production Build

```bash
npx serve out
```

## Next Steps

Now that you're set up:

1. **Write more posts**: Add files to `content/posts/`
2. **Customize styling**: Edit `app/globals.css`
3. **Add images**: Place them in `public/images/`
4. **Deploy**: Push to GitHub and deploy to Vercel/Netlify

## Common Issues

### Port 3000 Already in Use

```bash
# Use a different port
PORT=3001 npm run dev
```

### Changes Not Showing

```bash
# Clear the cache
rm -rf .next
npm run dev
```

### Build Errors

Check the validation script output:

```bash
node scripts/validate-content.mjs
```

## File Structure Reference

```
my-blog/
├── content/
│   ├── posts/          # Your blog posts
│   ├── pages/          # Static pages
│   ├── categories.ts   # Category definitions
│   ├── tags.ts         # Tag definitions
│   └── series.ts       # Series definitions
├── public/             # Static assets
├── site.config.ts      # Site configuration
├── src/
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   └── lib/            # Utility functions
└── scripts/            # Build and utility scripts
```

## What You've Learned

- How to install and run YaPress
- How to configure your site
- How to write posts in markdown
- How to validate and build your site

## Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [YaPress Repository](https://github.com/yusufaytascom/yapress)
- [Next.js Docs](https://nextjs.org/docs)

---

You're ready to start blogging! Write your next post and share it with the world.
