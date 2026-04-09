---
title: Deploying YaPress to Production
slug: deploying-yapress
date: 2026-02-06
categories:
  - engineering
tags:
  - deployment
  - static-sites
  - devops
description: Step-by-step guide to deploying your YaPress site to Vercel, Netlify, and other platforms.
---

YaPress generates a fully static site, which means you can deploy it anywhere that serves HTML. Let's walk through the actual deployment process for popular platforms.

## Building for Production

First, create a production build:

```bash
npm run build
```

This generates static files in the `out/` directory. The build process:

1. Validates all content files
2. Generates RSS feeds
3. Creates sitemap
4. Renders all pages to static HTML
5. Optimizes assets

## Vercel (Recommended)

Vercel is the easiest option since YaPress is built on Next.js.

### Quick Deploy

```bash
npm install -g vercel
vercel
```

Follow the prompts to link your project.

### Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "framework": "nextjs"
}
```

### Environment Variables

Set these in the Vercel dashboard:

- `NEXT_PUBLIC_SITE_URL`: Your production URL
- `NODE_ENV`: `production`

## Netlify

Netlify works great with static exports.

### Deploy Settings

- **Build command**: `npm run build`
- **Publish directory**: `out`
- **Node version**: 18 or higher

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404
```

### Deploy

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## GitHub Pages

Perfect for project documentation or personal sites.

### Setup

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"

### Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SITE_URL: https://yourusername.github.io/your-repo
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

### Base Path

If deploying to a subdirectory, update `next.config.ts`:

```typescript
const nextConfig = {
  basePath: '/your-repo',
  output: 'export',
  // ... other config
}
```

## Cloudflare Pages

Fast global CDN with generous free tier.

### Deploy via Dashboard

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `out`

### Deploy via CLI

```bash
npm install -g wrangler
wrangler pages deploy out
```

## Self-Hosted

Deploy to your own server with nginx or Apache.

### Build and Transfer

```bash
npm run build
rsync -avz out/ user@yourserver.com:/var/www/html/
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    
    location / {
        try_files $uri $uri.html $uri/ =404;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Docker

Serve with a lightweight container.

### Dockerfile

```dockerfile
FROM nginx:alpine

COPY out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Build and Run

```bash
docker build -t yapress-site .
docker run -p 80:80 yapress-site
```

## Pre-Deployment Checklist

Before deploying, verify:

- [ ] Content validation passes: `node scripts/validate-content.mjs`
- [ ] Build completes without errors
- [ ] RSS feed generates correctly
- [ ] Sitemap includes all pages
- [ ] Images are optimized
- [ ] Environment variables are set
- [ ] Analytics are configured
- [ ] 404 page works
- [ ] Social meta tags are correct

## Post-Deployment

After deploying:

1. Test all major pages
2. Verify RSS feed at `/rss.xml`
3. Check sitemap at `/sitemap.xml`
4. Test social sharing previews
5. Run Lighthouse audit
6. Submit sitemap to search engines

## Continuous Deployment

Set up automatic deployments on content changes:

1. Push to main branch
2. CI runs validation
3. Build executes
4. Deploy to hosting platform
5. Purge CDN cache

Most platforms handle this automatically when connected to your repository.

## Performance Tips

- Enable compression (gzip/brotli)
- Set proper cache headers
- Use a CDN
- Enable HTTP/2
- Optimize images before committing
- Monitor Core Web Vitals

## Troubleshooting

### Build Fails

Check:

- Node version (18+)
- Content validation errors
- Missing dependencies

### 404 Errors

Ensure your hosting platform handles client-side routing correctly. Most need a redirect rule to serve `404.html`.

### Slow Builds

- Reduce image sizes
- Check for circular dependencies
- Clear `.next` cache

---

With these deployment options, you can get your YaPress site live in minutes. Choose the platform that best fits your workflow and scale as needed.
