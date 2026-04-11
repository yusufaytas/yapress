---
title: Customizing Your YaPress Design
slug: customizing-yapress-design
datePublished: 2026-03-28
categories:
  - engineering
tags:
  - design
  - tailwind
  - customization
description: Practical guide to customizing colors, fonts, and layout in YaPress.
---

Let's make your YaPress site look unique. This guide shows you exactly what to edit and how.

## Understanding the Styling System

YaPress uses Tailwind CSS for styling. You can customize:

- Colors and themes
- Typography
- Layout and spacing
- Components

All without writing much CSS.

## Changing Colors

### Quick Theme Change

Edit `app/globals.css` to change the color scheme:

```css
@layer base {
  :root {
    /* Primary color (links, buttons) */
    --primary: 220 90% 56%;
    
    /* Background colors */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    
    /* Accent colors */
    --accent: 210 40% 96%;
    --accent-foreground: 222 47% 11%;
  }
  
  .dark {
    --primary: 217 91% 60%;
    --background: 222 47% 11%;
    --foreground: 210 40% 98%;
    --accent: 217 33% 17%;
    --accent-foreground: 210 40% 98%;
  }
}
```

### Using Named Colors

Or use Tailwind's color palette:

```css
:root {
  --primary: theme('colors.blue.600');
  --background: theme('colors.white');
  --foreground: theme('colors.gray.900');
}
```

### Testing Your Colors

Restart the dev server to see changes:

```bash
npm run dev
```

## Customizing Typography

### Change Fonts

Edit `src/app/layout.tsx`:

```typescript
import { Inter, Merriweather } from 'next/font/google'

const sans = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
})

const serif = Merriweather({ 
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
})

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

### Font Sizes

Update `src/app/globals.css`:

```css
@layer base {
  html {
    font-size: 16px;
  }
  
  h1 {
    @apply text-4xl font-bold mb-4;
  }
  
  h2 {
    @apply text-3xl font-bold mb-3 mt-8;
  }
  
  h3 {
    @apply text-2xl font-semibold mb-2 mt-6;
  }
  
  p {
    @apply mb-4 leading-relaxed;
  }
}
```

## Customizing Layout

### Change Container Width

Edit `src/components/site-shell.tsx`:

```typescript
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Change max-w-4xl to max-w-6xl for wider layout */}
          {/* Header content */}
        </div>
      </header>
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
```

### Sidebar Layout

Want a sidebar? Update the layout:

```typescript
<main className="flex-1">
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        {children}
      </div>
      <aside className="lg:col-span-1">
        {/* Sidebar content */}
        <div className="sticky top-8">
          <h3 className="font-bold mb-4">Recent Posts</h3>
          {/* Add recent posts component */}
        </div>
      </aside>
    </div>
  </div>
</main>
```

## Customizing Components

### Article Cards

Edit `src/components/article-card.tsx`:

```typescript
export function ArticleCard({ post }: { post: Post }) {
  return (
    <article className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Add featured image */}
      {post.image && (
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}
      
      <h2 className="text-2xl font-bold mb-2">
        <Link href={`/posts/${post.slug}`} className="hover:text-primary">
          {post.title}
        </Link>
      </h2>
      
      <p className="text-muted-foreground mb-4">
        {post.description}
      </p>
      
      <div className="flex items-center justify-between text-sm">
        <time className="text-muted-foreground">
          {formatDate(post.date)}
        </time>
        
        <Link 
          href={`/posts/${post.slug}`}
          className="text-primary hover:underline"
        >
          Read more →
        </Link>
      </div>
    </article>
  )
}
```

### Navigation

Edit the header in `src/components/site-shell.tsx`:

```typescript
<nav className="flex items-center gap-6">
  <Link href="/" className="font-bold text-xl">
    Your Blog Name
  </Link>
  
  <div className="flex gap-4 ml-auto">
    <Link href="/posts" className="hover:text-primary">
      Posts
    </Link>
    <Link href="/categories" className="hover:text-primary">
      Categories
    </Link>
    <Link href="/pages/about" className="hover:text-primary">
      About
    </Link>
    <Link href="/pages/contact" className="hover:text-primary">
      Contact
    </Link>
  </div>
</nav>
```

## Adding Dark Mode Toggle

Create `src/components/theme-toggle.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState('light')
  
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const initial = stored || 'light'
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-accent"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

Add it to your header:

```typescript
import { ThemeToggle } from '@/components/theme-toggle'

// In your header
<nav className="flex items-center gap-6">
  {/* ... other nav items ... */}
  <ThemeToggle />
</nav>
```

## Custom CSS for Markdown

Style your markdown content in `src/app/globals.css`:

```css
@layer base {
  .prose {
    @apply max-w-none;
  }
  
  .prose h2 {
    @apply text-3xl font-bold mt-12 mb-4 border-b pb-2;
  }
  
  .prose h3 {
    @apply text-2xl font-semibold mt-8 mb-3;
  }
  
  .prose code {
    @apply bg-accent px-1.5 py-0.5 rounded text-sm;
  }
  
  .prose pre {
    @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto;
  }
  
  .prose a {
    @apply text-primary hover:underline;
  }
  
  .prose blockquote {
    @apply border-l-4 border-primary pl-4 italic my-6;
  }
}
```

## Adding Custom Fonts

### Using Google Fonts

Already shown above with `next/font/google`.

### Using Local Fonts

Place font files in `public/fonts/` and add to `src/app/globals.css`:

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom-font.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}

:root {
  --font-custom: 'CustomFont', sans-serif;
}
```

## Responsive Design Tips

### Mobile-First Approach

```typescript
<div className="
  text-sm          /* Mobile */
  md:text-base     /* Tablet */
  lg:text-lg       /* Desktop */
">
  Content
</div>
```

### Hide/Show on Different Screens

```typescript
<div className="hidden md:block">
  Only visible on tablet and up
</div>

<div className="md:hidden">
  Only visible on mobile
</div>
```

## Testing Your Changes

### Check Different Viewports

Use browser dev tools to test:

- Mobile: 375px
- Tablet: 768px
- Desktop: 1280px

### Test Dark Mode

Toggle dark mode and check all pages.

### Validate Accessibility

Run Lighthouse in Chrome DevTools:

1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Run accessibility audit

## Quick Customization Checklist

- [ ] Update colors in `src/app/globals.css`
- [ ] Change fonts in `src/app/layout.tsx`
- [ ] Customize header in `src/components/site-shell.tsx`
- [ ] Style article cards in `src/components/article-card.tsx`
- [ ] Add dark mode toggle
- [ ] Test on mobile, tablet, desktop
- [ ] Run accessibility audit

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Google Fonts](https://fonts.google.com/)
- [Color Palette Generator](https://coolors.co/)
- [Tailwind Color Reference](https://tailwindcss.com/docs/customizing-colors)

---

With these customizations, your YaPress site will have a unique look that matches your brand. Experiment and make it yours!
